import { CATEGORIES, type MvpType } from "@/domain/items/categories";
import type { Item } from "@/domain/items/item.types";
import type { User, UserKey } from "@/domain/users/user.types";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";

interface Props {
  type: MvpType;
  items: Item[];
  me: UserKey;
  users: Record<UserKey, User>;
  headingId?: string;
}

/** Form + list for one category. Used inside the world panel and on /lista. */
export function ZoneContent({ type, items, me, users, headingId }: Props) {
  const meta = CATEGORIES[type];
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="font-display text-h2 text-ink">
        <span aria-hidden className="mr-2">
          {meta.emoji}
        </span>
        {meta.label}
      </h2>
      <div className="mt-4">
        <ItemForm type={type} />
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-muted">{meta.empty}</p>
      ) : (
        <ItemList items={items} me={me} users={users} />
      )}
    </section>
  );
}
