"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOptimistic, useState, useTransition } from "react";
import { advanceStatusAction, toggleMyCompletionAction, type ActionResult } from "@/app/actions/items";
import { completionPatch, isCompletedTogether, nextStatusPatch } from "@/domain/items/item.service";
import type { Item, ItemPatch } from "@/domain/items/item.types";
import { formatPlannedDate } from "@/domain/items/planned-date";
import type { User, UserKey } from "@/domain/users/user.types";
import { cn } from "@/lib/utils/cn";
import { StatusLabel } from "./StatusLabel";

interface Props {
  item: Item;
  me: UserKey;
  users: Record<UserKey, User>;
}

const ADVANCE_LABEL: Partial<Record<Item["status"], string>> = {
  idea: "Lo planeamos",
  planned: "¡Lo hicimos!",
};

function metaLine(item: Item): string {
  const parts = [formatPlannedDate(item.plannedDate)];
  if (item.location) parts.push(item.location);
  if (item.details.priceRange) parts.push("$".repeat(item.details.priceRange));
  if (item.details.kind) parts.push(item.details.kind === "series" ? "Serie" : "Peli");
  if (item.details.year) parts.push(String(item.details.year));
  if (item.details.artist) parts.push(item.details.artist);
  return parts.join(" · ");
}

export function ItemRow({ item, me, users }: Props) {
  const [optimistic, apply] = useOptimistic(item, (state, patch: ItemPatch) => ({ ...state, ...patch }));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const together = isCompletedTogether(optimistic);

  const run = (patch: ItemPatch | null, action: () => Promise<ActionResult>) => {
    if (!patch) return;
    setError(null);
    startTransition(async () => {
      apply(patch);
      const result = await action();
      if (!result.ok) setError(result.error); // optimistic state reverts automatically
    });
  };

  const advanceLabel = ADVANCE_LABEL[optimistic.status];

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="border-b border-line py-4 last:border-b-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <StatusLabel status={optimistic.status} />
          <h3 className="mt-1 text-title font-medium text-ink">{optimistic.title}</h3>
          <p className="mt-0.5 text-meta text-muted">{metaLine(optimistic)}</p>
          {optimistic.notes && <p className="mt-2 max-w-prose text-meta text-ink/80">{optimistic.notes}</p>}
        </div>

        <div className="flex shrink-0 gap-1.5" role="group" aria-label="¿Quién lo hizo?">
          {(["a", "b"] as const).map((key) => {
            const done = optimistic.completion[key];
            const mine = key === me;
            return (
              <button
                key={key}
                type="button"
                disabled={!mine || pending}
                aria-pressed={done}
                aria-label={`${users[key].name}: ${done ? "hecho" : "pendiente"}${mine ? "" : " (solo lo puede marcar esa persona)"}`}
                onClick={() => run(completionPatch(optimistic, me), () => toggleMyCompletionAction(item.id))}
                className={cn(
                  "relative flex size-11 items-center justify-center rounded-full border text-meta font-medium transition-colors duration-(--duration-fast)",
                  done ? "border-status-done bg-status-done text-surface" : "border-line bg-surface text-muted",
                  mine ? "cursor-pointer hover:border-accent" : "cursor-default opacity-80",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : users[key].name.charAt(0)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex min-h-11 flex-wrap items-center gap-3">
        <AnimatePresence initial={false}>
          {together && (
            <motion.p
              key="together"
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-full bg-special/15 px-3 py-1 text-meta font-medium text-ink"
            >
              Completado juntos ✨
            </motion.p>
          )}
        </AnimatePresence>
        {advanceLabel && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(nextStatusPatch(optimistic), () => advanceStatusAction(item.id))}
            className="min-h-11 rounded-full border border-line px-4 text-meta font-medium text-ink transition-colors duration-(--duration-fast) hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {advanceLabel}
          </button>
        )}
        {error && (
          <p role="alert" className="text-meta text-danger">
            {error}
          </p>
        )}
      </div>
    </motion.li>
  );
}
