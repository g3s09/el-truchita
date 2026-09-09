"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  activeSeason,
  defaultSeasonalSettings,
  isSeasonalSettings,
  SeasonDefinition,
  SeasonId,
  SeasonalSettings,
  SEASON_PREVIEW_STORAGE_KEY,
} from "@/lib/seasonal";

function readPreview(): SeasonId | null {
  const value = localStorage.getItem(SEASON_PREVIEW_STORAGE_KEY);
  return value && value !== "auto" ? (value as SeasonId) : null;
}

function phraseFor(season: SeasonDefinition) {
  return season.phrases[Math.floor(Math.random() * season.phrases.length)] ?? "";
}

/** Renderiza una edición temporal sin bloquear el pedido ni el contenido. */
export default function SeasonalAccent() {
  const [settings, setSettings] = useState<SeasonalSettings>(
    defaultSeasonalSettings,
  );
  const [preview, setPreview] = useState<SeasonId | null>(null);
  const [season, setSeason] = useState<SeasonDefinition | null>(null);
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    let active = true;
    setPreview(readPreview());
    fetch("/api/seasonal", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (active && isSeasonalSettings(data)) setSettings(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sync = () => setSeason(activeSeason(undefined, settings, preview));
    sync();
    const interval = window.setInterval(sync, 30 * 60 * 1000);
    const storage = (event: StorageEvent) => {
      if (event.key === SEASON_PREVIEW_STORAGE_KEY) setPreview(readPreview());
    };
    window.addEventListener("storage", storage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", storage);
    };
  }, [preview, settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (season) {
      root.dataset.season = season.id;
      root.style.setProperty("--season-accent", season.palette.accent);
      root.style.setProperty("--season-secondary", season.palette.secondary);
      root.style.setProperty("--season-glow", season.palette.glow);
      const phraseKey = `truchita-seasonal-phrase-${season.id}`;
      const wasShown = window.sessionStorage.getItem(phraseKey);
      const nextPhrase = wasShown ? "" : phraseFor(season);
      setPhrase(nextPhrase);
      if (nextPhrase) window.sessionStorage.setItem(phraseKey, "1");
    } else {
      delete root.dataset.season;
      setPhrase("");
    }
    return () => {
      delete root.dataset.season;
      root.style.removeProperty("--season-accent");
      root.style.removeProperty("--season-secondary");
      root.style.removeProperty("--season-glow");
    };
  }, [season]);

  if (!season) return null;

  return (
    <div
      className={
        "seasonal-dress seasonal-" + season.id + " intensity-" + season.intensity
      }
      data-intensity={season.intensity}
      style={
        {
          "--season-accent": season.palette.accent,
          "--season-secondary": season.palette.secondary,
          "--season-glow": season.palette.glow,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="seasonal-ribbon" />
      {season.asset && (
        <img
          className={"seasonal-art " + (season.placement ?? "top-right")}
          src={season.asset}
          alt=""
          loading="lazy"
        />
      )}
      <span className="seasonal-edition-label">
        {season.name.toUpperCase()} · EDICIÓN AL CARBÓN
      </span>
      {phrase ? <span className="seasonal-phrase">{phrase}</span> : null}
    </div>
  );
}
