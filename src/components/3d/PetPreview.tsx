"use client";

import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Pet } from "./Pet";
import { BlobShadow } from "./PlayerController";

/** Small stage showing only the selected pet dancing. */
export default function PetPreview({ pet }: { pet: string }) {
  return (
    <div className="relative h-full">
      <Canvas aria-hidden="true" dpr={[1, 1.5]} camera={{ fov: 30, position: [0, 1.2, 4] }} onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}>
        <hemisphereLight args={["#fff6e5", "#b9a88f", 1.8]} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff1dc" />
        <Suspense fallback={null}>
          <group rotation-y={-0.5}>
            <Pet key={pet} pet={pet} animation="dance" scale={0.7} />
            <BlobShadow />
          </group>
        </Suspense>
      </Canvas>
      <Loading />
    </div>
  );
}

function Loading() {
  const { active } = useProgress();
  return active ? (
    <p role="status" className="absolute inset-0 flex items-center justify-center text-meta text-muted">
      Cargando…
    </p>
  ) : null;
}
