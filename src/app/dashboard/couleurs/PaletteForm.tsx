"use client";

import { useState, useTransition } from "react";
import {
  SUGGESTIONS,
  SWATCHES,
  type SiteTheme,
  type SwatchInfo,
} from "@/lib/theme";
import { saveThemeAction, resetThemeAction } from "./actions";

const GROUPS: ReadonlyArray<SwatchInfo["group"]> = [
  "Textes",
  "Accents",
  "Fonds",
  "Boutons",
];

interface PaletteFormProps {
  initialTheme: SiteTheme;
}

export function PaletteForm({ initialTheme }: PaletteFormProps) {
  const [values, setValues] = useState<SiteTheme>(initialTheme);
  const [isSaving, startSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function updateColor(key: keyof SiteTheme, next: string) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function handleSave() {
    const formData = new FormData();
    for (const swatch of SWATCHES) {
      formData.set(swatch.key, values[swatch.key]);
    }
    startSave(async () => {
      await saveThemeAction(formData);
      setSavedAt(Date.now());
    });
  }

  function handleReset() {
    startReset(async () => {
      await resetThemeAction();
      window.location.reload();
    });
  }

  return (
    <div className="space-y-8">
      {GROUPS.map((group) => (
        <section key={group} className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SWATCHES.filter((s) => s.group === group).map((swatch) => (
              <SwatchEditor
                key={swatch.key}
                swatch={swatch}
                value={values[swatch.key]}
                onChange={(v) => updateColor(swatch.key, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50"
        >
          {isSaving ? "…" : "Enregistrer les couleurs"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline disabled:opacity-50"
        >
          Revenir aux couleurs d&apos;origine
        </button>
        {savedAt && !isSaving && (
          <span className="text-sm text-emerald-600">
            ✓ Enregistré — rafraîchis ton site (Ctrl + Maj + R)
          </span>
        )}
      </div>
    </div>
  );
}

interface SwatchEditorProps {
  swatch: SwatchInfo;
  value: string;
  onChange: (next: string) => void;
}

function SwatchEditor({ swatch, value, onChange }: SwatchEditorProps) {
  const [hexInput, setHexInput] = useState(value);

  // Synchronise le champ hex quand la couleur change ailleurs (color picker / suggestion)
  if (
    hexInput.toUpperCase() !== value.toUpperCase() &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    setHexInput(value);
  }

  function handleHexChange(input: string) {
    setHexInput(input);
    const trimmed = input.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
      onChange(trimmed.toUpperCase());
    }
  }

  const suggestions = SUGGESTIONS[swatch.key];

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 transition hover:border-zinc-200">
      {/* Titre + description */}
      <div className="mb-3">
        <div className="text-sm font-medium text-zinc-900">{swatch.label}</div>
        <div className="text-xs text-zinc-500">{swatch.description}</div>
      </div>

      {/* Aperçu + color picker + champ hex */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 shadow-sm">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
            aria-label={`Nuancier libre pour ${swatch.label}`}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            Code couleur
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#FBF9F4"
            maxLength={7}
            spellCheck={false}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 font-mono text-sm uppercase tracking-wider outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Suggestions cliquables */}
      <div>
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          Suggestions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => {
            const active = suggestion.toUpperCase() === value.toUpperCase();
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange(suggestion)}
                title={suggestion}
                aria-label={`Choisir ${suggestion}`}
                className={`h-7 w-7 rounded-md border transition ${
                  active
                    ? "ring-2 ring-zinc-900 ring-offset-1"
                    : "border-black/10 hover:scale-110"
                }`}
                style={{ background: suggestion }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
