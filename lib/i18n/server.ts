import { headers } from "next/headers";
import { DEFAULT_LOCALE, normalizeLocale, SupportedLocale } from "./config";
import { defaultLanguages, defaultStaticTranslations } from "./defaults";
import { localSpecialtyStaticTranslations } from "./localSpecialtyDefaults";
import { normalizeLegacyText } from "@/lib/text/encoding";
import { publicApiFetch } from "@/lib/publicApi";

export type TranslationMap = Record<string, string>;

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
};

function getDefaultTranslationMap(locale: string): TranslationMap {
  const normalizedLocale = normalizeLocale(locale);
  const map: TranslationMap = {};
  for (const item of [...defaultStaticTranslations, ...localSpecialtyStaticTranslations]) {
    const value = item.values[normalizedLocale] || item.values[DEFAULT_LOCALE];
    if (value) map[item.namespace + "." + item.key] = normalizeLegacyText(value);
  }
  return map;
}

function getFallbackLanguages(): LanguageOption[] {
  return defaultLanguages
    .filter((language) => language.isActive)
    .map((language) => ({
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag,
      isActive: language.isActive,
      isDefault: language.isDefault,
    }));
}

export async function getRequestLocale(): Promise<SupportedLocale> {
  const headerList = await headers();
  return normalizeLocale(headerList.get("x-locale"));
}

export async function ensureDefaultI18nData() {
  return;
}

export async function getStaticTranslationMap(locale: string): Promise<TranslationMap> {
  const normalizedLocale = normalizeLocale(locale);
  const fallback = getDefaultTranslationMap(normalizedLocale);
  const payload = await publicApiFetch<{ staticTranslations: TranslationMap }>("/api/public/site-chrome", normalizedLocale, { staticTranslations: fallback });
  return { ...fallback, ...(payload.staticTranslations || {}) };
}

export function translateFromMap(map: TranslationMap, namespace: string, key: string, fallback: string) {
  return map[namespace + "." + key] || fallback;
}

export async function localizeContent<T extends Record<string, unknown>>(_entityType: "post" | "package" | "local_specialty" | "local_specialty_detail", entity: T): Promise<T> {
  return entity;
}

export async function getActiveLanguages(): Promise<LanguageOption[]> {
  const payload = await publicApiFetch<{ activeLanguages: LanguageOption[] }>("/api/public/site-chrome", DEFAULT_LOCALE, { activeLanguages: getFallbackLanguages() });
  return payload.activeLanguages?.length ? payload.activeLanguages : getFallbackLanguages();
}