"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Group } from "three";
import { PET_SCALE, petModelUrl } from "./world-layout";

export type PetAnimation = "idle" | "walk" | "run" | "dance" | "gesture-positive";

interface PetProps {
  pet: string;
  animation?: PetAnimation;
  scale?: number;
}

/** A Kenney Cube Pet with smooth cross-fades between its built-in clips. */
export const Pet = forwardRef<Group, PetProps>(function Pet({ pet, animation = "idle", scale = PET_SCALE }, ref) {
  const { scene, animations } = useGLTF(petModelUrl(pet));
  // Clone so both people can pick the same pet; geometry and materials stay shared.
  const model = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<Group>(null!);
  useImperativeHandle(ref, () => group.current);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const action = actions[animation] ?? actions.idle;
    action?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [actions, animation]);

  return (
    <group ref={group} scale={scale} dispose={null}>
      <primitive object={model} />
    </group>
  );
});
