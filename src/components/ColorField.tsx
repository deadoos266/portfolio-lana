"use client";

import { useState } from "react";

interface ColorFieldProps {
  name: string;
  label: string;
  defaultValue: string;
  helpText?: string;
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

/**
 * Champ couleur autonome : nuancier libre + code hexadécimal, synchronisés.
 * Contrairement au bouton couleur du RichTextArea (qui colore une sélection
 * de texte), ce champ pilote directement un réglage de fond (une seule
 * valeur envoyée au formulaire via un input caché).
 */
export function ColorField({ name, label, defaultValue, helpText }: ColorFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const swatchValue = HEX_PATTERN.test(value) ? value : "#ffffff";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchValue}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${label} — nuancier`}
          className="h-9 w-9 cursor-pointer rounded border border-zinc-200 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          title="Code couleur au format #RRGGBB"
          placeholder="#FBF9F4"
          aria-label={`${label} — code couleur`}
          className="w-28 rounded-md border border-zinc-200 px-2 py-1.5 text-sm"
        />
      </div>
      {helpText && <p className="text-xs text-zinc-400">{helpText}</p>}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
