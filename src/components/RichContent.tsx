import DOMPurify from "isomorphic-dompurify";
import { renderInline } from "@/lib/inline-markdown";

interface RichContentProps {
  html: string | null | undefined;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Rend un texte enregistré depuis le RichTextArea du dashboard.
 * Si l'entrée contient déjà du HTML (produit par l'éditeur), on l'affiche
 * après nettoyage (whitelist stricte de balises et d'attributs).
 * Sinon, on retombe sur le rendu markdown-light historique (italique et gras).
 */
export function RichContent({ html, fallback, className, style }: RichContentProps) {
  const value = html ?? fallback ?? "";
  if (!value) return null;

  const looksLikeHtml = /<\/?[a-z][^>]*>/i.test(value);

  if (!looksLikeHtml) {
    // Format legacy : chaque ligne devient un paragraphe.
    const paragraphs = value.split("\n").filter((line) => line.trim().length > 0);
    return (
      <div className={className} style={style}>
        {paragraphs.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-4" : undefined}>
            {renderInline(p)}
          </p>
        ))}
      </div>
    );
  }

  const safe = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "span", "a"],
    ALLOWED_ATTR: ["style", "href", "target", "rel"],
  });

  return (
    <div
      className={`rich-content ${className ?? ""}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
