export interface OgTags {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  ok: boolean;
}

function decode(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&raquo;/g, "»")
    .replace(/&laquo;/g, "«")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&acirc;/g, "â")
    .replace(/&icirc;/g, "î")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/&ugrave;/g, "ù")
    .replace(/&ccedil;/g, "ç")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}["'][^>]*>`,
    "i",
  );
  const match = html.match(re);
  if (!match) return null;
  const contentMatch = match[0].match(/content=["']([^"']*)["']/i);
  return contentMatch ? decode(contentMatch[1]) : null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decode(match[1].trim()) : null;
}

/**
 * Récupère les meta tags Open Graph d'une URL externe pour construire une
 * carte-aperçu. Cache 1h : évite de re-fetcher à chaque affichage.
 */
export async function fetchOgTags(url: string): Promise<OgTags> {
  const fallback: OgTags = {
    url,
    title: null,
    description: null,
    image: null,
    siteName: null,
    ok: false,
  };

  try {
    new URL(url);
  } catch {
    return fallback;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LanaHervePortfolio/1.0; +https://lana-herve.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;

    const html = await res.text();
    let image =
      extractMeta(html, "og:image") ??
      extractMeta(html, "twitter:image") ??
      null;
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, url).toString();
      } catch {
        image = null;
      }
    }

    return {
      url,
      title:
        extractMeta(html, "og:title") ??
        extractMeta(html, "twitter:title") ??
        extractTitle(html),
      description:
        extractMeta(html, "og:description") ??
        extractMeta(html, "twitter:description") ??
        extractMeta(html, "description"),
      image,
      siteName:
        extractMeta(html, "og:site_name") ??
        (() => {
          try {
            return new URL(url).hostname.replace(/^www\./, "");
          } catch {
            return null;
          }
        })(),
      ok: true,
    };
  } catch {
    return fallback;
  }
}
