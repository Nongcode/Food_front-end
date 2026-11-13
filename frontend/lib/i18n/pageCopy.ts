import { getRequestLocale, getStaticTranslationMap, translateFromMap } from "./server";

/** Lấy hàm dịch cho phần chữ tĩnh (metadata, hero) của một trang server theo ngôn ngữ của request. */
export async function getPageTranslator(namespace: string) {
  const locale = await getRequestLocale();
  const map = await getStaticTranslationMap(locale);
  return {
    locale,
    tr: (key: string, fallback: string) => translateFromMap(map, namespace, key, fallback),
  };
}
