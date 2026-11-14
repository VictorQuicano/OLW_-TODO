import type { MvpType } from "@/domain/items/categories";
import type { UserKey } from "@/domain/users/user.types";

/** Pure map data for the world. Units: 1 = one small Kenney block. Ground surface is at y = GROUND_Y. */

export const GROUND_Y = 1;
/** Half size of the walkable island. */
export const ISLAND_HALF = 8;
export const WALK_LIMIT = ISLAND_HALF - 0.7;
export const PET_SCALE = 0.45;
export const PET_RADIUS = 0.3;

export const WORLD_MODELS = [
  "block-grass-large",
  "tree",
  "tree-pine",
  "flowers",
  "flowers-tall",
  "grass",
  "rocks",
  "mushrooms",
  "fence-straight",
  "sign",
  "flag",
  "barrel",
  "crate",
  "chest",
  "platform",
  "star",
  "heart",
  "coin-gold",
] as const;
export type WorldModel = (typeof WORLD_MODELS)[number];

export const worldModelUrl = (m: WorldModel) => `/models/world/${m}.glb`;
export const petModelUrl = (pet: string) => `/models/pets/animal-${pet}.glb`;

export type Vec2 = readonly [x: number, z: number];

export interface Prop {
  model: WorldModel;
  at: Vec2;
  /** Height above the ground, for stacking. */
  y?: number;
  rotY?: number;
  scale?: number;
  /** Blocks walking within this radius. */
  solid?: number;
}

export interface ZoneDef {
  type: MvpType;
  center: Vec2;
  radius: number;
  props: Prop[];
  /** Where the item-count trophies (max 5) appear. */
  trophy: WorldModel;
}

const Q = Math.PI / 2;

export const ZONES: ZoneDef[] = [
  {
    type: "restaurant",
    center: [-4.2, -3.8],
    radius: 1.7,
    trophy: "coin-gold",
    props: [
      { model: "barrel", at: [-5.4, -5.1], solid: 0.35 },
      { model: "barrel", at: [-4.8, -5.4], rotY: 0.6, solid: 0.35 },
      { model: "crate", at: [-3.4, -5.3], rotY: 0.3, solid: 0.35 },
      { model: "crate", at: [-3.4, -5.3], y: 0.5, rotY: 0.8, scale: 0.7 },
      { model: "sign", at: [-2.7, -4.6], rotY: -0.5, solid: 0.25 },
    ],
  },
  {
    type: "place",
    center: [4.2, -3.8],
    radius: 1.7,
    trophy: "flag",
    props: [
      { model: "tree", at: [5.5, -5.4], scale: 1.4, solid: 0.6 },
      { model: "sign", at: [2.9, -4.9], rotY: 0.4, solid: 0.25 },
      { model: "flowers", at: [3.4, -2.6] },
      { model: "flowers", at: [5.6, -2.9], rotY: 1.2 },
    ],
  },
  {
    type: "movie",
    center: [-4.2, 3.8],
    radius: 1.7,
    trophy: "star",
    props: [
      { model: "platform", at: [-4.2, 5.6], scale: 2.2, solid: 0.9 },
      { model: "star", at: [-4.9, 5.6], y: 0.44, rotY: 0.2, scale: 1.3 },
      { model: "star", at: [-3.5, 5.6], y: 0.44, rotY: -0.2, scale: 1.3 },
      { model: "sign", at: [-2.6, 4.9], rotY: 0.5 + Q * 2, solid: 0.25 },
    ],
  },
  {
    type: "music",
    center: [4.2, 3.8],
    radius: 1.7,
    trophy: "heart",
    props: [
      { model: "platform", at: [4.2, 5.6], scale: 1.6, solid: 0.7 },
      { model: "flowers-tall", at: [3.1, 5.4], solid: 0.25 },
      { model: "flowers-tall", at: [5.3, 5.4], rotY: 1, solid: 0.25 },
      { model: "heart", at: [4.2, 5.6], y: 0.32, scale: 1.4 },
      { model: "sign", at: [2.7, 4.6], rotY: -0.5 + Q * 2, solid: 0.25 },
    ],
  },
];

/** Each person's corner: where they appear and where the other one sees them idle. */
export const HOMES: Record<UserKey, { at: Vec2; facing: number }> = {
  a: { at: [-6.2, 0], facing: Q },
  b: { at: [6.2, 0], facing: -Q },
};

export const HOME_PROPS: Prop[] = [
  { model: "flag", at: [-7, -0.8], solid: 0.2 },
  { model: "chest", at: [-7, 0.8], rotY: Q, solid: 0.3 },
  { model: "flag", at: [7, -0.8], rotY: Math.PI, solid: 0.2 },
  { model: "chest", at: [7, 0.8], rotY: -Q, solid: 0.3 },
];

export const DECOR: Prop[] = [
  // Tree line on the far edge
  { model: "tree-pine", at: [-7.2, -7.2], solid: 0.5 },
  { model: "tree", at: [-1.8, -7.1], solid: 0.5 },
  { model: "tree-pine", at: [0.6, -7.3], scale: 1.2, solid: 0.5 },
  { model: "tree-pine", at: [7.2, -7.1], solid: 0.5 },
  { model: "tree", at: [-7.3, 7.2], solid: 0.5 },
  { model: "tree-pine", at: [7.3, 7.3], scale: 0.9, solid: 0.5 },
  { model: "tree", at: [0.2, 7.3], scale: 0.8, solid: 0.45 },
  // Near fences
  { model: "fence-straight", at: [-1.2, 7.5] },
  { model: "fence-straight", at: [1.6, 7.5] },
  // Small details
  { model: "rocks", at: [-0.9, -2.2], solid: 0.3 },
  { model: "mushrooms", at: [1.4, 2.3] },
  { model: "grass", at: [-2, 1.2] },
  { model: "grass", at: [2.3, -1.4] },
  { model: "grass", at: [-6.6, -3.2] },
  { model: "grass", at: [6.4, 3] },
  { model: "flowers", at: [0.8, -4.8], rotY: 0.7 },
  { model: "flowers", at: [-0.9, 4.6] },
  { model: "rocks", at: [6.9, -3.4], scale: 0.8, solid: 0.25 },
  { model: "mushrooms", at: [-6.8, 3.6] },
];

export const OBSTACLES: { at: Vec2; r: number }[] = [...ZONES.flatMap((z) => z.props), ...HOME_PROPS, ...DECOR]
  .filter((p) => p.solid)
  .map((p) => ({ at: p.at, r: p.solid! }));

export function zoneAt(x: number, z: number): MvpType | null {
  for (const zone of ZONES) {
    if (Math.hypot(x - zone.center[0], z - zone.center[1]) <= zone.radius) return zone.type;
  }
  return null;
}

/** Keep a point on the island and outside obstacles (simple circle push-out, no physics). */
export function resolvePosition(x: number, z: number): [number, number] {
  x = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, x));
  z = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, z));
  for (const o of OBSTACLES) {
    const dx = x - o.at[0];
    const dz = z - o.at[1];
    const d = Math.hypot(dx, dz);
    const min = o.r + PET_RADIUS;
    if (d < min && d > 1e-4) {
      x = o.at[0] + (dx / d) * min;
      z = o.at[1] + (dz / d) * min;
    }
  }
  return [x, z];
}
