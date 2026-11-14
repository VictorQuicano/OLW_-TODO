import type { PlannedDate } from "./item.types";

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_LABELS: Record<Season, string> = {
  spring: "primavera",
  summer: "verano",
  autumn: "otoño",
  winter: "invierno",
};

const YEAR = /^\d{4}$/;
const SEASON = /^(\d{4})-(spring|summer|autumn|winter)$/;
const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DAY = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** True when `value` has the shape its precision requires. */
export function isValidPlannedDate({ value, precision }: PlannedDate): boolean {
  switch (precision) {
    case "someday":
      return value === "someday";
    case "year":
      return YEAR.test(value);
    case "season":
      return SEASON.test(value);
    case "month":
      return MONTH.test(value);
    case "day": {
      const m = DAY.exec(value);
      if (!m) return false;
      const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      return d.getUTCDate() === +m[3];
    }
  }
}

/** Human, Spanish text: "Algún día", "2027", "invierno 2026", "octubre 2026", "12 de octubre de 2026". */
export function formatPlannedDate(date: PlannedDate | undefined): string {
  if (!date || date.precision === "someday") return "Algún día";
  const { value, precision } = date;
  switch (precision) {
    case "year":
      return value;
    case "season": {
      const [year, season] = value.split("-") as [string, Season];
      return `${SEASON_LABELS[season]} ${year}`;
    }
    case "month": {
      const [y, m] = value.split("-").map(Number);
      return new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(y, m - 1, 1)))
        .replace(" de ", " ");
    }
    case "day": {
      const [y, m, d] = value.split("-").map(Number);
      return new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(Date.UTC(y, m - 1, d)),
      );
    }
  }
}
