import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/lib/preferences";

/** Bannière de consentement caméra / microphone / fichiers. */
export function ConsentBanner() {
  const { prefs, update } = usePreferences();
  if (prefs.consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="card-surface mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          MOKILI AI peut utiliser votre <strong className="text-foreground">microphone</strong>, votre{" "}
          <strong className="text-foreground">caméra</strong> et vos{" "}
          <strong className="text-foreground">fichiers</strong> uniquement quand vous le demandez. Dans
          ce prototype, tout reste sur votre appareil.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => update({ consent: { camera: false, micro: false, files: false } })}
          >
            Refuser
          </Button>
          <Button
            size="sm"
            onClick={() => update({ consent: { camera: true, micro: true, files: true } })}
          >
            J'accepte
          </Button>
        </div>
      </div>
    </div>
  );
}