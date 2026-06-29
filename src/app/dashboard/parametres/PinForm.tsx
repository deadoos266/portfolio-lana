"use client";

import { useActionState } from "react";
import { changePin, type ChangePinState } from "@/app/dashboard/actions";

const initialState: ChangePinState = { error: "", success: false };

const field =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:border-zinc-900";

export function PinForm() {
  const [state, formAction, pending] = useActionState(changePin, initialState);

  return (
    <form action={formAction} className="card max-w-sm space-y-4 p-6">
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-600">Code actuel</label>
        <input
          name="current"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="off"
          placeholder="••••••"
          className={field}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-600">
          Nouveau code (6 chiffres)
        </label>
        <input
          name="next"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="off"
          placeholder="••••••"
          className={field}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Code mis à jour ✓</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full justify-center disabled:opacity-50"
      >
        {pending ? "…" : "Changer le code"}
      </button>
    </form>
  );
}
