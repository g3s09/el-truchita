export const SEASON_PREVIEW_STORAGE_KEY = "truchita-season-preview";

export type SeasonId =
  | "patrias"
  | "muertos"
  | "navidad"
  | "reyes"
  | "candelaria"
  | "amor"
  | "primavera"
  | "nino"
  | "madres"
  | "padres";

export type SeasonIntensity = "edition" | "accent";
type MonthDay = { month: number; day: number };
type SeasonRule =
  | { kind: "range"; start: MonthDay; end: MonthDay }
  | { kind: "day"; date: MonthDay }
  | { kind: "father-day" };

export type SeasonDefinition = {
  id: SeasonId;
  name: string;
  priority: number;
  enabled: boolean;
  intensity: SeasonIntensity;
  rule: SeasonRule;
  asset?: string;
  placement?: "top-right" | "bottom-left" | "top-left" | "bottom-right";
  palette: { accent: string; secondary: string; glow: string };
  phrases: string[];
};

export type MexicoCalendarDay = { year: number; month: number; day: number };
export type SeasonalSettings = {
  active: boolean;
  enabled: Record<SeasonId, boolean>;
};

export const seasonDefinitions: SeasonDefinition[] = [
  {
    id: "patrias",
    name: "Mes Patrio",
    priority: 100,
    enabled: true,
    intensity: "edition",
    rule: { kind: "range", start: { month: 9, day: 1 }, end: { month: 9, day: 30 } },
    asset: "/seasonal/patrias-corner.png",
    placement: "top-right",
    palette: { accent: "#18864c", secondary: "#d73822", glow: "#f3bc31" },
    phrases: [
      "Viva México. Y viva el que pidió con extra queso.",
      "El grito se escucha mejor con una charola bien armada.",
    ],
  },
  {
    id: "muertos",
    name: "Día de Muertos",
    priority: 95,
    enabled: true,
    intensity: "edition",
    rule: { kind: "range", start: { month: 10, day: 24 }, end: { month: 11, day: 3 } },
    asset: "/seasonal/muertos-corner.png",
    placement: "bottom-left",
    palette: { accent: "#ef9825", secondary: "#652d73", glow: "#f4c36c" },
    phrases: [
      "El antojo no descansa ni en el más allá.",
      "Si vuelve el muerto, que vuelva con limón y queso.",
    ],
  },
  {
    id: "navidad",
    name: "Posadas y Navidad",
    priority: 90,
    enabled: true,
    intensity: "edition",
    rule: { kind: "range", start: { month: 12, day: 1 }, end: { month: 1, day: 6 } },
    asset: "/seasonal/navidad-corner.png",
    placement: "top-left",
    palette: { accent: "#b62e28", secondary: "#1d704c", glow: "#f4d58b" },
    phrases: [
      "La dieta pidió vacaciones. Se las concedimos.",
      "En esta posada se pide esquite, no permiso.",
    ],
  },
  {
    id: "reyes",
    name: "Día de Reyes",
    priority: 91,
    enabled: true,
    intensity: "edition",
    rule: { kind: "range", start: { month: 1, day: 1 }, end: { month: 1, day: 6 } },
    asset: "/seasonal/reyes-corner.png",
    placement: "bottom-right",
    palette: { accent: "#d59a2a", secondary: "#2a4772", glow: "#f7cf6c" },
    phrases: [
      "Si te salió el muñeco, mínimo que te salga un esquite.",
      "La corona es tuya; la charola también debería serlo.",
    ],
  },
  {
    id: "candelaria",
    name: "Día de la Candelaria",
    priority: 30,
    enabled: true,
    intensity: "accent",
    rule: { kind: "day", date: { month: 2, day: 2 } },
    palette: { accent: "#d6862f", secondary: "#7d4a25", glow: "#f4bd4f" },
    phrases: ["El tamal tiene competencia; que gane el antojo."],
  },
  {
    id: "amor",
    name: "Amor y Amistad",
    priority: 30,
    enabled: true,
    intensity: "accent",
    rule: { kind: "day", date: { month: 2, day: 14 } },
    palette: { accent: "#c13b44", secondary: "#6d2631", glow: "#ef8b68" },
    phrases: ["El amor dura; el esquite se acaba. Pide dos."],
  },
  {
    id: "primavera",
    name: "Inicio de Primavera",
    priority: 20,
    enabled: true,
    intensity: "accent",
    rule: { kind: "range", start: { month: 3, day: 20 }, end: { month: 3, day: 24 } },
    palette: { accent: "#7c9b41", secondary: "#d49b2e", glow: "#c7d15b" },
    phrases: ["Floreció el antojo. No lo dejes marchitar."],
  },
  {
    id: "nino",
    name: "Día del Niño",
    priority: 30,
    enabled: true,
    intensity: "accent",
    rule: { kind: "day", date: { month: 4, day: 30 } },
    palette: { accent: "#3a8fc3", secondary: "#e14e31", glow: "#f5bd27" },
    phrases: ["Modo arcade: un antojo extra desbloqueado."],
  },
  {
    id: "madres",
    name: "Día de las Madres",
    priority: 30,
    enabled: true,
    intensity: "accent",
    rule: { kind: "day", date: { month: 5, day: 10 } },
    palette: { accent: "#cc5c68", secondary: "#865163", glow: "#f1b18d" },
    phrases: ["Para mamá, una charola con todo el cariño y todo el queso."],
  },
  {
    id: "padres",
    name: "Día del Padre",
    priority: 30,
    enabled: true,
    intensity: "accent",
    rule: { kind: "father-day" },
    palette: { accent: "#3d6589", secondary: "#33414e", glow: "#d5a453" },
    phrases: ["Para papá: una charola seria, aunque él no tanto."],
  },
];

