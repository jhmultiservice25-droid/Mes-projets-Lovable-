"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/connexion";
  }
  return <button className="text-button" onClick={logout}>Déconnexion</button>;
}
