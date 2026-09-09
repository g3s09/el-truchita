import { adminAuthResult } from "@/lib/admin-auth";
import { isSeasonalSettings } from "@/lib/seasonal";
import { readSeasonalSettings, writeSeasonalSettings } from "@/lib/seasonal-storage";

export async function GET(request: Request) {
  const auth = adminAuthResult(request);
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status });
  return Response.json(await readSeasonalSettings(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  const auth = adminAuthResult(request);
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status });
  const payload: unknown = await request.json();
  if (!isSeasonalSettings(payload)) {
    return Response.json({ message: "La configuración de temporadas no es válida." }, { status: 400 });
  }
  try {
    await writeSeasonalSettings(payload);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron guardar las temporadas.";
    return Response.json({ message }, { status: 503 });
  }
}
