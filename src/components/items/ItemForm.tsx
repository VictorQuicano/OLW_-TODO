"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { createItemAction } from "@/app/actions/items";
import { CATEGORIES, type MvpType } from "@/domain/items/categories";
import { cn } from "@/lib/utils/cn";
import { DateField } from "./DateField";

const fieldClass = "min-h-11 w-full rounded-sm border border-line bg-surface px-3 text-ink placeholder:text-muted/70";

export function ItemForm({ type }: { type: MvpType }) {
  const [state, action, pending] = useActionState(createItemAction, null);
  // Remount the fields after every successful save → the form clears itself.
  const resetKey = state?.ok ? state.at : 0;
  return (
    <form action={action} className="rounded-md bg-surface p-4 shadow-soft">
      <input type="hidden" name="type" value={type} />
      <Fields key={resetKey} type={type} pending={pending} state={state} />
    </form>
  );
}

type State = Awaited<ReturnType<typeof createItemAction>> | null;

function Fields({ type, pending, state }: { type: MvpType; pending: boolean; state: State }) {
  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const [open, setOpen] = useState(Boolean(errors));
  const meta = CATEGORIES[type];

  return (
    <>
      <div className="flex gap-2">
        <label htmlFor={`title-${type}`} className="sr-only">
          Nombre
        </label>
        <input
          id={`title-${type}`}
          name="title"
          required
          maxLength={200}
          autoComplete="off"
          placeholder={`Ej. ${meta.titlePlaceholder}`}
          aria-invalid={errors?.title ? true : undefined}
          className={fieldClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-sm bg-accent px-4 font-medium text-surface transition-opacity disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden />
          {pending ? "Guardando…" : "Añadir"}
        </button>
      </div>
      {errors?.title && <p className="mt-2 text-meta text-danger">{errors.title[0]}</p>}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="mt-2 inline-flex min-h-11 items-center gap-1 text-meta text-muted hover:text-ink"
      >
        Más detalles
        <ChevronDown className={cn("size-4 transition-transform duration-(--duration-fast)", open && "rotate-180")} aria-hidden />
      </button>

      <div hidden={!open} className="mt-2 space-y-4">
        <CategoryFields type={type} errors={errors} />
        <DateField error={errors?.plannedDate?.[0]} />
        <div>
          <label htmlFor={`notes-${type}`} className="text-meta font-medium text-ink">
            Notas
          </label>
          <textarea id={`notes-${type}`} name="notes" rows={2} maxLength={2000} className={cn(fieldClass, "mt-1 py-2")} />
        </div>
      </div>

      {state && !state.ok && !errors && (
        <p role="alert" className="mt-2 text-meta text-danger">
          {state.error}
        </p>
      )}
    </>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-meta font-medium text-ink">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-meta text-danger">{error[0]}</p>}
    </div>
  );
}

function CategoryFields({ type, errors }: { type: MvpType; errors?: Record<string, string[] | undefined> }) {
  switch (type) {
    case "restaurant":
      return (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field id={`${type}-location`} label="Dónde" error={errors?.location}>
            <input id={`${type}-location`} name="location" maxLength={200} className={fieldClass} placeholder="Barrio o dirección" />
          </Field>
          <Field id={`${type}-priceRange`} label="Precio" error={errors?.priceRange}>
            <select id={`${type}-priceRange`} name="priceRange" className={fieldClass} defaultValue="">
              <option value="">—</option>
              <option value="1">$</option>
              <option value="2">$$</option>
              <option value="3">$$$</option>
              <option value="4">$$$$</option>
            </select>
          </Field>
        </div>
      );
    case "place":
      return (
        <Field id={`${type}-location`} label="Dónde" error={errors?.location}>
          <input id={`${type}-location`} name="location" maxLength={200} className={fieldClass} placeholder="Ciudad o zona" />
        </Field>
      );
    case "movie":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field id={`${type}-kind`} label="Tipo" error={errors?.kind}>
            <select id={`${type}-kind`} name="kind" className={fieldClass} defaultValue="movie">
              <option value="movie">Peli</option>
              <option value="series">Serie</option>
            </select>
          </Field>
          <Field id={`${type}-year`} label="Año" error={errors?.year}>
            <input id={`${type}-year`} name="year" type="number" inputMode="numeric" className={fieldClass} />
          </Field>
        </div>
      );
    case "music":
      return (
        <Field id={`${type}-artist`} label="Artista" error={errors?.artist}>
          <input id={`${type}-artist`} name="artist" maxLength={200} className={fieldClass} />
        </Field>
      );
  }
}
