import { readMenu } from '@/lib/menu-storage';

export async function GET() {
  return Response.json(await readMenu(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
