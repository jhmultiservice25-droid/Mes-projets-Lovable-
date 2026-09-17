"use client";

import { useState } from "react";

export function ActionButton({ label, message, className = "" }: { label: string; message: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className={className} type="button" onClick={() => setOpen(true)}>{label}</button>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal-card compact-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><small>e‑Commune Kasa‑Vubu</small><h3>{label}</h3></div><button className="icon-btn" type="button" onClick={() => setOpen(false)}>×</button></div>
        <p>{message}</p>
        <div className="modal-actions"><button className="primary-btn" type="button" onClick={() => setOpen(false)}>Fermer</button></div>
      </div>
    </div>}
  </>;
}
