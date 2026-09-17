"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("bourgmestre@demo.ecommune.cd");
  const [password, setPassword] = useState("Ecommune-2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Connexion impossible." }));
      setError(data.error || "Connexion impossible.");
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>Adresse professionnelle<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="primary-btn wide" disabled={loading}>{loading ? "Vérification…" : "Accéder à e‑Commune"}</button>
      <p className="login-help">Prototype local : ces identifiants de démonstration sont préremplis. En production, l’authentification doit être reliée à l’annuaire officiel et les secrets placés hors du code.</p>
    </form>
  );
}
