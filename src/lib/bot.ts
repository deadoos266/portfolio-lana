export interface BotSignal {
  isBot: boolean;
  reason: string | null;
}

// Signatures de robots fréquents : aperçus de liens (réseaux sociaux / messageries),
// scanners de mail, robots d'indexation, clients automatisés.
const BOT_UA_PATTERNS: ReadonlyArray<RegExp> = [
  // Aperçus de liens (messageries / réseaux)
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /linkedinbot/i,
  /slackbot/i,
  /slack-imgproxy/i,
  /whatsapp/i,
  /telegrambot/i,
  /twitterbot/i,
  /discordbot/i,
  /pinterest/i,
  /redditbot/i,
  /skypeuripreview/i,
  /vkshare/i,
  /bitlybot/i,
  // Robots d'indexation
  /googlebot/i,
  /google-read-aloud/i,
  /googleimageproxy/i,
  /google-inspectiontool/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /applebot/i,
  /petalbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /amazonbot/i,
  // Scanners de mail / sécurité
  /mimecast/i,
  /proofpoint/i,
  /barracuda/i,
  /microsoft-office/i,
  /ms-office/i,
  /outlook/i,
  /safelinks/i,
  // Clients / bibliothèques automatisés
  /curl\//i,
  /\bwget\b/i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /\bjava\//i,
  /okhttp/i,
  /apache-httpclient/i,
  /axios\//i,
  /node-fetch/i,
  /headlesschrome/i,
  /phantomjs/i,
  // Termes génériques
  /\bbot\b/i,
  /crawler/i,
  /spider/i,
  /\bpreview\b/i,
  /scanner/i,
  /probe/i,
];

export interface BotContext {
  userAgent: string | null;
  secPurpose?: string | null; // en-tête Sec-Purpose (ex: "prefetch")
  purpose?: string | null; // en-tête Purpose / X-Purpose (ex: "preview")
}

/**
 * Détermine si une ouverture provient d'un automate plutôt que d'un humain.
 * Conservateur : en cas de doute, considéré comme humain (on ne masque pas à tort).
 */
export function detectBot(ctx: BotContext): BotSignal {
  const ua = ctx.userAgent?.trim() ?? "";

  if (ua.length === 0) {
    return { isBot: true, reason: "user-agent absent" };
  }

  for (const pattern of BOT_UA_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, reason: "signature robot" };
    }
  }

  // Requêtes de pré-chargement / aperçu (le navigateur ou un proxy précharge).
  if (ctx.secPurpose && /prefetch|preview/i.test(ctx.secPurpose)) {
    return { isBot: true, reason: "pré-chargement" };
  }
  if (ctx.purpose && /prefetch|preview/i.test(ctx.purpose)) {
    return { isBot: true, reason: "pré-chargement" };
  }

  return { isBot: false, reason: null };
}
