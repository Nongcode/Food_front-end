export type Author = {
  name: string;
  avatar: string;
  role: string;
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading-2"; text: string }
  | { type: "heading-3"; text: string }
  | { type: "blockquote"; text: string; author?: string }
  | { type: "image"; url: string; caption: string }
  | { type: "tip-box"; title: string; text: string }
  | { type: "list"; items: string[] };

export type DetailedPost = {
  id: number;
  category: string;
  title: string;
  date: string;
  readTime: string;
  author: Author;
  image: string;
  summary: string;
  blocks: ContentBlock[];
  relatedPackageSlug?: string;
  seoDescription: string;
};

export const detailedPosts: Record<number, DetailedPost> = {};