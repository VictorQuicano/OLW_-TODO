"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createItemSchema, itemIdSchema } from "@/domain/items/item.schema";
import { requireUser } from "@/lib/auth/session";
import { itemService } from "@/lib/storage";
import { logger } from "@/lib/utils/logger";

export type ActionResult =
  | { ok: true; at: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

function revalidate() {
  revalidatePath("/");
  revalidatePath("/lista");
}

/** Empty form fields → undefined, so optional schema fields stay optional. */
function formToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && value.trim() !== "") obj[key] = value;
  }
  const { dateValue, datePrecision, ...rest } = obj;
  if (datePrecision) rest.plannedDate = { value: dateValue ?? "", precision: datePrecision };
  return rest;
}

export async function createItemAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createItemSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { ok: false, error: "Revisa los campos marcados", fieldErrors };
  }
  try {
    await itemService.create(parsed.data, user.key);
  } catch (error) {
    logger.error("Failed to create item", { error });
    return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
  }
  revalidate();
  return { ok: true, at: Date.now() };
}

export async function advanceStatusAction(id: string): Promise<ActionResult> {
  await requireUser();
  const parsedId = itemIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Elemento no válido" };
  try {
    if (!(await itemService.advance(parsedId.data))) return { ok: false, error: "Ya no existe" };
  } catch (error) {
    logger.error("Failed to advance item", { id, error });
    return { ok: false, error: "No se pudo actualizar." };
  }
  revalidate();
  return { ok: true, at: Date.now() };
}

export async function toggleMyCompletionAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsedId = itemIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Elemento no válido" };
  try {
    if (!(await itemService.toggleCompletion(parsedId.data, user.key))) return { ok: false, error: "Ya no existe" };
  } catch (error) {
    logger.error("Failed to toggle completion", { id, error });
    return { ok: false, error: "No se pudo actualizar." };
  }
  revalidate();
  return { ok: true, at: Date.now() };
}
