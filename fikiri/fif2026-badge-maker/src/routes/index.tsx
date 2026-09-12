import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { Countdown } from "@/components/Countdown";
import {
  drawBadge,
  drawShareVisual,
  canvasToBlob,
  downloadBlob,
  downloadPdf,
  QUOTE,
  type BadgeData,
} from "@/lib/fif-canvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIF2026 Badge Participant | FIKIRI Innovation Festival" },
      {
        name: "description",
        content:
          "Générez gratuitement votre badge participant du FIKIRI Innovation Festival 2026 à Kinshasa. Tout se fait dans votre navigateur.",
      },
      { property: "og:title", content: "FIF2026 Badge Participant" },
      {
        property: "og:description",
        content:
          "Créez et partagez votre badge du FIKIRI Innovation Festival 2026, Kinshasa, 25 novembre 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EMPTY = { nom: "", prenom: "", gmail: "", fonction: "" };

function Index() {
  const [form, setForm] = useState(EMPTY);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const badgeRef = useRef<HTMLCanvasElement>(null);
  const shareRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function onPhoto(e: FormEvent<HTMLInputElement>) {
    const file = (e.currentTarget.files || [])[0];
    if (!file) return;
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nom.trim() || !form.prenom.trim() || !form.fonction.trim()) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(form.gmail.trim())) {
      setError("Veuillez saisir une adresse Gmail valide (exemple : nom@gmail.com).");
      return;
    }
    if (!photoUrl) {
      setError("Merci d'ajouter votre photo.");
      return;
    }

    const img = new Image();
    img.src = photoUrl;
    try {
      await img.decode();
    } catch {
      setError("La photo n'a pas pu être lue. Essayez une autre image.");
      return;
    }

    const data: BadgeData = { ...form, photo: img };
    if (badgeRef.current) drawBadge(badgeRef.current, data);
    if (shareRef.current) drawShareVisual(shareRef.current, data);
    setReady(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }

  const slug = `${form.prenom}-${form.nom}`.trim().replace(/\s+/g, "-").toLowerCase() || "fif2026";

  async function dl(canvas: HTMLCanvasElement | null, type: string, ext: string, name: string) {
    if (!canvas) return;
    const blob = await canvasToBlob(canvas, type, 0.95);
    downloadBlob(blob, `${name}-${slug}.${ext}`);
  }

  async function share() {
    const canvas = shareRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas, "image/png");
    const file = new File([blob], `fif2026-${slug}.png`, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: "FIKIRI Innovation Festival 2026",
          text: "JE PARTICIPE AU FIKIRI INNOVATION FESTIVAL 2026 ! Kinshasa, 25 novembre 2026. #FIF2026",
        });
        return;
      } catch {
        /* annulé : on retombe sur le téléchargement */
      }
    }
    downloadBlob(blob, `fif2026-visuel-${slug}.png`);
  }

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40";
  const labelCls = "mb-1.5 block text-sm font-medium text-foreground";
  const btn =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98]";

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-primary px-5 pb-10 pt-10 text-primary-foreground">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            FIF2026 · Badge participant
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            FIKIRI INNOVATION FESTIVAL 2026
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Kinshasa · 25 novembre 2026
          </p>
          <div className="mt-6"><Countdown /></div>
          <blockquote className="mt-6 border-l-4 border-accent pl-4 text-sm italic text-primary-foreground/90">
            {QUOTE}
          </blockquote>
        </div>
      </header>

      <section className="mx-auto mt-8 max-w-xl px-5">
        <h2 className="text-xl font-bold text-foreground">Créez votre badge</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div><label className={labelCls} htmlFor="nom">Nom et Post-Nom</label><input id="nom" className={field} value={form.nom} onChange={set("nom")} required /></div>
          <div><label className={labelCls} htmlFor="prenom">Prénom</label><input id="prenom" className={field} value={form.prenom} onChange={set("prenom")} required /></div>
          <div><label className={labelCls} htmlFor="gmail">Gmail</label><input id="gmail" type="email" inputMode="email" placeholder="nom@gmail.com" className={field} value={form.gmail} onChange={set("gmail")} required /></div>
          <div><label className={labelCls} htmlFor="fonction">Fonction et institution</label><input id="fonction" className={field} placeholder="Ex. Ingénieure logiciel, Université de Kinshasa" value={form.fonction} onChange={set("fonction")} required /></div>
          <div>
            <label className={labelCls} htmlFor="photo">Photo</label>
            <input id="photo" type="file" accept="image/*" onChange={onPhoto} required className="w-full rounded-xl border border-dashed border-input bg-card px-4 py-3 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground" />
            {photoUrl && <img src={photoUrl} alt="Aperçu de votre photo" className="mt-3 h-24 w-24 rounded-full border-2 border-accent object-cover" />}
          </div>
          {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          <button type="submit" className={`${btn} w-full bg-accent text-accent-foreground py-4 text-base`}>Générer mon badge</button>
          <p className="text-xs leading-relaxed text-muted-foreground">Vos informations et votre photo servent uniquement à générer votre badge dans votre navigateur. Elles ne sont ni envoyées ni enregistrées.</p>
        </form>
      </section>

      <section ref={resultRef} className={`mx-auto mt-10 max-w-xl px-5 ${ready ? "" : "hidden"}`}>
        <h2 className="text-xl font-bold text-foreground">Votre badge</h2>
        <canvas ref={badgeRef} className="mt-4 w-full rounded-2xl border border-border shadow-xl" />
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => dl(badgeRef.current, "image/png", "png", "badge-fif2026")}>Télécharger PNG</button>
          <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => dl(badgeRef.current, "image/jpeg", "jpg", "badge-fif2026")}>Télécharger JPG</button>
          <button className={`${btn} border border-primary text-primary`} onClick={() => badgeRef.current && downloadPdf(badgeRef.current, `badge-fif2026-${slug}.pdf`)}>Télécharger PDF</button>
        </div>
        <h2 className="mt-10 text-xl font-bold text-foreground">Visuel à partager</h2>
        <canvas ref={shareRef} className="mt-4 w-full rounded-2xl border border-border shadow-xl" />
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button className={`${btn} bg-accent text-accent-foreground`} onClick={share}>Partager (WhatsApp, Facebook, LinkedIn)</button>
          <button className={`${btn} border border-primary text-primary`} onClick={() => dl(shareRef.current, "image/png", "png", "visuel-fif2026")}>Télécharger le visuel</button>
        </div>
      </section>
    </main>
  );
}