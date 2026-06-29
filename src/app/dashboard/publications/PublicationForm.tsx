import Image from "next/image";
import {
  MEDIA_TYPES,
  MEDIA_LABELS,
  type Publication,
} from "@/lib/types";

const field = "input";
const label = "text-xs font-medium text-zinc-600";

interface PublicationFormProps {
  action: (formData: FormData) => void | Promise<void>;
  publication?: Publication;
  submitLabel: string;
}

export function PublicationForm({
  action,
  publication,
  submitLabel,
}: PublicationFormProps) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <label className={label}>Titre *</label>
        <input
          name="title"
          required
          defaultValue={publication?.title ?? ""}
          className={field}
        />
      </div>

      <div className="space-y-1">
        <label className={label}>Type</label>
        <select
          name="media_type"
          defaultValue={publication?.media_type ?? "ecrit"}
          className={field}
        >
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {MEDIA_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={label}>Média</label>
        <input
          name="outlet"
          defaultValue={publication?.outlet ?? ""}
          placeholder="ex: Ouest-France, Radio Campus…"
          className={field}
        />
      </div>

      <div className="space-y-1">
        <label className={label}>Date de parution</label>
        <input
          name="published_date"
          type="date"
          defaultValue={publication?.published_date ?? ""}
          className={field}
        />
      </div>

      <div className="space-y-1">
        <label className={label}>Rubrique</label>
        <input
          name="category"
          defaultValue={publication?.category ?? ""}
          placeholder="ex: Société, Culture…"
          className={field}
        />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label className={label}>Lien (article / son / vidéo)</label>
        <input
          name="url"
          defaultValue={publication?.url ?? ""}
          placeholder="https://…"
          className={field}
        />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label className={label}>Extrait / chapô</label>
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={publication?.excerpt ?? ""}
          className={field}
        />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label className={label}>Image de couverture</label>
        {publication?.cover_image_url && (
          <div className="mb-2">
            <Image
              src={publication.cover_image_url}
              alt=""
              width={160}
              height={90}
              className="rounded-md border border-zinc-200 object-cover"
            />
            <p className="text-xs text-zinc-400">
              Laisse vide pour conserver l&apos;image actuelle.
            </p>
          </div>
        )}
        <input name="image" type="file" accept="image/*" className={field} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={publication?.published ?? true}
          className="h-4 w-4"
        />
        <label htmlFor="published" className="text-sm text-zinc-700">
          Visible sur le site
        </label>
      </div>

      <div className="space-y-1">
        <label className={label}>Ordre d&apos;affichage</label>
        <input
          name="display_order"
          type="number"
          defaultValue={publication?.display_order ?? 0}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
