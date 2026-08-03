import Link from "next/link";
import { PageDisabled } from "../../components/PageDisabled";
import { JsonLd } from "../../components/JsonLd";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { ReadingProgressBar } from "../../components/PostProgress";
import { PostSidebar } from "../../components/PostSidebar";
import { PostCard } from "../../components/PostCard";
import { ContentBlock } from "../../data/postsContent";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, indexRobots, publicAlternates } from "@/lib/seo";
import { isSitePageInactive } from "@/lib/siteSettings";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicPostDetail, getPublicPosts } from "@/lib/publicContent";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));
const PUBLISHED_STATUS = "Đã xuất bản";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];

function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "zh-CN") return "zh-CN";
  return "vi-VN";
}

export async function generateStaticParams() {
  const { posts } = await getPublicPosts("vi");
  return posts.map((post) => ({ id: String(post.id) }));
}
export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const payload = await getPublicPostDetail(id, "vi");
  const post = payload?.post;

  if (!post) {
    return { title: "Không tìm thấy bài viết | Sơn La Food" };
  }
  const title = `${post.title} | Câu chuyện ẩm thực Sơn La`;
  const description = post.summary || undefined;
  const path = `/tin-tuc/${post.id}`;
  const url = absoluteUrl(path);
  const imageUrl = post.image || absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title,
    description,
    alternates: publicAlternates(path),
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: imageUrl }],
    },
    robots: indexRobots,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  if (await isSitePageInactive("page_news_status")) {
    return <PageDisabled pageName="Tin tức & Cẩm nang" />;
  }

  const { id } = await params;
  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const dateLocale = getDateLocale(locale);

  const payload = await getPublicPostDetail(id, locale);
  if (!payload) notFound();

  const { post, relatedPackage, relatedPosts } = payload;
  const headings = (post.blocks as ContentBlock[])
    .filter((block): block is Extract<ContentBlock, { type: "heading-2" }> => block.type === "heading-2")
    .map((block) => ({ id: slugify(block.text), text: block.text }));
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://sonlafood.vn"}/tin-tuc/${post.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: [post.image],
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: [{
      "@type": "Person",
      name: post.author.name,
    }],
    publisher: {
      "@type": "Organization",
      name: "Sơn La Food",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
      },
    },
  };

  return (
    <main className="post-detail-page">
      <JsonLd data={jsonLd} />
      <ReadingProgressBar />
      <SiteHeader variant="hero" />

      <section
        className="page-hero post-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 20, 17, 0.6) 0%, rgba(10, 20, 17, 0.85) 100%), url(${post.image})`,
        }}
      >
        <div className="post-hero-content">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href={withLocalePrefix("/", locale)}>{t("postDetail", "home", "Trang chủ")}</Link>
            <span className="separator">/</span>
            <Link href={withLocalePrefix("/tin-tuc", locale)}>{t("postDetail", "news", "Tin tức")}</Link>
            <span className="separator">/</span>
            <span className="current">{post.category}</span>
          </nav>

          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>

          <div className="post-author-meta">
            <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
            <div className="author-info">
              <strong>{post.author.name}</strong>
              <span>{post.author.role}</span>
            </div>
            <div className="meta-divider" />
            <div className="post-time-meta">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="post-detail-shell">
        <div className="post-detail-layout">
          <PostSidebar headings={headings} title={post.title} />

          <article className="article-body">
            <p className="article-lead-summary">{post.summary}</p>

            {(post.blocks as ContentBlock[]).map((block, index) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={index}>{block.text}</p>;
                case "heading-2":
                  return (
                    <h2 key={index} id={slugify(block.text)}>
                      {block.text}
                    </h2>
                  );
                case "heading-3":
                  return <h3 key={index}>{block.text}</h3>;
                case "blockquote":
                  return (
                    <blockquote key={index}>
                      <p>{block.text}</p>
                      {block.author && <cite>{block.author}</cite>}
                    </blockquote>
                  );
                case "image":
                  return (
                    <figure key={index} className="article-figure">
                      <img src={block.url} alt={block.caption} />
                      <figcaption>{block.caption}</figcaption>
                    </figure>
                  );
                case "tip-box":
                  return (
                    <div key={index} className="article-tip-box">
                      <h4>{block.title}</h4>
                      <p>{block.text}</p>
                    </div>
                  );
                case "list":
                  return (
                    <ul key={index} className="article-list">
                      {block.items.map((item, itemIndex) => (
                        <li key={`${item}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}

            {relatedPackage && (
              <div className="article-cta-package">
                <div className="cta-package-image" style={{ backgroundImage: `url(${relatedPackage.image})` }} />
                <div className="cta-package-content">
                  <span className="cta-badge">{t("postDetail", "package_badge", "Gợi ý combo")}</span>
                  <h3>{t("postDetail", "package_title_prefix", "Combo Sơn La Food")}: {relatedPackage.name}</h3>
                  <p>{relatedPackage.summary}</p>
                  <div className="cta-package-details">
                    <span>{relatedPackage.duration}</span>
                    <span>{relatedPackage.price}</span>
                  </div>
                  <div className="cta-package-actions">
                    <Link href={withLocalePrefix("/combo-dac-san/" + relatedPackage.slug, locale)} className="cta-primary">
                      {t("postDetail", "view_package", "Xem chi tiết combo")}
                    </Link>
                    <Link href={withLocalePrefix("/lien-he", locale)} className="cta-secondary">
                      {t("postDetail", "consult_group", "Nhận tư vấn nhóm")}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="related-posts-section">
        <div className="section-container">
          <div className="section-heading compact">
            <p className="eyebrow">{t("postDetail", "related_eyebrow", "Đọc tiếp cẩm nang")}</p>
            <h2>{t("postDetail", "related_title", "Bài viết liên quan bạn có thể thích")}</h2>
          </div>

          <div className="post-grid">
            {relatedPosts.map((relatedPost) => (
              <PostCard post={relatedPost} key={relatedPost.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

