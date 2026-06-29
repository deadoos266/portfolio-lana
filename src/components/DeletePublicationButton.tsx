"use client";

import { useTransition } from "react";
import { deletePublication } from "@/app/dashboard/publications/actions";

export function DeletePublicationButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Supprimer définitivement cette publication ?")) return;
    startTransition(() => {
      void deletePublication(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Supprimer cette publication"}
    </button>
  );
}
