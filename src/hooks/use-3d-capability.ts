"use client";

import { useSyncExternalStore } from "react";

export type Capability = "pending" | "ok" | "no-webgl" | "reduced-motion" | "low-power";

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function getCapability(): Capability {
  if (!hasWebGL()) return "no-webgl";
  if (window.matchMedia(REDUCED).matches) return "reduced-motion";
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return "low-power";
  return "ok";
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Whether this device should render 3D. "pending" during SSR and hydration. */
export function use3dCapability(): Capability {
  return useSyncExternalStore(subscribe, getCapability, () => "pending");
}
