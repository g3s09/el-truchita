import { readSeasonalSettings } from "@/lib/seasonal-storage";

export async function GET() {
  return Response.json(await readSeasonalSettings(), {
    headers: { "Cache-Control": "no-store" },
  });
}
