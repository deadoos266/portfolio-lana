/**
 * Surveillance du site et du nom de domaine.
 *
 * Ecrit apres l'incident du 23/08/2026 : OVH avait pose un « client hold »
 * sur lanaherve.fr, ce qui retire le domaine du DNS. Le site est reste
 * injoignable 17 jours sans que personne ne s'en apercoive.
 *
 * Ce script echoue (code de sortie 1) des qu'un probleme est detecte ;
 * GitHub envoie alors automatiquement un mail au proprietaire du depot.
 */

const DOMAIN = "lanaherve.fr";
const SITE = `https://${DOMAIN}`;
const FALLBACK = "https://lana-herve.vercel.app";
const RDAP = `https://rdap.nic.fr/domain/${DOMAIN}`;

// Statuts qui retirent le domaine du DNS ou annoncent sa suppression.
const BLOCKING_STATUSES = [
  "client hold",
  "server hold",
  "pending delete",
  "redemption period",
  "suspended",
];
const EXPIRY_WARNING_DAYS = 45;

const problems = [];
const notes = [];

async function httpStatus(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.status;
  } catch (err) {
    return `injoignable (${err.cause?.code ?? err.message})`;
  }
}

// 1. Le domaine repond-il ?
const siteStatus = await httpStatus(SITE);
if (siteStatus !== 200) {
  problems.push(`Le site ne repond pas sur ${SITE} (${siteStatus}).`);
} else {
  notes.push(`${SITE} repond 200.`);
}

// 2. L'application elle-meme est-elle en ligne ? Distingue un probleme de
//    domaine d'un probleme de deploiement.
const fallbackStatus = await httpStatus(FALLBACK);
if (fallbackStatus !== 200) {
  problems.push(`L'application ne repond pas non plus sur ${FALLBACK} (${fallbackStatus}) : probleme de deploiement, pas seulement de domaine.`);
} else {
  notes.push(`${FALLBACK} repond 200.`);
}

// 3. Etat du domaine au registre (statuts bloquants + date d'expiration).
try {
  const res = await fetch(RDAP, { headers: { accept: "application/rdap+json" } });
  if (!res.ok) throw new Error(`RDAP ${res.status}`);
  const data = await res.json();

  const statuses = (data.status ?? []).map((s) => s.toLowerCase());
  const blocking = statuses.filter((s) =>
    BLOCKING_STATUSES.some((b) => s.includes(b)),
  );
  if (blocking.length > 0) {
    problems.push(`Domaine bloque au registre : ${blocking.join(", ")}. A regler dans l'espace client OVH.`);
  }

  const expiry = (data.events ?? []).find((e) => e.eventAction === "expiration");
  if (expiry) {
    const days = Math.round((new Date(expiry.eventDate) - Date.now()) / 86400000);
    notes.push(`Expiration dans ${days} jours (${expiry.eventDate.slice(0, 10)}).`);
    if (days < EXPIRY_WARNING_DAYS) {
      problems.push(`Le domaine expire dans ${days} jours : verifier le renouvellement automatique et le moyen de paiement chez OVH.`);
    }
  }

  const ns = (data.nameservers ?? []).map((n) => n.ldhName);
  notes.push(`Serveurs DNS : ${ns.length ? ns.join(", ") : "AUCUN"}`);
  if (ns.length === 0) {
    problems.push("Aucun serveur DNS declare au registre : le domaine ne peut pas fonctionner.");
  }
} catch (err) {
  // Le registre indisponible n'est pas une panne du site : on le signale
  // sans faire echouer la surveillance.
  notes.push(`Etat du domaine non verifiable pour l'instant (${err.message}).`);
}

console.log("--- Etat ---");
notes.forEach((n) => console.log("  " + n));

if (problems.length > 0) {
  console.error("\n--- PROBLEMES DETECTES ---");
  problems.forEach((p) => console.error("  * " + p));
  process.exit(1);
}

console.log("\nTout est en ligne.");
