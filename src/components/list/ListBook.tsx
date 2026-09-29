"use client";

import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from "motion/react";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ZoneContent } from "@/components/items/ZoneContent";
import { CATEGORIES, type MvpType } from "@/domain/items/categories";
import type { Item } from "@/domain/items/item.types";
import type { User, UserKey } from "@/domain/users/user.types";
import { cn } from "@/lib/utils/cn";

interface Props {
  me: UserKey;
  users: Record<UserKey, User>;
  pages: { type: MvpType; items: Item[] }[];
  initialPage: MvpType;
  totals: { items: number; together: number };
}

const FLIP = { duration: 0.6, ease: [0.3, 0.7, 0.2, 1] } as const;
const SWIPE_PX = 60;

/**
 * Forward: the current page turns over to the left and reveals the next one underneath.
 * Backward: the previous page turns back in from the left on top of the current one.
 */
const flip: Variants = {
  enter: (dir: number) => (dir > 0 ? { rotateY: 0, zIndex: 0 } : { rotateY: -180, zIndex: 2 }),
  center: { rotateY: 0, zIndex: 1, transition: { rotateY: FLIP, zIndex: { duration: 0 } } },
  exit: (dir: number) => ({
    // Backward: the old page must stay underneath for the whole flip. A zero-change target would
    // finish instantly and unmount it, so rotate by an invisible amount over the same duration.
    rotateY: dir > 0 ? -180 : -0.01,
    zIndex: dir > 0 ? 2 : 0,
    transition: { rotateY: FLIP, zIndex: { duration: 0 } },
  }),
};

