import { getPublicSiteChromeState } from "@/lib/publicContent";

export async function isSitePageInactive(settingKey: string) {
  const payload = await getPublicSiteChromeState("vi");
  return payload.pageStatuses?.[settingKey] === "inactive";
}