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

  if (month === 9) return "patrias";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 3))
    return "muertos";
  if (month === 12 || (month === 1 && day <= 6)) return "navidad";
  return null;
}

const ornaments: Record<Season, string[]> = {
  patrias: ["✦", "♫", "✦", "⚑", "✦", "♫", "✦"],
  muertos: ["🌼", "✦", "☠", "✦", "🕯", "✦", "🌼"],
  navidad: ["✦", "●", "✦", "✦", "●", "✦", "✦"],
};

/** Viste el sitio únicamente durante fechas mexicanas y se retira por sí solo. */
export default function SeasonalAccent() {
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    const syncSeason = () => setSeason(currentSeason());
    syncSeason();
    const timer = window.setInterval(syncSeason, 30 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (season) document.documentElement.dataset.season = season;
    else delete document.documentElement.dataset.season;
    return () => {
      delete document.documentElement.dataset.season;
    };
  }, [season]);

  if (!season) return null;

  return (
    <div className={"seasonal-dress seasonal-" + season} aria-hidden="true">
      <div className="seasonal-garland">
        {ornaments[season].map((ornament, index) => (
          <i key={index}>{ornament}</i>
        ))}
      </div>
    </div>
  );
}
