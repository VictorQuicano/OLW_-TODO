import { z } from "zod";
import { DATE_PRECISIONS, ITEM_STATUSES } from "./item.types";
import { isValidPlannedDate } from "./planned-date";

const text = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`).optional();

export const plannedDateSchema = z
  .object({ value: z.string(), precision: z.enum(DATE_PRECISIONS) })
  .refine(isValidPlannedDate, { message: "Fecha no válida" });

const base = {
  title: z.string().trim().min(1, "Ponle un nombre").max(200, "Máximo 200 caracteres"),
  notes: text(2000),
  plannedDate: plannedDateSchema.optional(),
};

const currentYear = new Date().getFullYear();

/** Input for creating an item. Category-specific fields only exist on their category. */
export const createItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("restaurant"),
    ...base,
    location: text(200),
    priceRange: z.coerce.number().int().min(1).max(4).optional(),
  }),
  z.object({ type: z.literal("place"), ...base, location: text(200) }),
  z.object({
    type: z.literal("movie"),
    ...base,
    kind: z.enum(["movie", "series"]).optional(),
    year: z.coerce
      .number()
      .int()
      .min(1888, "Año no válido")
      .max(currentYear + 10, "Año no válido")
      .optional(),
  }),
  z.object({ type: z.literal("music"), ...base, artist: text(200) }),
]);

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const itemIdSchema = z.string().min(1).max(64);
export const itemStatusSchema = z.enum(ITEM_STATUSES);

