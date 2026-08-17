/**
 * Adresse officielle (canonique) du site.
 *
 * Le portfolio répond sur plusieurs domaines (lanaherve.fr, www.lanaherve.fr
 * et lana-herve.vercel.app). Sans adresse canonique déclarée, un moteur de
 * recherche y voit du contenu dupliqué et répartit le référencement entre
 * elles. On désigne donc explicitement le nom de domaine de Lana.
 *
 * Volontairement en dur plutôt que via une variable d'environnement : la
 * valeur doit être identique partout (sitemap, robots, balises canonical),
 * et ne pas dépendre de l'endroit d'où la page est servie.
 */
export const SITE_URL = "https://lanaherve.fr";
