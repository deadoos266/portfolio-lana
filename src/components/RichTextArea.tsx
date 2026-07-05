"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";

/**
 * Éditeur de texte enrichi utilisable dans les formulaires du dashboard.
 * Rendu :
 *   ┌─ Barre d'outils : [Police ▾] [B] [I] [U] ─────────────────┐
 *   │  Zone de saisie (contenteditable)                          │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Le HTML formaté est stocké dans un <input type="hidden"> portant le `name`
 * fourni : il sera donc automatiquement envoyé au serveur avec le reste du
 * formulaire, sans modification des Server Actions existantes.
 *
 * La liste des polices est chargée depuis Google Fonts au montage. Toutes les
 * polices s'ajoutent au document afin que le rendu dans la zone de saisie
 * corresponde à ce que Lana verra sur son site public.
 */
interface RichTextAreaProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: number;
  label?: string;
  helpText?: string;
}

interface FontOption {
  label: string;
  family: string; // valeur CSS font-family
  googleName: string | null;
}

const FONTS: ReadonlyArray<FontOption> = [
  { label: "Times New Roman", family: '"Times New Roman", Times, serif', googleName: null },
  { label: "Playfair Display", family: '"Playfair Display", serif', googleName: "Playfair Display" },
  { label: "Cormorant Garamond", family: '"Cormorant Garamond", serif', googleName: "Cormorant Garamond" },
  { label: "Merriweather", family: '"Merriweather", serif', googleName: "Merriweather" },
  { label: "Lora", family: '"Lora", serif', googleName: "Lora" },
  { label: "EB Garamond", family: '"EB Garamond", serif', googleName: "EB Garamond" },
  { label: "Libre Baskerville", family: '"Libre Baskerville", serif', googleName: "Libre Baskerville" },
  { label: "PT Serif", family: '"PT Serif", serif', googleName: "PT Serif" },
  { label: "Fraunces", family: '"Fraunces", serif', googleName: "Fraunces" },
  { label: "DM Serif Display", family: '"DM Serif Display", serif', googleName: "DM Serif Display" },
  { label: "Abril Fatface", family: '"Abril Fatface", serif', googleName: "Abril Fatface" },
  { label: "Yeseva One", family: '"Yeseva One", serif', googleName: "Yeseva One" },
  { label: "Inter", family: '"Inter", sans-serif', googleName: "Inter" },
  { label: "Poppins", family: '"Poppins", sans-serif', googleName: "Poppins" },
  { label: "Montserrat", family: '"Montserrat", sans-serif', googleName: "Montserrat" },
  { label: "Raleway", family: '"Raleway", sans-serif', googleName: "Raleway" },
  { label: "Work Sans", family: '"Work Sans", sans-serif', googleName: "Work Sans" },
  { label: "Space Grotesk", family: '"Space Grotesk", sans-serif', googleName: "Space Grotesk" },
  { label: "Manrope", family: '"Manrope", sans-serif', googleName: "Manrope" },
  { label: "Caveat", family: '"Caveat", cursive', googleName: "Caveat" },
  { label: "Dancing Script", family: '"Dancing Script", cursive', googleName: "Dancing Script" },
  { label: "Kalam", family: '"Kalam", cursive', googleName: "Kalam" },
  { label: "Sacramento", family: '"Sacramento", cursive', googleName: "Sacramento" },
  { label: "Amatic SC", family: '"Amatic SC", cursive', googleName: "Amatic SC" },
  { label: "Pacifico", family: '"Pacifico", cursive', googleName: "Pacifico" },
  { label: "Bebas Neue", family: '"Bebas Neue", sans-serif', googleName: "Bebas Neue" },
  { label: "Anton", family: '"Anton", sans-serif', googleName: "Anton" },
  { label: "Oswald", family: '"Oswald", sans-serif', googleName: "Oswald" },
  { label: "Courier Prime", family: '"Courier Prime", monospace', googleName: "Courier Prime" },
  { label: "Special Elite", family: '"Special Elite", monospace', googleName: "Special Elite" },
  { label: "Cutive Mono", family: '"Cutive Mono", monospace', googleName: "Cutive Mono" },
];

const GOOGLE_FONTS_HREF = (() => {
  const families = FONTS.filter((f) => f.googleName)
    .map((f) => `family=${f.googleName!.replace(/ /g, "+")}:wght@400;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
})();

/** Convertit un texte brut (avec syntaxe *italique* / **gras**) en HTML léger. */
function textToHtml(input: string): string {
  if (!input) return "";
  // Si c'est déjà du HTML (contient une balise), on le laisse tel quel.
  if (/<\/?[a-z][^>]*>/i.test(input)) return input;
  return input
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const withBold = escaped.replace(
        /\*\*([^*\n]+)\*\*/g,
        "<strong>$1</strong>",
      );
      const withItalic = withBold.replace(
        /\*([^*\n]+)\*/g,
        "<em>$1</em>",
      );
      return `<p>${withItalic || "<br>"}</p>`;
    })
    .join("");
}

export function RichTextArea({
  name,
  defaultValue,
  placeholder,
  minHeight = 200,
  label,
  helpText,
}: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>(() => textToHtml(defaultValue ?? ""));
  const [currentFont, setCurrentFont] = useState<string>("");

  // Initialise le HTML dans le contenteditable au premier rendu.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    // On ne veut PAS re-injecter à chaque frappe, seulement à l'initialisation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncFromEditor() {
    if (!editorRef.current) return;
    setHtml(editorRef.current.innerHTML);
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    // execCommand est deprecated mais reste largement supporté et évite une
    // grosse dépendance d'éditeur riche. On ne cible que 4 commandes basiques.
    document.execCommand(command, false, value);
    syncFromEditor();
  }

  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "span", "a"],
      ALLOWED_ATTR: ["style", "href", "target", "rel"],
    });
  }, [html]);

  return (
    <div className="space-y-2">
      {/* Charge les polices Google une seule fois par page */}
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />

      {label && (
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-zinc-200 bg-zinc-50 p-2">
        <select
          value={currentFont}
          onChange={(e) => {
            setCurrentFont(e.target.value);
            const font = FONTS.find((f) => f.label === e.target.value);
            if (font) exec("fontName", font.family);
          }}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
          aria-label="Police"
        >
          <option value="">Police…</option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.label} style={{ fontFamily: f.family }}>
              {f.label}
            </option>
          ))}
        </select>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolButton onClick={() => exec("bold")} label="Gras (Ctrl+B)">
          <b>B</b>
        </ToolButton>
        <ToolButton onClick={() => exec("italic")} label="Italique (Ctrl+I)">
          <i>I</i>
        </ToolButton>
        <ToolButton onClick={() => exec("underline")} label="Souligné (Ctrl+U)">
          <span className="underline">U</span>
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolButton
          onClick={() => exec("removeFormat")}
          label="Retirer le formatage"
        >
          <span className="text-xs">✕ format</span>
        </ToolButton>
      </div>

      {/* Zone de saisie */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        data-placeholder={placeholder}
        className="rich-editor rounded-b-lg border border-t-0 border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-zinc-900"
        style={{ minHeight }}
      />

      {/* Valeur envoyée dans le form */}
      <input type="hidden" name={name} value={sanitizedHtml} />

      {helpText && <p className="text-xs text-zinc-400">{helpText}</p>}
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Évite de perdre la sélection dans la zone de saisie
        e.preventDefault();
      }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-zinc-700 transition hover:bg-white hover:shadow-sm"
    >
      {children}
    </button>
  );
}
