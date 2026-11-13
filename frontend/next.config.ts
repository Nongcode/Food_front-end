import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

const nextConfig: NextConfig = {
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
  async rewrites() {
    if (!backendUrl) return [];

    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/admin/:path*", destination: `${backendUrl}/admin/:path*` },
      // File tĩnh của BE (BE đặt assetPrefix "/be-static") — cần cho trang /admin mở qua domain FE
      { source: "/be-static/:path+", destination: `${backendUrl}/be-static/:path+` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;