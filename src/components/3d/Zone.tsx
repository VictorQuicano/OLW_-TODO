"use client";

import { Html } from "@react-three/drei";
import { CATEGORIES } from "@/domain/items/categories";
import { WorldProp } from "./WorldProp";
import { GROUND_Y, type ZoneDef } from "./world-layout";

const ACCENT = "#3446d4";
const MAX_TROPHIES = 5;

interface ZoneProps {
  zone: ZoneDef;
  count: number;
  active: boolean;
}

export function Zone({ zone, count, active }: ZoneProps) {
  const [cx, cz] = zone.center;
  const meta = CATEGORIES[zone.type];
  const trophies = Math.min(count, MAX_TROPHIES);

  return (
    <group>
      {/* Ground ring: brighter while the pet stands inside. */}
      <mesh position={[cx, GROUND_Y + 0.02, cz]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[zone.radius - 0.12, zone.radius, 48]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={active ? 0.9 : 0.25} />
      </mesh>
      <mesh position={[cx, GROUND_Y + 0.015, cz]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[zone.radius - 0.12, 48]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={active ? 0.12 : 0.04} />
      </mesh>

      {zone.props.map((p, i) => (
        <WorldProp key={i} {...p} />
      ))}

      {/* One small trophy per saved item (max 5), in an arc on the side facing the island center. */}
      {Array.from({ length: trophies }, (_, i) => {
        const toCenter = Math.atan2(-cz, -cx);
        const angle = toCenter + ((i - (MAX_TROPHIES - 1) / 2) * Math.PI) / 7;
        const r = zone.radius + 0.35;
        return (
          <WorldProp
            key={`t${i}`}
            model={zone.trophy}
            at={[cx + Math.cos(angle) * r, cz + Math.sin(angle) * r]}
            rotY={-angle + Math.PI / 2}
            scale={0.6}
          />
        );
      })}

      <Html position={[cx, GROUND_Y + 1.6, cz]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          aria-hidden="true"
          className="whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-meta font-medium text-ink shadow-soft"
        >
          {meta.emoji} {meta.label}
          {count > 0 && <span className="ml-1.5 text-muted">{count}</span>}
        </div>
      </Html>
    </group>
  );
}
