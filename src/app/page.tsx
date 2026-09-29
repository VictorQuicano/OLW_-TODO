import { redirect } from "next/navigation";
import { WorldShell } from "@/components/layout/WorldShell";
import { isMvpType } from "@/domain/items/categories";
import { otherUser } from "@/domain/users/user.types";
import { requireUser } from "@/lib/auth/session";
import { getUsers } from "@/lib/auth/users";
import { itemService, profileRepository } from "@/lib/storage";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const [profiles, counts, { zona }] = await Promise.all([
    profileRepository.getAll(),
    itemService.countByType(),
    searchParams,
  ]);

  const mine = profiles.find((p) => p.userKey === user.key);
  if (!mine) redirect("/elegir");

  const users = getUsers();
  const partnerKey = otherUser(user.key);
  const partnerProfile = profiles.find((p) => p.userKey === partnerKey);
  const zone = isMvpType(zona) ? zona : null;

  return (
    <WorldShell
      me={{ key: user.key, pet: mine.pet }}
      partner={partnerProfile ? { key: partnerKey, pet: partnerProfile.pet, name: users[partnerKey].name } : null}
      users={users}
      counts={counts}
      panel={zone ? { type: zone, items: await itemService.listByType(zone) } : null}
    />
  );
}
