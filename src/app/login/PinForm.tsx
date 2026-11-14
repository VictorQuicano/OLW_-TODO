"use client";

import { Delete } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/session";
import { cn } from "@/lib/utils/cn";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX = 8;

export function PinForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-10">
      {/* Remount after each failed attempt: clears the PIN and replays the shake. */}
      <PinFields key={state?.at ?? 0} error={state?.error} pending={pending} />
    </form>
  );
}

function PinFields({ error, pending }: { error?: string; pending: boolean }) {
  const [pin, setPin] = useState("");
  const reduce = useReducedMotion();
  const press = (d: string) => setPin((p) => (p.length < MAX ? p + d : p));

  return (
    <>
      <label htmlFor="pin" className="sr-only">
        PIN
      </label>
      <motion.input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        pattern="\d{4,8}"
        maxLength={MAX}
        autoFocus={Boolean(error)}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, MAX))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "pin-error" : undefined}
        initial={error && !reduce ? { x: 0 } : false}
        animate={error && !reduce ? { x: [0, -8, 8, -4, 4, 0] } : undefined}
        transition={{ duration: 0.35 }}
        className="h-16 w-full rounded-md border border-line bg-surface text-center font-display text-h2 tracking-widest text-ink placeholder:text-line"
        placeholder="••••••"
      />
      <p id="pin-error" role="alert" className="mt-3 min-h-6 text-meta text-danger">
        {error}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3" aria-hidden="true">
        {KEYS.map((k) => (
          <Key key={k} onClick={() => press(k)}>
            {k}
          </Key>
        ))}
        <Key onClick={() => setPin((p) => p.slice(0, -1))} label="Borrar">
          <Delete className="size-5" />
        </Key>
        <Key onClick={() => press("0")}>0</Key>
        <button
          type="submit"
          tabIndex={-1}
          disabled={pin.length < 4 || pending}
          className="h-16 rounded-md bg-ink font-medium text-paper transition-opacity disabled:opacity-30"
        >
          {pending ? "…" : "Entrar"}
        </button>
      </div>
      {/* Keyboard / screen-reader submit; the keypad above is a touch convenience. */}
      <button type="submit" className="sr-only focus:not-sr-only focus:mt-4 focus:block focus:text-accent">
        Entrar
      </button>
    </>
  );
}

function Key({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-16 items-center justify-center rounded-md bg-surface font-display text-h2 text-ink shadow-soft",
        "transition-transform duration-(--duration-fast) active:scale-95",
      )}
    >
      {children}
    </button>
  );
}
