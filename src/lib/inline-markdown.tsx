import type { ReactNode } from "react";

// Reconnaît **gras** puis *italique* (l'ordre importe : gras d'abord).
const TOKEN_REGEX = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

/**
 * Rend un texte en supportant une syntaxe légère façon Markdown :
 *   *mot*   → italique
 *   **mot** → gras
 * Utilisé pour les textes que Lana saisit depuis son dashboard.
 */
export function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }

    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}
