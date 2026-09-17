"use client";

import { useState } from "react";

const notifications = [
  ["Recettes", "3 perceptions en attente de rapprochement."],
  ["Parcelles", "1 import parcellaire attend une validation administrative."],
  ["Marchés", "2 étalages arrivent à échéance cette semaine."],
];

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  return <div className="notification-wrap">
    <button className="icon-btn" type="button" title="Notifications" aria-label="Notifications" onClick={() => setOpen((value) => !value)}>●</button>
    {open && <div className="notification-panel">
      <div className="notification-title"><strong>Notifications</strong><span>{notifications.length}</span></div>
      {notifications.map(([title, text]) => <button type="button" className="notification-item" key={title} onClick={() => setOpen(false)}><b>{title}</b><span>{text}</span></button>)}
    </div>}
  </div>;
}
