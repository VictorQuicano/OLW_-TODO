import { ListBook } from "@/components/list/ListBook";
import { isMvpType, MVP_TYPES } from "@/domain/items/categories";
import { isCompletedTogether } from "@/domain/items/item.service";
import { requireUser } from "@/lib/auth/session";
import { getUsers } from "@/lib/auth/users";
import { itemService } from "@/lib/storage";

export const metadata = { title: "Nuestra lista · Our Little World" };

/** Full 2D equivalent of the world, as a scrapbook: one page per category. */
export default async function ListPage({ searchParams }: PageProps<"/lista">) {
  const user = await requireUser();
  const [items, { pagina }] = await Promise.all([itemService.listAll(), searchParams]);

  return (
    <ListBook
      me={user.key}
      users={getUsers()}
      initialPage={isMvpType(pagina) ? pagina : MVP_TYPES[0]}
      pages={MVP_TYPES.map((type) => ({ type, items: items.filter((i) => i.type === type) }))}
      totals={{ items: items.length, together: items.filter(isCompletedTogether).length }}
    />
  );
}
