"use client";

import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WorldExperience } from "@/components/3d/WorldExperience";
import { ZonePanel } from "@/components/items/ZonePanel";
import type { MvpType } from "@/domain/items/categories";
import type { Item } from "@/domain/items/item.types";
import type { User, UserKey } from "@/domain/users/user.types";
import { WorldHud } from "./WorldHud";

interface Props {
  me: { key: UserKey; pet: string };
  partner: { key: UserKey; pet: string; name: string } | null;
  users: Record<UserKey, User>;
  counts: Partial<Record<MvpType, number>>;
  /** Zone opened through `?zona=`, with its items (loaded on the server). */
  panel: { type: MvpType; items: Item[] } | null;
}

const zoneHref = (type: MvpType) => `/?zona=${type}`;

export function WorldShell({ me, partner, users, counts, panel }: Props) {
  const router = useRouter();
  const [standingIn, setStandingIn] = useState<MvpType | null>(null);

  const open = useCallback((type: MvpType) => router.push(zoneHref(type), { scroll: false }), [router]);
  const close = useCallback(() => router.push("/", { scroll: false }), [router]);

  // E / Enter enters the zone the pet is standing in.
  useEffect(() => {
    if (!standingIn || panel) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName);
      if (!typing && (e.code === "KeyE" || e.code === "Enter")) open(standingIn);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [standingIn, panel, open]);

  return (
    <main className="relative h-dvh overflow-hidden bg-paper">
      {/* isolate: 3D labels (drei <Html>) must never stack above the HUD or panels. */}
      <div className="absolute inset-0 isolate">
        <WorldExperience
          me={me}
          partner={partner}
          counts={counts}
          activeZone={standingIn}
          paused={panel !== null}
          onZoneChange={setStandingIn}
        />
      </div>

      <WorldHud name={users[me.key].name} counts={counts} standingIn={panel ? null : standingIn} onEnter={open} />

      <AnimatePresence>
        {panel && (
          <ZonePanel key={panel.type} type={panel.type} items={panel.items} me={me.key} users={users} onClose={close} />
        )}
      </AnimatePresence>
    </main>
  );
}
