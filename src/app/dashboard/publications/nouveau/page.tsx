import Link from "next/link";
import { PublicationForm } from "../PublicationForm";
import { createPublication } from "../actions";

export default function NouvellePublicationPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/publications"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Nouvelle publication
      </h1>
      <PublicationForm action={createPublication} submitLabel="Créer" />
    </div>
  );
}
