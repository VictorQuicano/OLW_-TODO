"use client";

import { List, LogOut, PawPrint } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/session";
import { CATEGORIES, MVP_TYPES, type MvpType } from "@/domain/items/categories";

interface Props {
  name: string;
  counts: Partial<Record<MvpType, number>>;
  standingIn: MvpType | null;
  onEnter: (type: MvpType) => void;
}

const iconButton =
  "pointer-events-auto flex size-11 items-center justify-center rounded-full bg-surface/90 text-ink shadow-soft transition-colors duration-(--duration-fast) hover:text-accent";

/** 2D layer over the world. Every zone is reachable from here without walking. */
export function WorldHud({ name, counts, standingIn, onEnter }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 leading-none text-ink md:text-h1">Our Little World</h1>
          <p className="mt-1 text-meta text-muted">Hola, {name}</p>
        </div>
        <nav aria-label="Opciones" className="flex gap-2">
          <Link href="/lista" className={iconButton} aria-label="Ver como lista" title="Ver como lista">
            <List className="size-5" aria-hidden />
          </Link>
          <Link href="/elegir" className={iconButton} aria-label="Cambiar mascota" title="Cambiar mascota">
            <PawPrint className="size-5" aria-hidden />
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={iconButton} aria-label="Salir" title="Salir">
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </nav>
      </header>

      <div className="flex flex-col items-center gap-3">
        <AnimatePresence>
          {standingIn && (
            <motion.button
              key={standingIn}
              type="button"
              onClick={() => onEnter(standingIn)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-medium text-surface shadow-lifted"
            >
              <span aria-hidden>{CATEGORIES[standingIn].emoji}</span>
              Entrar a {CATEGORIES[standingIn].label}
              <kbd className="ml-1 hidden rounded-sm bg-surface/20 px-1.5 text-meta md:inline">E</kbd>
            </motion.button>
          )}
        </AnimatePresence>

        <nav aria-label="Zonas" className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto rounded-full bg-surface/90 p-1.5 shadow-soft">
          {MVP_TYPES.map((type) => (
            <Link
              key={type}
              href={`/?zona=${type}`}
              scroll={false}
              className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-meta font-medium text-ink transition-colors duration-(--duration-fast) hover:bg-accent-soft hover:text-accent"
            >
              <span aria-hidden>{CATEGORIES[type].emoji}</span>
              <span className="hidden sm:inline">{CATEGORIES[type].label}</span>
              <span className="sr-only sm:hidden">{CATEGORIES[type].label}</span>
              <span className="text-muted">{counts[type] ?? 0}</span>
            </Link>
          ))}
        </nav>
        <p className="text-meta text-muted">
          <span className="md:hidden">Toca el suelo para caminar</span>
          <span className="hidden md:inline">Haz click en el suelo o usa WASD para caminar</span>
        </p>
      </div>
    </div>
  );
}
