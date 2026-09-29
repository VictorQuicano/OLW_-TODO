"use client";

import { AnimatePresence } from "motion/react";
import type { Item } from "@/domain/items/item.types";
import type { User, UserKey } from "@/domain/users/user.types";
import { ItemRow } from "./ItemRow";

/** Existing rows render instantly; only newly created ones animate in. */
export function ItemList({ items, me, users }: { items: Item[]; me: UserKey; users: Record<UserKey, User> }) {
  return (
    <ul className="mt-4">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} me={me} users={users} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
