import { getLocaleFromRequest, getPackagesPayload, publicJson } from "../_data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return publicJson(await getPackagesPayload(getLocaleFromRequest(request)));
}
