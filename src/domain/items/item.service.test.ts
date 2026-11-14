import { describe, expect, it } from "vitest";
import { completionPatch, isCompletedTogether, nextStatusPatch, statusForDate } from "./item.service";

describe("statusForDate", () => {
  it("is a plan only with a real date", () => {
    expect(statusForDate(undefined)).toBe("idea");
    expect(statusForDate({ value: "someday", precision: "someday" })).toBe("idea");
    expect(statusForDate({ value: "2026-10", precision: "month" })).toBe("planned");
  });
});

describe("nextStatusPatch", () => {
  it("walks idea → planned → completed (together)", () => {
    expect(nextStatusPatch({ status: "idea" })).toEqual({ status: "planned" });
    expect(nextStatusPatch({ status: "planned" })).toEqual({
      status: "completed",
      completion: { a: true, b: true },
    });
    expect(nextStatusPatch({ status: "completed" })).toBeNull();
    expect(nextStatusPatch({ status: "archived" })).toBeNull();
  });
});

describe("completionPatch", () => {
  const planned = { status: "planned" as const, plannedDate: { value: "2026-10", precision: "month" as const } };

  it("marks one person without completing the item", () => {
    expect(completionPatch({ ...planned, completion: { a: false, b: false } }, "a")).toEqual({
      completion: { a: true, b: false },
    });
  });

  it("completes the item when the second person checks it", () => {
    const patch = completionPatch({ ...planned, completion: { a: true, b: false } }, "b");
    expect(patch).toEqual({ completion: { a: true, b: true }, status: "completed" });
    expect(isCompletedTogether({ completion: patch.completion! })).toBe(true);
  });

  it("reopens a completed item when someone un-checks it", () => {
    expect(completionPatch({ ...planned, status: "completed", completion: { a: true, b: true } }, "a")).toEqual({
      completion: { a: false, b: true },
      status: "planned",
    });
    expect(
      completionPatch({ status: "completed", plannedDate: undefined, completion: { a: true, b: true } }, "b"),
    ).toEqual({ completion: { a: true, b: false }, status: "idea" });
  });
});