export const seasonById = Object.fromEntries(
  seasonDefinitions.map((season) => [season.id, season]),
) as Record<SeasonId, SeasonDefinition>;

export function defaultSeasonalSettings(): SeasonalSettings {
  return {
    active: true,
    enabled: Object.fromEntries(
      seasonDefinitions.map((season) => [season.id, season.enabled]),
    ) as Record<SeasonId, boolean>,
  };
}

export function isSeasonalSettings(value: unknown): value is SeasonalSettings {
  if (!value || typeof value !== "object" || !("enabled" in value)) return false;
  if (typeof (value as { active?: unknown }).active !== "boolean") return false;
  const enabled = (value as { enabled?: unknown }).enabled;
  return (
    !!enabled &&
    typeof enabled === "object" &&
    seasonDefinitions.every(
      (season) => typeof (enabled as Record<string, unknown>)[season.id] === "boolean",
    )
  );
}

export function mexicoCalendarDay(now = new Date()): MexicoCalendarDay {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const number = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: number("year"), month: number("month"), day: number("day") };
}

function stamp(date: MonthDay) {
  return date.month * 100 + date.day;
}

function isThirdSundayOfJune(day: MexicoCalendarDay) {
  if (day.month !== 6) return false;
  return new Date(Date.UTC(day.year, 5, day.day)).getUTCDay() === 0 && day.day >= 15 && day.day <= 21;
}

function matchesRule(rule: SeasonRule, day: MexicoCalendarDay) {
  if (rule.kind === "father-day") return isThirdSundayOfJune(day);
  if (rule.kind === "day")
    return day.month === rule.date.month && day.day === rule.date.day;

  const current = stamp(day);
  const start = stamp(rule.start);
  const end = stamp(rule.end);
  return start <= end ? current >= start && current <= end : current >= start || current <= end;
}

export function activeSeason(
  day = mexicoCalendarDay(),
  settings = defaultSeasonalSettings(),
  preview: SeasonId | null = null,
) {
  if (preview) return settings.enabled[preview] ? seasonById[preview] : null;
  if (!settings.active) return null;
  return seasonDefinitions
    .filter((season) => settings.enabled[season.id] && matchesRule(season.rule, day))
    .sort((left, right) => right.priority - left.priority)[0] ?? null;
}
