import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/adminAuth";

const DEFAULT_HOMEPAGE_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=85";

async function setBannerMediaType(id: number, mediaType: string) {
  await prisma.$executeRaw`UPDATE banners SET media_type = ${mediaType} WHERE id = ${id}`;
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existingFoodBanner = await prisma.banner.findFirst({
    where: {
      bannerType: "homepage",
      imageUrl: DEFAULT_HOMEPAGE_IMAGE,
    },
  });

  const data = {
    title: "Đặc sản Sơn La giao tận nhà",
    subtitle: "Combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và nông sản theo mùa được tuyển chọn kỹ.",
    imageUrl: DEFAULT_HOMEPAGE_IMAGE,
    bannerType: "homepage",
    status: "Đang mở",
  };

  const banner = existingFoodBanner
    ? await prisma.banner.update({
        where: { id: existingFoodBanner.id },
        data,
      })
    : await prisma.banner.create({ data });

  await setBannerMediaType(banner.id, "image");

  return NextResponse.json({ success: true, banner: { ...banner, mediaType: "image" } });
}