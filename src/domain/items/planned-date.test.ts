import { describe, expect, it } from "vitest";
import { formatPlannedDate, isValidPlannedDate } from "./planned-date";

describe("formatPlannedDate", () => {
  it.each([
    [undefined, "Algún día"],
    [{ value: "someday", precision: "someday" }, "Algún día"],
    [{ value: "2027", precision: "year" }, "2027"],
    [{ value: "2026-winter", precision: "season" }, "invierno 2026"],
    [{ value: "2026-10", precision: "month" }, "octubre 2026"],
    [{ value: "2026-10-12", precision: "day" }, "12 de octubre de 2026"],
  ] as const)("%j → %s", (date, expected) => {
    expect(formatPlannedDate(date)).toBe(expected);
  });
});

describe("isValidPlannedDate", () => {
  it("accepts well-formed values", () => {
    expect(isValidPlannedDate({ value: "2026-10", precision: "month" })).toBe(true);
    expect(isValidPlannedDate({ value: "2028-02-29", precision: "day" })).toBe(true);
  });

  it("rejects values that do not match the precision", () => {
    expect(isValidPlannedDate({ value: "2026-13", precision: "month" })).toBe(false);
    expect(isValidPlannedDate({ value: "2026-02-30", precision: "day" })).toBe(false);
    expect(isValidPlannedDate({ value: "2026", precision: "month" })).toBe(false);
    expect(isValidPlannedDate({ value: "2026-fall", precision: "season" })).toBe(false);
    expect(isValidPlannedDate({ value: "", precision: "someday" })).toBe(false);
  });
});
