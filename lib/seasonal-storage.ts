import { head, put } from "@vercel/blob";
import {
  defaultSeasonalSettings,
  isSeasonalSettings,
  SeasonalSettings,
} from "./seasonal";

const seasonalPath = "el-truchita/seasonal.json";

function hasSeasonalStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readSeasonalSettings(): Promise<SeasonalSettings> {
  if (!hasSeasonalStorage()) return defaultSeasonalSettings();
  try {
    const blob = await head(seasonalPath);
    const response = await fetch(blob.url, { cache: "no-store" });
    const settings: unknown = await response.json();
    return isSeasonalSettings(settings) ? settings : defaultSeasonalSettings();
  } catch {
    return defaultSeasonalSettings();
  }
}

export async function writeSeasonalSettings(settings: SeasonalSettings) {
  if (!hasSeasonalStorage()) {
    throw new Error("Conecta Vercel Blob antes de guardar la configuración de temporadas.");
  }
  let etag: string | undefined;
  try {
    etag = (await head(seasonalPath)).etag;
  } catch {
    // La primera actualización crea el archivo de temporadas.
  }
  return put(seasonalPath, JSON.stringify(settings), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    ...(etag ? { ifMatch: etag } : {}),
  });
}
