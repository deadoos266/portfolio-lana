"use client";

import { useEffect, useState } from "react";

interface ContactButtonProps {
  email: string;
  phone: string | null;
}

/**
 * Bouton « Me contacter » qui ouvre une petite fenêtre avec l'adresse mail
 * et le numéro, chacun cliquable. Avant, le bouton lançait directement le
 * logiciel de messagerie : brutal, et inutilisable pour qui veut seulement
 * lire ou copier les coordonnées.
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

  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : null;

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

            <div className="mt-6 space-y-3">
              <ContactRow
                label="Adresse mail"
                value={email}
                href={`mailto:${email}`}
                icon="✉️"
              />
              {phone && telHref && (
                <ContactRow
                  label="Téléphone"
                  value={phone}
                  href={telHref}
                  icon="📞"
                />
              )}
            </div>

            <p className="mt-5 text-center text-xs text-zinc-400">
              Clique pour écrire ou appeler directement.
            </p>
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
  icon,
}: {
  label: string;
  value: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 transition hover:border-black/20 hover:shadow-sm"
    >
      <span aria-hidden className="text-lg">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-zinc-500">{label}</span>
        <span
          className="block truncate text-sm font-medium"
          style={{ color: "var(--c-text-body)" }}
        >
          {value}
        </span>
      </span>
    </a>
  );
}
