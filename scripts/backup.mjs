import { mkdir, writeFile } from "node:fs/promises";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  process.exit(1);
}

// Tables à sauvegarder + colonne de tri (clé primaire) pour la pagination.
const TABLES = [
  { name: "applications", order: "id" },
  { name: "tracked_links", order: "id" },
  { name: "link_opens", order: "id" },
  { name: "publications", order: "id" },
  { name: "page_visits", order: "id" },
  { name: "contact_messages", order: "id" },
  { name: "app_settings", order: "key" },
  // Contenu des 7 cartes du parcours : textes, rubriques, galeries, PDF.
  // C'est le travail de Lana ; il manquait à la sauvegarde.
  { name: "parcours_cards", order: "display_order" },
];

const PAGE = 1000;

// Donnees personnelles a ne JAMAIS versionner (RGPD) : une adresse IP, un
// user-agent ou une ville identifient un visiteur. Le depot est passe public
// le 09/09/2026 en exposant 106 adresses IP de visiteurs reels.
const CHAMPS_SENSIBLES =
  /^(ip|user_agent|city|country|region|email|phone|.*_hash|.*_secret|.*_token)$/i;

function nettoyer(lignes) {
  return lignes.map((ligne) =>
    Object.fromEntries(
      Object.entries(ligne).filter(([cle]) => !CHAMPS_SENSIBLES.test(cle)),
    ),
  );
}

async function fetchAll(table, order) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=*&order=${order}&limit=${PAGE}&offset=${offset}`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
    );
    if (!res.ok) {
      throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

await mkdir("backups", { recursive: true });

for (const { name, order } of TABLES) {
  const rows = await fetchAll(name, order);
  await writeFile(
    `backups/${name}.json`,
    JSON.stringify(nettoyer(rows), null, 2) + "\n",
  );
  console.log(`${name}: ${rows.length} lignes`);
}

console.log("Sauvegarde terminée.");