export function ListBook({ me, users, pages, initialPage, totals }: Props) {
  const [current, setCurrent] = useState(initialPage);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  const index = pages.findIndex((p) => p.type === current);
  const page = pages[index];

  const goTo = (type: MvpType, focus = false) => {
    if (type === current) return;
    setDirection(pages.findIndex((p) => p.type === type) > index ? 1 : -1);
    setCurrent(type);
    // URL state (ARCHITECTURE §23) without a server round-trip or a history entry per page.
    window.history.replaceState(null, "", `?pagina=${type}`);
    if (focus) tabs.current[type]?.focus();
  };
  const step = (delta: number, focus = false) => {
    const next = pages[index + delta];
    if (next) goTo(next.type, focus);
  };

  const onTabKey = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => step(1, true),
      ArrowLeft: () => step(-1, true),
      Home: () => goTo(pages[0].type, true),
      End: () => goTo(pages[pages.length - 1].type, true),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const onPanEnd = (e: PointerEvent, info: PanInfo) => {
    if (e.target instanceof Element && e.target.closest("input, textarea, select, button")) return;
    if (Math.abs(info.offset.x) < SWIPE_PX || Math.abs(info.offset.y) > Math.abs(info.offset.x)) return;
    step(info.offset.x < 0 ? 1 : -1);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-8 md:pt-12">
      {/* Mobile: the cover collapses into a header above the single page. */}
      <header className="mb-6 flex items-start justify-between gap-4 md:hidden">
        <div>
          <p className="text-meta text-muted">Hola, {users[me].name}</p>
          <h1 className="mt-1 font-display text-h1 text-ink">Nuestra lista</h1>
          <Totals totals={totals} />
        </div>
        <WorldLink />
      </header>

      <div className="md:grid md:grid-cols-2">
        <Cover me={me} users={users} pages={pages} totals={totals} current={current} onOpen={goTo} />

        <div>
          {/* Bookmark ribbons = tabs. */}
          <div role="tablist" aria-label="Páginas de la lista" className="flex items-end gap-2 px-4" onKeyDown={onTabKey}>
            {pages.map((p) => {
              const selected = p.type === current;
              return (
                <button
                  key={p.type}
                  ref={(el) => {
                    tabs.current[p.type] = el;
                  }}
                  id={`tab-${p.type}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="book-page"
                  aria-label={CATEGORIES[p.type].label}
                  title={CATEGORIES[p.type].label}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => goTo(p.type)}
                  className={cn(
                    "flex w-12 items-start justify-center pt-2 text-title transition-[height,background-color] duration-(--duration-base) ease-(--ease-soft)",
                    "[clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]",
                    selected ? "h-16 bg-accent" : "h-12 bg-line hover:bg-accent-soft",
                  )}
                >
                  <span aria-hidden>{CATEGORIES[p.type].emoji}</span>
                </button>
              );
            })}
          </div>

          <motion.div
            id="book-page"
            role="tabpanel"
            aria-labelledby={`tab-${current}`}
            onPanEnd={onPanEnd}
            className="grid perspective-[2000px] touch-pan-y"
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.article
                key={current}
                custom={direction}
                variants={reduce ? undefined : flip}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ gridArea: "1 / 1", transformOrigin: "left center", backfaceVisibility: "hidden" }}
                className="flex min-h-[70dvh] flex-col rounded-lg bg-surface px-5 pb-4 pt-6 shadow-soft inset-shadow-spine-l md:rounded-l-none md:px-8 md:pt-8"
              >
                <div className="flex-1">
                  <ZoneContent type={page.type} items={page.items} me={me} users={users} headingId={`page-${page.type}-title`} />
                </div>
                <PageFooter index={index} count={pages.length} onStep={step} />
              </motion.article>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function Cover({
  me,
  users,
  pages,
  totals,
  current,
  onOpen,
}: Pick<Props, "me" | "users" | "pages" | "totals"> & { current: MvpType; onOpen: (t: MvpType) => void }) {
  return (
    <section
      aria-label="Portada"
      className="hidden flex-col rounded-l-lg bg-surface px-10 pb-8 pt-12 shadow-soft inset-shadow-spine-r md:mt-16 md:flex"
    >
      <p className="text-meta text-muted">Hola, {users[me].name}</p>
      <h1 className="mt-2 font-display text-display text-ink">Nuestra lista</h1>
      <Totals totals={totals} />

      <nav aria-label="Índice" className="mt-10">
        <p className="text-meta font-medium text-muted">Índice</p>
        <ol className="mt-3 border-t border-line">
          {pages.map((p, i) => (
            <li key={p.type} className="border-b border-line">
              <button
                type="button"
                onClick={() => onOpen(p.type)}
                aria-current={p.type === current ? "page" : undefined}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 text-left transition-colors duration-(--duration-fast) hover:text-accent",
                  p.type === current ? "text-accent" : "text-ink",
                )}
              >
                <span className="w-5 text-meta text-muted">{i + 1}</span>
                <span aria-hidden>{CATEGORIES[p.type].emoji}</span>
                <span className="flex-1 font-display text-title">{CATEGORIES[p.type].label}</span>
                <span className="text-meta text-muted">{p.items.length}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-auto pt-10">
        <WorldLink />
      </div>
    </section>
  );
}

function Totals({ totals }: { totals: Props["totals"] }) {
  if (totals.items === 0) return <p className="mt-2 text-muted">Todo empieza con una idea.</p>;
  return (
    <p className="mt-2 text-muted">
      {totals.items} {totals.items === 1 ? "cosa anotada" : "cosas anotadas"} · {totals.together}{" "}
      {totals.together === 1 ? "completada" : "completadas"} juntos
    </p>
  );
}

function WorldLink() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-paper px-4 text-meta font-medium text-ink shadow-soft hover:text-accent"
    >
      <Globe className="size-4" aria-hidden />
      Al mundo
    </Link>
  );
}

function PageFooter({ index, count, onStep }: { index: number; count: number; onStep: (d: number) => void }) {
  const button =
    "flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-(--duration-fast) hover:bg-paper hover:text-ink disabled:invisible";
  return (
    <footer className="mt-8 flex items-center justify-between border-t border-line pt-3">
      <button type="button" className={button} onClick={() => onStep(-1)} disabled={index === 0} aria-label="Página anterior">
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <p className="text-meta text-muted">
        Página {index + 1} de {count}
      </p>
      <button
        type="button"
        className={button}
        onClick={() => onStep(1)}
        disabled={index === count - 1}
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </footer>
  );
}
