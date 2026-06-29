"use client";

import { useEffect } from "react";

/**
 * Enregistre une visite à chaque chargement de page publique.
 * Ignore les pages d'administration (dashboard / login).
 * Rendu dans le layout racine, ne produit aucun élément visible.
 */
export function VisitTracker() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/dashboard") || path.startsWith("/login")) return;

    const payload = JSON.stringify({
      path,
      referrer: document.referrer || null,
    });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon?.("/api/track", blob)) return;
    } catch {
      // sendBeacon indisponible -> repli sur fetch
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
