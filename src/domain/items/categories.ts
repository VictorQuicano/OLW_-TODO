import type { ItemType } from "./item.types";

/** Categories that have a zone in the MVP world. */
export const MVP_TYPES = ["restaurant", "place", "movie", "music"] as const satisfies readonly ItemType[];
export type MvpType = (typeof MVP_TYPES)[number];

export interface CategoryMeta {
  /** Zone name shown in the world and headings. */
  label: string;
  emoji: string;
  /** Warm empty-state copy. */
  empty: string;
  /** Placeholder for the title field. */
  titlePlaceholder: string;
}

export const CATEGORIES: Record<MvpType, CategoryMeta> = {
  restaurant: {
    label: "Comida",
    emoji: "🍜",
    empty: "Todavía no hay antojos anotados. ¿Dónde comemos?",
    titlePlaceholder: "Ramen del centro",
  },
  place: {
    label: "Lugares",
    emoji: "📍",
    empty: "Ningún lugar por visitar aún. ¿A dónde vamos?",
    titlePlaceholder: "Mirador al atardecer",
  },
  movie: {
    label: "Pelis y series",
    emoji: "🎬",
    empty: "La lista de pelis está vacía. ¿Qué vemos juntos?",
    titlePlaceholder: "Past Lives",
  },
  music: {
    label: "Música",
    emoji: "🎵",
    empty: "Sin música todavía. ¿Qué escuchamos?",
    titlePlaceholder: "Un disco para el viaje",
  },
};

export function isMvpType(value: unknown): value is MvpType {
  return typeof value === "string" && (MVP_TYPES as readonly string[]).includes(value);
}
