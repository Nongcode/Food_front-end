import { getLocaleFromRequest, getSpecialtiesPayload, publicJson } from "../_data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return publicJson(await getSpecialtiesPayload(getLocaleFromRequest(request)));
}
