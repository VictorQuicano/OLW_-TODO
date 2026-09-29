import type { UserKey } from "@/domain/users/user.types";

export const ITEM_TYPES = [
  "restaurant",
  "place",
  "movie",
  "music",
  "trip",
  "activity",
  "other",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = ["idea", "planned", "completed", "archived"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const DATE_PRECISIONS = ["someday", "year", "season", "month", "day"] as const;
export type DatePrecision = (typeof DATE_PRECISIONS)[number];

/**
 * Flexible date. `value` shape depends on precision:
 * someday → "someday", year → "2027", season → "2026-winter", month → "2026-10", day → "2026-10-12".
 */
export interface PlannedDate {
  value: string;
  precision: DatePrecision;
}

export interface Completion {
  a: boolean;
  b: boolean;
}

/** Category-specific fields, stored as JSON. All optional. */
export interface ItemDetails {
  priceRange?: 1 | 2 | 3 | 4;
  year?: number;
  kind?: "movie" | "series";
  artist?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  imageUrl?: string;
  status: ItemStatus;
  plannedDate?: PlannedDate;
  location?: string;
  externalUrl?: string;
  notes?: string;
  details: ItemDetails;
  completion: Completion;
  createdBy: UserKey;
  createdAt: string;
  updatedAt: string;
}

export type NewItem = Pick<Item, "type" | "title" | "status" | "createdBy"> &
  Partial<Pick<Item, "plannedDate" | "location" | "notes" | "externalUrl" | "details">>;

export type ItemPatch = Partial<Pick<Item, "status" | "completion" | "plannedDate">>;
