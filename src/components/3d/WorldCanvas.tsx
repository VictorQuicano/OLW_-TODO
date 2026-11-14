"use client";

import { Clone, Html, useGLTF, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { MvpType } from "@/domain/items/categories";
import type { UserKey } from "@/domain/users/user.types";
import { Pet } from "./Pet";
import { BlobShadow, CAMERA_OFFSET, PlayerController } from "./PlayerController";
import { WorldProp } from "./WorldProp";
import { DECOR, GROUND_Y, HOME_PROPS, HOMES, ISLAND_HALF, WORLD_MODELS, worldModelUrl, ZONES } from "./world-layout";
import { Zone } from "./Zone";

WORLD_MODELS.forEach((m) => useGLTF.preload(worldModelUrl(m)));

const PAPER = "#f7f2e9";
const BLOCK_SIZE = 2.08; // block-grass-large footprint

export interface WorldCanvasProps {
  me: { key: UserKey; pet: string };
  partner: { key: UserKey; pet: string; name: string } | null;
  counts: Partial<Record<MvpType, number>>;
  activeZone: MvpType | null;
  /** A panel covers the world: stop input and render on demand only. */
  paused: boolean;
  onZoneChange: (zone: MvpType | null) => void;
}

export default function WorldCanvas({ me, partner, counts, activeZone, paused, onZoneChange }: WorldCanvasProps) {
  const start = HOMES[me.key];
  const spawn = [start.at[0] + (me.key === "a" ? 1.2 : -1.2), start.at[1]] as const;

  return (
    <div className="relative h-full">
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.5]}
        frameloop={paused ? "demand" : "always"}
        gl={{ antialias: true, powerPreference: "low-power" }}
        camera={{
          fov: 35,
          position: [spawn[0] + CAMERA_OFFSET.x, GROUND_Y + CAMERA_OFFSET.y, spawn[1] + CAMERA_OFFSET.z],
          near: 0.5,
          far: 80,
        }}
      >
        <color attach="background" args={[PAPER]} />
        <fog attach="fog" args={[PAPER, 28, 48]} />
        <hemisphereLight args={["#fff6e5", "#b9a88f", 1.6]} />
        <directionalLight position={[6, 12, 4]} intensity={1.6} color="#fff1dc" />

        <Suspense fallback={null}>
          <Island />
          {ZONES.map((z) => (
            <Zone key={z.type} zone={z} count={counts[z.type] ?? 0} active={activeZone === z.type} />
          ))}
          {[...DECOR, ...HOME_PROPS].map((p, i) => (
            <WorldProp key={i} {...p} />
          ))}
        </Suspense>

        {partner && (
          <Suspense fallback={null}>
            <group position={[HOMES[partner.key].at[0], GROUND_Y, HOMES[partner.key].at[1]]} rotation-y={HOMES[partner.key].facing}>
              <Pet pet={partner.pet} animation="idle" />
              <BlobShadow />
              <Html position={[0, 1.1, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
                <div aria-hidden="true" className="whitespace-nowrap rounded-full bg-ink/80 px-2.5 py-0.5 text-meta text-paper">
                  {partner.name}
                </div>
              </Html>
            </group>
          </Suspense>
        )}

        <Suspense fallback={null}>
          <PlayerController pet={me.pet} start={spawn} enabled={!paused} onZoneChange={onZoneChange} />
        </Suspense>
      </Canvas>
      <LoadingVeil />
    </div>
  );
}

function Island() {
  const { scene } = useGLTF(worldModelUrl("block-grass-large"));
  const s = (ISLAND_HALF * 2) / BLOCK_SIZE;
  return <Clone object={scene} position={[0, GROUND_Y - 1, 0]} scale={[s, 1, s]} />;
}

/** Cream veil over the canvas until every model has loaded. */
function LoadingVeil() {
  const { active, progress } = useProgress();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper transition-opacity duration-(--duration-slow)"
      style={{ opacity: active ? 1 : 0 }}
    >
      {active && <p className="font-display text-title text-muted">Preparando nuestro mundito… {Math.round(progress)}%</p>}
    </div>
  );
}
