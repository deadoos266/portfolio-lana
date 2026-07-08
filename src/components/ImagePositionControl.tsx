"use client";

import { useState } from "react";
import { DEFAULT_POSITION, type ImagePosition } from "@/lib/image-position";

interface ImagePositionControlProps {
  /**
   * Préfixe des noms des champs cachés envoyés au serveur.
   * Ex: si `namePrefix="banner"`, on postera `banner_zoom`, `banner_pos_x`,
   * `banner_pos_y` (que l'action serveur enregistrera).
   */
  namePrefix: string;
  initialValue?: ImagePosition;
}

const SLIDER_CLASS =
  "w-full accent-zinc-900 [&::-webkit-slider-thumb]:cursor-grab";

/** Réglages de cadrage d'une image, à insérer dans un formulaire. */
export function ImagePositionControl({
  namePrefix,
  initialValue,
}: ImagePositionControlProps) {
  const [values, setValues] = useState<ImagePosition>(
    initialValue ?? DEFAULT_POSITION,
  );

  function update(patch: Partial<ImagePosition>): void {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  function reset(): void {
    setValues(DEFAULT_POSITION);
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cadrage de l&apos;image
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      {/* Zoom */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <label className="font-medium text-zinc-700">🔍 Zoom</label>
          <span className="text-zinc-500">{values.zoom}%</span>
        </div>
        <input
          type="range"
          min={100}
          max={250}
          step={5}
          value={values.zoom}
          onChange={(e) => update({ zoom: Number(e.target.value) })}
          className={SLIDER_CLASS}
        />
      </div>

      {/* Position horizontale */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <label className="font-medium text-zinc-700">
            ↔️ Position horizontale
          </label>
          <span className="text-zinc-500">
            {values.posX < 50
              ? `${50 - values.posX}% ← gauche`
              : values.posX > 50
                ? `droite → ${values.posX - 50}%`
                : "centré"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={values.posX}
          onChange={(e) => update({ posX: Number(e.target.value) })}
          className={SLIDER_CLASS}
        />
      </div>

      {/* Position verticale */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <label className="font-medium text-zinc-700">
            ↕️ Position verticale
          </label>
          <span className="text-zinc-500">
            {values.posY < 50
              ? `${50 - values.posY}% ↑ haut`
              : values.posY > 50
                ? `bas ↓ ${values.posY - 50}%`
                : "centré"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={values.posY}
          onChange={(e) => update({ posY: Number(e.target.value) })}
          className={SLIDER_CLASS}
        />
      </div>

      {/* Valeurs envoyées au serveur */}
      <input type="hidden" name={`${namePrefix}_zoom`} value={values.zoom} />
      <input type="hidden" name={`${namePrefix}_pos_x`} value={values.posX} />
      <input type="hidden" name={`${namePrefix}_pos_y`} value={values.posY} />
    </div>
  );
}
