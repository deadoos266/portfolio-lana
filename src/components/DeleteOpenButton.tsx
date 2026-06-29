"use client";

import { useTransition } from "react";
import { deleteOpen } from "@/app/dashboard/actions";

interface DeleteOpenButtonProps {
  id: string;
  applicationId: string;
}

export function DeleteOpenButton({ id, applicationId }: DeleteOpenButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette visite ?")) {
      return;
    }
    startTransition(() => {
      void deleteOpen(id, applicationId);
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
