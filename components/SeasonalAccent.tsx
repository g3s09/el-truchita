"use client";

import { useEffect, useState } from "react";

type Season = "patrias" | "muertos" | "navidad";

function currentSeason(): Season | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const value = (kind: string) =>
    Number(parts.find((part) => part.type === kind)?.value ?? 0);
  const month = value("month");
  const day = value("day");

  if (month === 9 && day <= 16) return "patrias";
  if ((month === 10 && day >= 28) || (month === 11 && day <= 2)) return "muertos";
  if ((month === 12 && day >= 16) || (month === 1 && day <= 6)) return "navidad";
  return null;
}

const accents: Record<Season, string[]> = {
  patrias: ["🇲🇽", "🎸", "〰", "🇲🇽"],
  muertos: ["🌼", "☠", "🕯", "🌼"],
  navidad: ["🎄", "✦", "🔔", "🎄"],
};

/** Ornamento pequeño: aparece únicamente en celebraciones mexicanas definidas. */
export default function SeasonalAccent() {
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSeason(currentSeason()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!season) return null;

  return (
    <div className={"seasonal-accent seasonal-" + season} aria-hidden="true">
      {accents[season].map((accent, index) => (
        <i key={index}>{accent}</i>
      ))}
    </div>
  );
}
