import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicationForm } from "../PublicationForm";
import { updatePublication } from "../actions";
import { DeletePublicationButton } from "@/components/DeletePublicationButton";
import type { Publication } from "@/lib/types";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const publication = data as Publication;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/publications"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Modifier la publication
      </h1>
      <PublicationForm
        action={updatePublication.bind(null, id)}
        publication={publication}
        submitLabel="Enregistrer"
      />
      <div className="border-t border-zinc-200 pt-6">
        <DeletePublicationButton id={id} />
      </div>
    </div>
  );
}
