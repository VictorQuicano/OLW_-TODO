import type { ItemStatus } from "@/domain/items/item.types";
import { cn } from "@/lib/utils/cn";

const STATUS: Record<ItemStatus, { label: string; dot: string }> = {
  idea: { label: "Idea", dot: "bg-status-idea" },
  planned: { label: "Planeado", dot: "bg-status-planned" },
  completed: { label: "Lo hicimos", dot: "bg-status-done" },
  archived: { label: "Archivado", dot: "bg-line" },
};

/** Status is always a colored dot plus text — never color alone. */
export function StatusLabel({ status }: { status: ItemStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-muted">
      <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}
