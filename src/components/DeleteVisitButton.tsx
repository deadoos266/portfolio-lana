"use client";

import { useTransition } from "react";
import { deleteVisit } from "@/app/dashboard/actions";

export function DeleteVisitButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette visite ?")) {
      return;
    }
    startTransition(() => {
      void deleteVisit(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title="Supprimer cette visite"
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Supprimer"}
    </button>
  );
}
