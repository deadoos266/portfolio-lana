"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        action={formAction}
        className="w-full max-w-xs space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Espace de suivi
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Entre ton code à 6 chiffres.</p>
        </div>

        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="off"
          autoFocus
          required
          placeholder="••••••"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-center text-2xl tracking-[0.6em] outline-none focus:border-zinc-900"
        />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "…" : "Entrer"}
        </button>
      </form>
    </main>
  );
}
