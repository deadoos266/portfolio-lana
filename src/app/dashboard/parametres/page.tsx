import { PinForm } from "./PinForm";

export default function ParametresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Réglages</h1>
        <p className="text-sm text-zinc-500">
          Gère l&apos;accès à ton espace de suivi.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changer le code d&apos;accès</h2>
        <PinForm />
      </section>
    </div>
  );
}
