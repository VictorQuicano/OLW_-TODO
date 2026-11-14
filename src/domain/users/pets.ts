/** Kenney Cube Pets available as characters (files in public/models/pets). */
export const PET_IDS = [
  "beaver",
  "bee",
  "bunny",
  "cat",
  "caterpillar",
  "chick",
  "cow",
  "crab",
  "deer",
  "dog",
  "elephant",
  "fish",
  "fox",
  "giraffe",
  "hog",
  "koala",
  "lion",
  "monkey",
  "panda",
  "parrot",
  "penguin",
  "pig",
  "polar",
  "tiger",
] as const;

export type PetId = (typeof PET_IDS)[number];

export const PET_LABELS: Record<PetId, string> = {
  beaver: "Castor",
  bee: "Abeja",
  bunny: "Conejo",
  cat: "Gato",
  caterpillar: "Oruga",
  chick: "Pollito",
  cow: "Vaca",
  crab: "Cangrejo",
  deer: "Ciervo",
  dog: "Perro",
  elephant: "Elefante",
  fish: "Pez",
  fox: "Zorro",
  giraffe: "Jirafa",
  hog: "Jabalí",
  koala: "Koala",
  lion: "León",
  monkey: "Mono",
  panda: "Panda",
  parrot: "Loro",
  penguin: "Pingüino",
  pig: "Cerdito",
  polar: "Oso polar",
  tiger: "Tigre",
};

export function isPetId(value: unknown): value is PetId {
  return typeof value === "string" && (PET_IDS as readonly string[]).includes(value);
}
