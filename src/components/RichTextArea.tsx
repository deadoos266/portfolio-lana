"use client";

import { useEffect, useRef, useState } from "react";

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

const SIZES: ReadonlyArray<number> = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
const LINE_HEIGHTS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Simple", value: "1" },
  { label: "1,15", value: "1.15" },
  { label: "1,5", value: "1.5" },
  { label: "Double", value: "2" },
];

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
    // grosse dépendance d'éditeur riche.
    document.execCommand(command, false, value);
    syncFromEditor();
  }

  /**
   * Intercepte le collage pour éviter d'injecter le HTML « sale » de Word,
   * Google Docs, un PDF, etc. On récupère le texte brut du presse-papier
   * et on reconstruit un HTML propre : chaque ligne vide sépare les
   * paragraphes, chaque ligne simple devient un saut à la ligne.
   */
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const raw = event.clipboardData.getData("text/plain");
    if (!raw) return;

    const escaped = (s: string): string =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const html = raw
      .split(/\n{2,}/) // paragraphes séparés par une ligne vide
      .map((block) => {
        const inner = block
          .split(/\n/) // sauts de ligne simples dans un paragraphe
          .map(escaped)
          .join("<br>");
        return `<p>${inner || "<br>"}</p>`;
      })
      .join("");

    document.execCommand("insertHTML", false, html);
    syncFromEditor();
  }

  /**
   * Applique un style CSS inline sur la sélection actuelle en enveloppant
   * son contenu dans un <span>. Utilisé pour la taille de police et
   * l'interligne, que execCommand ne gère pas proprement.
   */
  function wrapSelection(styleName: string, value: string) {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    span.style.setProperty(styleName, value);
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);

      // Restaure la sélection sur le contenu enveloppé
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } catch {
      // La sélection couvre des nœuds non-modifiables : on abandonne
      // silencieusement plutôt que de casser.
    }
    syncFromEditor();
  }

  // Le HTML est nettoyé au moment de l'affichage sur le site public
  // (via sanitizeRich dans RichContent). On envoie donc la valeur brute.

  return (
    <div className="space-y-2">
      {/* Charge les polices Google une seule fois par page */}
      <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />

      {label && (
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-zinc-200 bg-zinc-50 p-2">
        {/* Police */}
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

        {/* Taille */}
        <select
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            wrapSelection("font-size", `${e.target.value}px`);
            e.currentTarget.value = "";
          }}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
          aria-label="Taille"
          title="Taille du texte"
        >
          <option value="">Taille…</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Interligne */}
        <select
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            wrapSelection("line-height", e.target.value);
            e.currentTarget.value = "";
          }}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
          aria-label="Interligne"
          title="Interligne"
        >
          <option value="">Interligne…</option>
          {LINE_HEIGHTS.map((lh) => (
            <option key={lh.value} value={lh.value}>
              {lh.label}
            </option>
          ))}
        </select>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        {/* B / I / U */}
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

        {/* Alignement */}
        <ToolButton onClick={() => exec("justifyLeft")} label="Aligner à gauche">
          <AlignIcon type="left" />
        </ToolButton>
        <ToolButton onClick={() => exec("justifyCenter")} label="Centrer">
          <AlignIcon type="center" />
        </ToolButton>
        <ToolButton onClick={() => exec("justifyRight")} label="Aligner à droite">
          <AlignIcon type="right" />
        </ToolButton>
        <ToolButton onClick={() => exec("justifyFull")} label="Justifier">
          <AlignIcon type="justify" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        {/* Retraits */}
        <ToolButton onClick={() => exec("outdent")} label="Diminuer le retrait">
          <span className="text-sm">←</span>
        </ToolButton>
        <ToolButton onClick={() => exec("indent")} label="Augmenter le retrait">
          <span className="text-sm">→</span>
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolButton
          onClick={() => exec("removeFormat")}
          label="Retirer le formatage"
        >
          <span className="text-xs">✕</span>
        </ToolButton>
      </div>

      {/* Zone de saisie */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="rich-editor rounded-b-lg border border-t-0 border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-zinc-900"
        style={{ minHeight }}
      />

      {/* Valeur envoyée dans le form */}
      <input type="hidden" name={name} value={html} />

      {helpText && <p className="text-xs text-zinc-400">{helpText}</p>}
    </div>
  );
}

function AlignIcon({ type }: { type: "left" | "center" | "right" | "justify" }) {
  // Trois lignes horizontales dont la longueur/position dépend du type
  const lines: ReadonlyArray<{ x1: number; x2: number }> = (() => {
    switch (type) {
      case "left":
        return [
          { x1: 3, x2: 21 },
          { x1: 3, x2: 15 },
          { x1: 3, x2: 19 },
        ];
      case "center":
        return [
          { x1: 3, x2: 21 },
          { x1: 6, x2: 18 },
          { x1: 5, x2: 19 },
        ];
      case "right":
        return [
          { x1: 3, x2: 21 },
          { x1: 9, x2: 21 },
          { x1: 5, x2: 21 },
        ];
      case "justify":
      default:
        return [
          { x1: 3, x2: 21 },
          { x1: 3, x2: 21 },
          { x1: 3, x2: 21 },
        ];
    }
  })();
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          x2={l.x2}
          y1={6 + i * 6}
          y2={6 + i * 6}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
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
