import { getLocaleFromRequest, getPackageDetailPayload, publicJson } from "../../_data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const payload = await getPackageDetailPayload(slug, getLocaleFromRequest(request));
  return payload ? publicJson(payload) : publicJson({ message: "Package not found" }, { status: 404 });
}
