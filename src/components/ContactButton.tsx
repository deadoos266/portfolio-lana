"use client";

import { useEffect, useState } from "react";

interface ContactButtonProps {
  email: string;
  phone: string | null;
}

/**
 * Bouton « Me contacter » qui ouvre une petite fenêtre avec l'adresse mail
 * et le numéro. Avant, le bouton lançait directement le logiciel de
 * messagerie : brutal, et inutilisable pour qui veut seulement lire,
 * sélectionner ou copier les coordonnées.
 */
export function ContactButton({ email, phone }: ContactButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
        style={{
          background: "var(--c-button-bg)",
          color: "var(--c-button-text)",
        }}
      >
        Me contacter
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Coordonnées de contact"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border-2 p-7 shadow-xl"
            style={{
              borderColor: "var(--c-text-titles)",
              background: "var(--c-bg-main)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700"
            >
              ×
            </button>

            <p
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontStyle: "italic",
                textDecoration: "underline",
                textUnderlineOffset: "6px",
                color: "var(--c-text-titles)",
              }}
              className="text-2xl tracking-tight"
            >
              Contact
            </p>

            <div className="mt-6 space-y-4">
              <ContactRow
                label="Adresse mail"
                value={email}
                href={`mailto:${email}`}
                actionLabel="Écrire"
              />
              {phone && (
                <ContactRow
                  label="Téléphone"
                  value={phone}
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  actionLabel="Appeler"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ContactRow({
  label,
  value,
  href,
  actionLabel,
}: {
  label: string;
  value: string;
  href: string;
  actionLabel: string;
}) {
  // "idle" | "copied" (presse-papiers OK) | "selected" (repli : texte
  // sélectionné, l'utilisateur termine avec Ctrl+C)
  const [state, setState] = useState<"idle" | "copied" | "selected">("idle");

  async function copy() {
    let next: "copied" | "selected" = "copied";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Presse-papiers refusé (navigateur ancien, page sans focus, contexte
      // non sécurisé) : on sélectionne le texte et on le dit clairement,
      // sinon le clic semble ne rien faire.
      const el = document.getElementById(`contact-value-${label}`);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      next = "selected";
    }
    setState(next);
    setTimeout(() => setState("idle"), 2500);
  }

  const buttonLabel =
    state === "copied" ? "Copié ✓" : state === "selected" ? "Ctrl + C" : "Copier";

  return (
    <div className="rounded-xl border border-black/10 bg-white/70 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </span>

      {/* `select-all` : un simple clic sélectionne toute l'adresse. Le texte
          n'est PAS dans un lien, sinon le glisser sélectionnerait le lien
          au lieu du texte. */}
      <p
        id={`contact-value-${label}`}
        className="mt-1 select-all break-all text-sm font-medium"
        style={{ color: "var(--c-text-body)" }}
      >
        {value}
      </p>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:bg-black/5"
        >
          {buttonLabel}
        </button>
        <a
          href={href}
          className="rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80"
          style={{
            borderColor: "var(--c-text-titles)",
            color: "var(--c-text-titles)",
          }}
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}
