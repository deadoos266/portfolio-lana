import sanitizeHtml from "sanitize-html";

/**
 * Configuration commune de nettoyage pour le contenu produit par l'éditeur
 * riche de Lana (RichTextArea). Seules les balises et attributs strictement
 * nécessaires au formatage utilisateur sont autorisés.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "span",
    "a",
    "div",
    "blockquote",
    "font",
  ],
  allowedAttributes: {
    span: ["style"],
    p: ["style"],
    div: ["style"],
    blockquote: ["style"],
    a: ["href", "target", "rel", "style"],
    font: ["color", "face", "size"],
  },
  allowedStyles: {
    "*": {
      "font-family": [/^[^<>;]*$/i],
      "text-decoration": [/^(underline|none|line-through)$/i],
      "font-weight": [/^(bold|normal|\d{3})$/i],
      "font-style": [/^(italic|normal)$/i],
      "font-size": [/^\d{1,3}(px|pt|em|rem|%)$/i],
      "line-height": [/^\d+(\.\d+)?$/i],
      "text-align": [/^(left|center|right|justify)$/i],
      "margin-left": [/^\d{1,3}(px|em|rem)$/i],
      "padding-left": [/^\d{1,3}(px|em|rem)$/i],
      color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i, /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)$/i, /^[a-z]{3,20}$/i],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i, /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)$/i, /^[a-z]{3,20}$/i],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
};

export function sanitizeRich(input: string): string {
  return sanitizeHtml(input, OPTIONS);
}
