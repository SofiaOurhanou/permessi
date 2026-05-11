"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, persistSession, type StoredUser } from "@/lib/client-auth";

const inputClass =
  "mt-1 w-full border-4 border-brut-ink bg-white px-3 py-2.5 font-mono text-sm text-brut-ink shadow-[4px_4px_0_0_#0a0a0a] outline-none focus:border-brut-hot focus:shadow-[4px_4px_0_0_#ff1493] rounded-none";

const labelClass =
  "block font-mono text-[10px] font-black uppercase tracking-[0.25em] text-brut-deep";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/utenti/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.error?.message ??
            "Credenziali: not stonks. Riprova o piangi soft.",
        );
        return;
      }
      persistSession(data.token, data.user as StoredUser);
      if (data.user.ruolo === "RESPONSABILE") {
        router.push("/dashboard/responsabile");
      } else {
        router.push("/dashboard/dipendente");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border-4 border-brut-ink bg-brut-paper p-8 shadow-[10px_10px_0_0_#0a0a0a]">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-brut-hot">
          Login speedrun any%
        </p>
        <h1 className="mt-2 font-mono text-2xl font-black uppercase tracking-tight text-brut-ink">
          Sei tu, bro?
        </h1>
        <p className="mt-2 font-mono text-sm font-bold text-brut-deep">
          Metti roba sensata. Il backend giudica (silenziosamente).
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className={labelClass}>Email (vera, non quella fake)</label>
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password (no “password” pls)</label>
            <input
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="border-4 border-brut-ink bg-brut-bad px-3 py-2 font-mono text-sm font-bold text-white shadow-[4px_4px_0_0_#0a0a0a]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full border-4 border-brut-ink bg-brut-hot py-3 font-mono text-sm font-black uppercase tracking-widest text-white shadow-[6px_6px_0_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_#0a0a0a] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none disabled:opacity-50"
          >
            {loading ? "Aspetta che carico il drama…" : "LET'S GOOO →"}
          </button>
        </form>
        <p className="mt-8 text-center font-mono text-sm font-bold text-brut-ink">
          Primo giorno su Internet?{" "}
          <Link
            href="/register"
            className="border-b-4 border-brut-hot bg-brut-acid px-1 text-brut-ink hover:bg-brut-hot hover:text-white"
          >
            CREA PERSONAGGIO
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="font-mono text-xs font-bold uppercase text-brut-deep underline decoration-2 hover:text-brut-hot"
          >
            ← Torna al void
          </Link>
        </p>
      </div>
    </div>
  );
}
