import { getLocaleFromRequest, getSpecialtyDetailPayload, publicJson } from "../../_data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const payload = await getSpecialtyDetailPayload(slug, getLocaleFromRequest(request));
  return payload ? publicJson(payload) : publicJson({ message: "Specialty not found" }, { status: 404 });
}
