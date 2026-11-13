import type { NextConfig } from "next";

// Admin của BE được mở qua domain FE (FE rewrite /admin, /api sang BE).
// Đặt assetPrefix riêng để file tĩnh /_next/* của BE không đụng file của FE:
// trình duyệt tải /be-static/_next/... và FE rewrite /be-static/* sang BE (Next >= 15 tự phục vụ đường dẫn này).
// Xem node_modules/next/dist/docs/01-app/02-guides/multi-zones.md
const BE_ASSET_PREFIX = "/be-static";

const nextConfig: NextConfig = {
  assetPrefix: BE_ASSET_PREFIX,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
