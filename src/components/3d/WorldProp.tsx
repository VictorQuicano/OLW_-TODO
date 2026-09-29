"use client";

import { Clone, useGLTF } from "@react-three/drei";
import { GROUND_Y, worldModelUrl, type Prop } from "./world-layout";

/** One Platformer Kit piece on the ground. Clones share geometry and materials. */
export function WorldProp({ model, at, y = 0, rotY = 0, scale = 1 }: Prop) {
  const { scene } = useGLTF(worldModelUrl(model));
  return <Clone object={scene} position={[at[0], GROUND_Y + y, at[1]]} rotation-y={rotY} scale={scale} />;
}
