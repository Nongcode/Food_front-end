export function getBackendBaseUrl() {
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
}

function buildApiUrl(path: string, locale?: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = typeof window === "undefined" ? getBackendBaseUrl() : window.location.origin;
  if (!baseUrl) return null;

  const url = new URL(normalizedPath, baseUrl);
  if (locale) url.searchParams.set("locale", locale);
  return typeof window === "undefined" ? url.toString() : `${url.pathname}${url.search}`;
}

export async function publicApiFetch<T>(path: string, locale?: string, fallback?: T): Promise<T> {
  const apiUrl = buildApiUrl(path, locale);
  if (!apiUrl) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing backend URL for public API ${path}`);
  }

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Public API ${path} failed with ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch public API ${path}:`, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}