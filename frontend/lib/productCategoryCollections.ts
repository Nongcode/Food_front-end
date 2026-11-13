import type { PublicPackage, PublicPackageCollection } from "@/lib/packages";

type ProductCategoryAccent = "family" | "youth" | "vietnam" | "gift" | "spice" | "fruit";

const productCategoryOrder: ProductCategoryAccent[] = ["family", "youth", "vietnam", "gift", "spice", "fruit"];

const productCategoryCopyByAccent: Record<ProductCategoryAccent, Pick<PublicPackageCollection, "eyebrow" | "title" | "description">> = {
  family: {
    eyebrow: "DANH MỤC GIA ĐÌNH",
    title: "Món ngon dùng hằng ngày",
    description: "Các đặc sản dễ ăn, dễ chế biến và phù hợp cho bữa cơm nhà hoặc mua thử lần đầu.",
  },
  youth: {
    eyebrow: "ĐỒ ĂN CHIA SẺ",
    title: "Món nhỏ gọn cho bạn bè",
    description: "Đồ khô, gia vị và sản phẩm đóng gói tiện mang đi chơi, picnic hoặc tặng người thân.",
  },
  vietnam: {
    eyebrow: "ĐẶC SẢN TIÊU BIỂU",
    title: "Hương vị Sơn La nên thử",
    description: "Những sản phẩm đại diện cho ẩm thực Tây Bắc, phù hợp để khách mới dễ chọn đúng món.",
  },
  gift: {
    eyebrow: "QUÀ BIẾU",
    title: "Set quà chỉn chu theo dịp",
    description: "Các sản phẩm có thể phối thành hộp quà, giỏ quà hoặc set biếu tặng cho đối tác và gia đình.",
  },
  spice: {
    eyebrow: "GIA VỊ TÂY BẮC",
    title: "Mắc khén, chẩm chéo và đồ chấm",
    description: "Nhóm gia vị giúp món nướng, món luộc và trái cây xanh rõ hương vị Sơn La hơn.",
  },
  fruit: {
    eyebrow: "NÔNG SẢN THEO MÙA",
    title: "Trái cây và sản phẩm mùa vụ",
    description: "Mận hậu, xoài Yên Châu và các món sấy đóng gói theo lịch thu hái thực tế.",
  },
};

const productCategoryKeywords: Record<ProductCategoryAccent, string[]> = {
  family: ["combo", "dac-san", "dung-thu", "gia-dinh", "gac-bep", "thit"],
  youth: ["do-kho", "gia-vi", "trai-cay", "say", "combo", "qua"],
  vietnam: [],
  gift: ["qua", "set-qua", "gift", "hop-qua", "gio-qua", "moc-chau"],
  spice: ["gia-vi", "cham-cheo", "mac-khen", "cay-thom"],
  fruit: ["trai-cay", "yen-chau", "xoai", "man", "say", "theo-mua"],
};

function getPackageSearchText(item: PublicPackage) {
  return [
    item.slug,
    item.name,
    item.destination,
    item.rawDestination,
    item.duration,
    item.summary,
    item.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFallbackCategoryItems(accent: ProductCategoryAccent, packages: PublicPackage[]) {
  const keywords = productCategoryKeywords[accent];
  if (keywords.length === 0) return packages;

  const matched = packages.filter((item) => {
    const searchText = getPackageSearchText(item);
    return keywords.some((keyword) => searchText.includes(keyword));
  });

  return matched.length > 0 ? matched : packages;
}

export function ensureFullProductCollections(
  packageCollections: PublicPackageCollection[],
  packages: PublicPackage[],
): PublicPackageCollection[] {
  const collectionByAccent = new Map(packageCollections.map((collection) => [collection.accent, collection]));

  return productCategoryOrder.map((accent) => {
    const sourceCollection = collectionByAccent.get(accent);
    const copy = productCategoryCopyByAccent[accent];

    return {
      key: sourceCollection?.key || accent,
      accent,
      eyebrow: copy.eyebrow,
      title: copy.title,
      description: copy.description,
      items: sourceCollection?.items?.length ? sourceCollection.items : getFallbackCategoryItems(accent, packages),
    };
  });
}