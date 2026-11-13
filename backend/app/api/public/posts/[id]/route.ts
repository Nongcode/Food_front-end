import { getLocaleFromRequest, getPostDetailPayload, publicJson } from "../../_data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const payload = await getPostDetailPayload(id, getLocaleFromRequest(request));
  return payload ? publicJson(payload) : publicJson({ message: "Post not found" }, { status: 404 });
}
