import { useEffect, useState } from "react";

const TARGET = Date.UTC(2026, 10, 25, 8, 0, 0); // 25 nov 2026, 09h Kinshasa (UTC+1)

function diff(now: number) {
  const ms = Math.max(0, TARGET - now);
  return {
    jours: Math.floor(ms / 86400000),
    heures: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    secondes: Math.floor(ms / 1000) % 60,
  };
}

export function Countdown() {
  const [t, setT] = useState(() => diff(Date.now()));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  const items: [string, number][] = [
    ["Jours", t.jours],
    ["Heures", t.heures],
    ["Minutes", t.minutes],
    ["Secondes", t.secondes],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-live="off">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-1 py-3 text-center backdrop-blur-sm"
        >
          <div className="font-mono text-2xl font-bold tabular-nums text-primary-foreground sm:text-4xl">
            {mounted ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-primary-foreground/70 sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}