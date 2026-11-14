import type { Item, ItemPatch, ItemType, NewItem } from "./item.types";

export interface ItemRepository {
  listByType(type: ItemType): Promise<Item[]>;
  listAll(): Promise<Item[]>;
  countByType(): Promise<Partial<Record<ItemType, number>>>;
  getById(id: string): Promise<Item | null>;
  create(input: NewItem): Promise<Item>;
  update(id: string, patch: ItemPatch): Promise<Item>;
}
