import { put } from '@vercel/blob';
import { adminAuthResult } from '@/lib/admin-auth';
import { hasMenuStorage } from '@/lib/menu-storage';

const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = adminAuthResult(request);
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status });
  if (!hasMenuStorage()) return Response.json({ message: 'Conecta Vercel Blob antes de subir imágenes.' }, { status: 503 });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return Response.json({ message: 'Selecciona una imagen válida.' }, { status: 400 });
  }
  if (file.size > maxFileSize) {
    return Response.json({ message: 'La imagen debe pesar menos de 5 MB.' }, { status: 400 });
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const blob = await put(`el-truchita/imagenes/${Date.now()}-${safeName}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return Response.json({ url: blob.url });
}
