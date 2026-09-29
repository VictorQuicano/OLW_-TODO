"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3, type Group } from "three";
import type { MvpType } from "@/domain/items/categories";
import { Pet, type PetAnimation } from "./Pet";
import { GROUND_Y, ISLAND_HALF, resolvePosition, WALK_LIMIT, zoneAt, type Vec2 } from "./world-layout";

const WALK_SPEED = 2.6;
const RUN_SPEED = 4.2;
const RUN_DISTANCE = 4;
const ARRIVE = 0.08;
export const CAMERA_OFFSET = new Vector3(0, 12, 12.5);
const cameraGoal = new Vector3();

const KEY_DIRS: Record<string, Vec2> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
}

interface Props {
  pet: string;
  start: Vec2;
  /** False while a panel is open: ignore input. */
  enabled: boolean;
  onZoneChange: (zone: MvpType | null) => void;
}

export function PlayerController({ pet, start, enabled, onZoneChange }: Props) {
  const body = useRef<Group>(null!);
  const target = useRef<Vec2 | null>(null);
  const keys = useRef(new Set<string>());
  const zone = useRef<MvpType | null>(null);
  const lookAt = useRef(new Vector3(start[0], GROUND_Y, start[1]));
  const cameraReady = useRef(false);
  const [anim, setAnim] = useState<PetAnimation>("idle");
  const animRef = useRef<PetAnimation>("idle");

  useEffect(() => {
    if (!enabled) {
      keys.current.clear();
      return;
    }
    const down = (e: KeyboardEvent) => {
      if (e.code in KEY_DIRS && !isTyping(e.target)) {
        keys.current.add(e.code);
        target.current = null;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [enabled]);

  useFrame(({ camera }, delta) => {
    const pos = body.current.position;
    const dt = Math.min(delta, 0.1);
    let dx = 0;
    let dz = 0;
    let speed = WALK_SPEED;

    if (keys.current.size > 0) {
      for (const k of keys.current) {
        dx += KEY_DIRS[k][0];
        dz += KEY_DIRS[k][1];
      }
    } else if (target.current) {
      dx = target.current[0] - pos.x;
      dz = target.current[1] - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < ARRIVE) target.current = null;
      else if (dist > RUN_DISTANCE) speed = RUN_SPEED;
    }

    const len = Math.hypot(dx, dz);
    const moving = len > ARRIVE / 2 && (keys.current.size > 0 || target.current !== null);
    if (moving) {
      const step = Math.min(speed * dt, keys.current.size > 0 ? Infinity : len);
      const [x, z] = resolvePosition(pos.x + (dx / len) * step, pos.z + (dz / len) * step);
      // Stuck against an obstacle: give up on the click target instead of walking in place.
      if (target.current && Math.hypot(x - pos.x, z - pos.z) < step * 0.2) target.current = null;
      pos.x = x;
      pos.z = z;
      const facing = Math.atan2(dx, dz);
      const r = body.current.rotation;
      const diff = Math.atan2(Math.sin(facing - r.y), Math.cos(facing - r.y));
      r.y += diff * Math.min(1, dt * 12);
    }

    const nextAnim: PetAnimation = !moving ? "idle" : speed === RUN_SPEED ? "run" : "walk";
    if (nextAnim !== animRef.current) {
      animRef.current = nextAnim;
      setAnim(nextAnim);
    }

    const current = zoneAt(pos.x, pos.z);
    if (current !== zone.current) {
      zone.current = current;
      onZoneChange(current);
    }

    // Smooth follow camera (snapped on the first frame so nothing renders from a stale angle).
    const follow = cameraReady.current ? 1 - Math.exp(-dt * 4) : 1;
    cameraReady.current = true;
    lookAt.current.lerp(pos, follow);
    camera.position.lerp(cameraGoal.copy(lookAt.current).add(CAMERA_OFFSET), follow);
    camera.lookAt(lookAt.current);
    // Negative priority: runs before drei's <Html> projects labels with this frame's camera.
  }, -1);

  const onGround = (e: ThreeEvent<PointerEvent>) => {
    if (!enabled || e.button !== 0) return;
    e.stopPropagation();
    const clamp = (v: number) => Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, v));
    target.current = [clamp(e.point.x), clamp(e.point.z)];
  };

  return (
    <>
      {/* Invisible click surface over the island. */}
      <mesh position={[0, GROUND_Y + 0.01, 0]} rotation-x={-Math.PI / 2} onPointerDown={onGround}>
        <planeGeometry args={[ISLAND_HALF * 2, ISLAND_HALF * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={body} position={[start[0], GROUND_Y, start[1]]}>
        <Pet pet={pet} animation={anim} />
        <BlobShadow />
      </group>
    </>
  );
}

export function BlobShadow() {
  return (
    <mesh position-y={0.02} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[0.32, 24]} />
      <meshBasicMaterial color="#3c2814" transparent opacity={0.18} depthWrite={false} />
    </mesh>
  );
}
