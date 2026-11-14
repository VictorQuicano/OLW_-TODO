"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useTransition } from "react";
import { choosePetAction } from "@/app/actions/session";
import { PET_IDS, PET_LABELS, type PetId } from "@/domain/users/pets";
import { use3dCapability } from "@/hooks/use-3d-capability";
import { cn } from "@/lib/utils/cn";

const PetPreview = dynamic(() => import("@/components/3d/PetPreview"), { ssr: false });

const previewSrc = (pet: PetId) => `/models/pets/previews/animal-${pet}.png`;

export function PetPicker({ initial }: { initial?: PetId }) {
  const [selected, setSelected] = useState<PetId>(initial ?? "cat");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const capability = use3dCapability();

  const confirm = () =>
    startTransition(async () => {
      const result = await choosePetAction(selected);
      if (result?.error) setError(result.error);
    });

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem] md:items-start">
      <fieldset>
        <legend className="sr-only">Mascotas</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {PET_IDS.map((pet) => (
            <label
              key={pet}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-md border-2 p-1.5 transition-colors duration-(--duration-fast)",
                "has-focus-visible:outline-2 has-focus-visible:outline-accent",
                selected === pet ? "border-accent bg-accent-soft" : "border-transparent hover:bg-surface",
              )}
            >
              <input
                type="radio"
                name="pet"
                value={pet}
                checked={selected === pet}
                onChange={() => setSelected(pet)}
                className="sr-only"
              />
              <Image src={previewSrc(pet)} alt="" width={96} height={96} className="size-16 sm:size-20" />
              <span className="mt-1 text-meta text-ink">{PET_LABELS[pet]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="order-first rounded-lg bg-surface p-4 shadow-soft md:sticky md:top-8 md:order-none">
        <div className="aspect-square">
          {capability === "ok" ? (
            <PetPreview pet={selected} />
          ) : (
            <Image src={previewSrc(selected)} alt="" width={320} height={320} className="size-full object-contain" />
          )}
        </div>
        <p className="mt-2 text-center font-display text-h2 text-ink">{PET_LABELS[selected]}</p>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="mt-4 min-h-12 w-full rounded-full bg-accent font-medium text-surface transition-opacity disabled:opacity-60"
        >
          {pending ? "Guardando…" : "¡Este soy yo!"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-meta text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
