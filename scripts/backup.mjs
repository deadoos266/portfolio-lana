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
];

const PAGE = 1000;

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
    JSON.stringify(rows, null, 2) + "\n",
  );
  console.log(`${name}: ${rows.length} lignes`);
}

console.log("Sauvegarde terminée.");
