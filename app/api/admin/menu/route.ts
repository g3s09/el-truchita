import { adminAuthResult } from '@/lib/admin-auth';
import { isMenuData } from '@/lib/menu';
import { readMenu, writeMenu } from '@/lib/menu-storage';

export async function GET(request: Request) {
  const auth = adminAuthResult(request);
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status });
  return Response.json(await readMenu(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const auth = adminAuthResult(request);
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status });

  const payload: unknown = await request.json();
  if (!isMenuData(payload)) {
    return Response.json({ message: 'Los datos del menú no tienen un formato válido.' }, { status: 400 });
  }

  try {
    await writeMenu({ ...payload, updatedAt: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron guardar los cambios.';
    return Response.json({ message }, { status: 503 });
  }
}
