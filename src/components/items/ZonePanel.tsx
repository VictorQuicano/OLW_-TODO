"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { MvpType } from "@/domain/items/categories";
import type { Item } from "@/domain/items/item.types";
import type { User, UserKey } from "@/domain/users/user.types";
import { ZoneContent } from "./ZoneContent";

interface Props {
  type: MvpType;
  items: Item[];
  me: UserKey;
  users: Record<UserKey, User>;
  onClose: () => void;
}

/** Bottom sheet on mobile, side sheet on desktop. The world stays visible (and paused) behind it. */
export function ZonePanel({ type, items, me, users, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const headingId = `zone-${type}-title`;

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Mobile scrim: tap outside to close. */}
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/20 md:hidden"
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-labelledby={headingId}
        tabIndex={-1}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-lg bg-paper px-5 pb-10 pt-3 shadow-lifted outline-none md:top-24 md:bottom-4 md:right-4 md:left-auto md:max-h-none md:w-md md:rounded-lg md:px-8 md:pt-6"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar y volver al mundo"
          className="float-right -mr-2 flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
        <ZoneContent type={type} items={items} me={me} users={users} headingId={headingId} />
      </motion.div>
    </>
  );
}
