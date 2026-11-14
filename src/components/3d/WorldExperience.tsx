"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { use3dCapability, type Capability } from "@/hooks/use-3d-capability";
import type { WorldCanvasProps } from "./WorldCanvas";

// Three, R3F and drei only load in this chunk, and only in the browser.
const WorldCanvas = dynamic(() => import("./WorldCanvas"), {
  ssr: false,
  loading: () => <WorldLoading />,
});

const MESSAGES: Record<Exclude<Capability, "pending" | "ok">, string> = {
  "no-webgl": "Este navegador no puede dibujar nuestro mundito en 3D.",
  "reduced-motion": "Tienes activado «reducir movimiento», así que dejamos el mundito quieto.",
  "low-power": "Para cuidar la batería de este equipo, el mundito está en pausa.",
};

export function WorldExperience(props: WorldCanvasProps) {
  const capability = use3dCapability();
  const [forced, setForced] = useState(false);

  if (capability === "pending") return <WorldLoading />;
  if (capability === "ok" || forced) return <WorldCanvas {...props} />;

  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="font-display text-h2 text-ink">Nuestro mundito está descansando</p>
        <p className="mt-3 text-muted">{MESSAGES[capability]}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/lista"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-medium text-paper"
          >
            Ver nuestra lista
          </Link>
          {capability !== "no-webgl" && (
            <button type="button" onClick={() => setForced(true)} className="min-h-11 px-4 text-meta text-accent underline">
              Mostrar el mundo igualmente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WorldLoading() {
  return (
    <div className="flex h-full items-center justify-center" role="status">
      <p className="animate-pulse font-display text-title text-muted">Preparando nuestro mundito…</p>
    </div>
  );
}
