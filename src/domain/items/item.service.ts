import type { UserKey } from "@/domain/users/user.types";
import type { CreateItemInput } from "./item.schema";
import type { ItemRepository } from "./item.repository";
import type { Completion, Item, ItemDetails, ItemPatch, ItemStatus, PlannedDate } from "./item.types";

export function isCompletedTogether(item: Pick<Item, "completion">): boolean {
  return item.completion.a && item.completion.b;
}

/** An item with a real (non-"someday") date is a plan; otherwise it is still an idea. */
export function statusForDate(date: PlannedDate | undefined): ItemStatus {
  return date && date.precision !== "someday" ? "planned" : "idea";
}

/**
 * Next step of the lifecycle: idea → planned → completed.
 * Moving to completed means "we did it together", so both people are marked.
 */
export function nextStatusPatch(item: Pick<Item, "status">): ItemPatch | null {
  switch (item.status) {
    case "idea":
      return { status: "planned" };
    case "planned":
      return { status: "completed", completion: { a: true, b: true } };
    default:
      return null;
  }
}

/**
 * Toggle one person's completion. When both are done the item becomes completed;
 * if someone un-checks a completed item it goes back to planned/idea.
 */
export function completionPatch(item: Pick<Item, "status" | "completion" | "plannedDate">, user: UserKey): ItemPatch {
  const completion: Completion = { ...item.completion, [user]: !item.completion[user] };
  if (completion.a && completion.b) return { completion, status: "completed" };
  if (item.status === "completed") return { completion, status: statusForDate(item.plannedDate) };
  return { completion };
}

function detailsFrom(input: CreateItemInput): ItemDetails {
  switch (input.type) {
    case "restaurant":
      return { priceRange: input.priceRange as ItemDetails["priceRange"] };
    case "movie":
      return { kind: input.kind, year: input.year };
    case "music":
      return { artist: input.artist };
    case "place":
      return {};
  }
}

export function createItemService(repo: ItemRepository) {
  return {
    listByType: repo.listByType,
    listAll: repo.listAll,
    countByType: repo.countByType,

    create(input: CreateItemInput, createdBy: UserKey): Promise<Item> {
      return repo.create({
        type: input.type,
        title: input.title,
        notes: input.notes || undefined,
        location: "location" in input ? input.location || undefined : undefined,
        plannedDate: input.plannedDate,
        status: statusForDate(input.plannedDate),
        details: detailsFrom(input),
        createdBy,
      });
    },

    async advance(id: string): Promise<Item | null> {
      const item = await repo.getById(id);
      if (!item) return null;
      const patch = nextStatusPatch(item);
      return patch ? repo.update(id, patch) : item;
    },

    async toggleCompletion(id: string, user: UserKey): Promise<Item | null> {
      const item = await repo.getById(id);
      if (!item) return null;
      return repo.update(id, completionPatch(item, user));
    },
  };
}

export type ItemService = ReturnType<typeof createItemService>;
