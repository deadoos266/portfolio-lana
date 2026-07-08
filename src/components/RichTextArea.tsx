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

const SIZES: ReadonlyArray<number> = [
  10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80, 96, 128, 160, 200, 250,
];
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
  const savedRangeRef = useRef<Range | null>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>(() => textToHtml(defaultValue ?? ""));
  const [currentFont, setCurrentFont] = useState<string>("");
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [hexInput, setHexInput] = useState("");

  // Ferme le popover couleur au clic en dehors.
  useEffect(() => {
    if (!showColorPopover) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(event.target as Node)
      ) {
        setShowColorPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPopover]);

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
   * Ouvrir le popover fait perdre la sélection de texte (le focus part vers
   * le popover) : on la mémorise avant d'ouvrir pour pouvoir la restaurer au
   * moment d'appliquer la couleur choisie.
   */
  function openColorPopover() {
    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed
        ? selection.getRangeAt(0).cloneRange()
        : null;
    if (!range) {
      window.alert("Sélectionne d'abord le texte que tu veux colorer.");
      return;
    }
    savedRangeRef.current = range;
    setShowColorPopover(true);
  }

  /**
   * Applique une couleur au texte sélectionné, via le nuancier libre ou un
   * code couleur (#RRGGBB) tapé à la main.
   */
  function applyColor(color: string) {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    // Le DOM a changé (le texte est maintenant dans un <span>) : on remémorise
    // la sélection actuelle pour pouvoir appliquer une autre couleur sans
    // re-sélectionner le texte.
    const after = window.getSelection();
    if (after && after.rangeCount > 0 && !after.getRangeAt(0).collapsed) {
      savedRangeRef.current = after.getRangeAt(0).cloneRange();
    }
    syncFromEditor();
  }

  /**
   * Transforme la sélection en lien hypertexte (ou retire le lien si l'URL
   * est vide). Ouvre dans un nouvel onglet par défaut.
   */
  function insertLink() {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      window.alert("Sélectionne d'abord le texte que tu veux transformer en lien.");
      return;
    }
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      window.alert("Sélectionne d'abord le texte que tu veux transformer en lien.");
      return;
    }
    const input = window.prompt(
      "Colle l'adresse (URL) du lien :\n(laisse vide pour retirer le lien)",
      "https://",
    );
    if (input === null) return;
    const url = input.trim();
    if (!url) {
      document.execCommand("unlink");
      syncFromEditor();
      return;
    }
    // Ajoute https:// si l'utilisatrice a oublié
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    document.execCommand("createLink", false, normalized);
    // execCommand ne pose pas target="_blank" ; on le rajoute manuellement
    // à l'ancre nouvellement créée.
    const anchors = editorRef.current?.querySelectorAll<HTMLAnchorElement>(
      `a[href="${normalized}"]`,
    );
    anchors?.forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
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

        {/* Couleur — regroupée avec Police / Taille / Interligne */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={openColorPopover}
            title="Couleur du texte"
            aria-label="Couleur du texte"
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <span aria-hidden>🎨</span>
            <span>Couleur…</span>
          </button>

          {showColorPopover && (
            <div
              ref={colorPopoverRef}
              className="absolute left-0 top-full z-20 mt-1 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
            >
              <input
                type="color"
                defaultValue="#000000"
                onChange={(e) => applyColor(e.target.value)}
                title="Nuancier libre"
                aria-label="Choisir une couleur avec le nuancier"
                className="h-9 w-9 cursor-pointer rounded border border-zinc-200 p-0"
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = hexInput.trim();
                  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
                    applyColor(value);
                  } else {
                    window.alert("Code couleur invalide. Exemple : #FBF9F4");
                  }
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="#FBF9F4"
                  aria-label="Code couleur (hexadécimal)"
                  className="w-24 rounded-md border border-zinc-200 px-2 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                >
                  Appliquer
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowColorPopover(false)}
                aria-label="Fermer le sélecteur de couleur"
                className="ml-1 text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

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

        <ToolButton onClick={insertLink} label="Insérer un lien">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1 1M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1-1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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

      {/* Zone de saisie — mêmes styles de base que le rendu du site pour WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="rich-editor rounded-b-lg border border-t-0 border-zinc-200 bg-white px-4 py-3 outline-none focus:border-zinc-900"
        style={{
          minHeight,
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: "18px",
          lineHeight: 1.6,
        }}
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
