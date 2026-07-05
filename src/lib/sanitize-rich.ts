import sanitizeHtml from "sanitize-html";

/**
 * Configuration commune de nettoyage pour le contenu produit par l'éditeur
 * riche de Lana (RichTextArea). Seules les balises et attributs strictement
 * nécessaires au formatage utilisateur sont autorisés.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "span", "a"],
  allowedAttributes: {
    span: ["style"],
    a: ["href", "target", "rel"],
  },
  allowedStyles: {
    "*": {
      "font-family": [/^[^<>;]*$/i], // n'importe quelle famille sans caractères dangereux
      "text-decoration": [/^(underline|none|line-through)$/i],
      "font-weight": [/^(bold|normal|\d{3})$/i],
      "font-style": [/^(italic|normal)$/i],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
};

export function sanitizeRich(input: string): string {
  return sanitizeHtml(input, OPTIONS);
}
