import { head, put } from '@vercel/blob';
import { defaultMenu, isMenuData, MenuData, normalizeMenu } from './menu';

const menuPath = 'el-truchita/menu.json';

export function hasMenuStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readMenu(): Promise<MenuData> {
  if (!hasMenuStorage()) return defaultMenu;

  try {
    const blob = await head(menuPath);
    const response = await fetch(blob.url, { cache: 'no-store' });
    const menu: unknown = await response.json();
    return isMenuData(menu) ? normalizeMenu(menu) : defaultMenu;
  } catch {
    return defaultMenu;
  }
}

export async function writeMenu(menu: MenuData) {
  if (!hasMenuStorage()) {
    throw new Error('Conecta Vercel Blob antes de guardar cambios.');
  }

  let etag: string | undefined;
  try {
    etag = (await head(menuPath)).etag;
  } catch {
    // The first save creates the menu file.
  }

  return put(menuPath, JSON.stringify(menu), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    ...(etag ? { ifMatch: etag } : {}),
  });
}
