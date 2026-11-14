"use client";

import { useState } from "react";
import type { DatePrecision } from "@/domain/items/item.types";
import { SEASON_LABELS, SEASONS, type Season } from "@/domain/items/planned-date";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { value: DatePrecision; label: string }[] = [
  { value: "someday", label: "Algún día" },
  { value: "year", label: "Año" },
  { value: "season", label: "Temporada" },
  { value: "month", label: "Mes" },
  { value: "day", label: "Día" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("es", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2000, i, 1))),
);

const inputClass = "min-h-11 rounded-sm border border-line bg-surface px-3 text-ink";

/** Approximate date picker. Submits `datePrecision` + `dateValue` hidden fields. */
export function DateField({ error }: { error?: string }) {
  const thisYear = new Date().getFullYear();
  const [precision, setPrecision] = useState<DatePrecision>("someday");
  const [year, setYear] = useState(String(thisYear));
  const [season, setSeason] = useState<Season>("summer");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [day, setDay] = useState("");

  const value = { someday: "someday", year, season: `${year}-${season}`, month: `${year}-${month}`, day }[precision];

  return (
    <fieldset>
      <legend className="text-meta font-medium text-ink">¿Cuándo, más o menos?</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-meta transition-colors duration-(--duration-fast)",
              "has-focus-visible:outline-2 has-focus-visible:outline-accent",
              precision === o.value ? "border-accent bg-accent-soft text-accent" : "border-line text-ink",
            )}
          >
            <input
              type="radio"
              name="datePrecisionPicker"
              value={o.value}
              checked={precision === o.value}
              onChange={() => setPrecision(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {precision === "month" && (
          <select aria-label="Mes" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass}>
            {MONTHS.map((label, i) => (
              <option key={label} value={String(i + 1).padStart(2, "0")}>
                {label}
              </option>
            ))}
          </select>
        )}
        {(precision === "year" || precision === "season" || precision === "month") && (
          <input
            aria-label="Año"
            type="number"
            inputMode="numeric"
            min={thisYear - 1}
            max={thisYear + 20}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={cn(inputClass, "w-28")}
          />
        )}
        {precision === "season" && (
          <select aria-label="Temporada" value={season} onChange={(e) => setSeason(e.target.value as Season)} className={inputClass}>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {SEASON_LABELS[s]}
              </option>
            ))}
          </select>
        )}
        {precision === "day" && (
          <input aria-label="Día" type="date" required value={day} onChange={(e) => setDay(e.target.value)} className={inputClass} />
        )}
      </div>

      <input type="hidden" name="datePrecision" value={precision} />
      <input type="hidden" name="dateValue" value={value} />
      {error && <p className="mt-2 text-meta text-danger">{error}</p>}
    </fieldset>
  );
}
