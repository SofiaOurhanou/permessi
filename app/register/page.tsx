"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, persistSession, type StoredUser } from "@/lib/client-auth";

const inputClass =
  "mt-1 w-full border-4 border-brut-ink bg-white px-3 py-2.5 font-mono text-sm text-brut-ink shadow-[4px_4px_0_0_#0a0a0a] outline-none focus:border-brut-hot focus:shadow-[4px_4px_0_0_#ff1493] rounded-none";

const labelClass =
  "block font-mono text-[10px] font-black uppercase tracking-[0.25em] text-brut-deep";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/utenti/register", {
        method: "POST",
        body: JSON.stringify({ nome, cognome, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.error?.message ??
            "Qualcosa è esploso (lato server). Classic.",
        );
        return;
      }
      persistSession(data.token, data.user as StoredUser);
      router.push("/dashboard/dipendente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border-4 border-brut-ink bg-brut-paper p-8 shadow-[10px_10px_0_0_#0a0a0a]">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-brut-hot">
          DLC gratuito: account
        </p>
        <h1 className="mt-2 font-mono text-2xl font-black uppercase tracking-tight text-brut-ink">
          Entra nel lore
        </h1>
        <p className="mt-2 font-mono text-sm font-bold text-brut-deep">
          Parti come DIPENDENTE (hard mode). Password ≥8 o il gatekeeper ti ignora.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className={labelClass}>Nome (IGN)</label>
            <input
              className={inputClass}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Cognome (tag)</label>
            <input
              className={inputClass}
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email (spam = ban)</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password (8+ = skill issue evitato)</label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
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
            className="w-full border-4 border-brut-ink bg-brut-acid py-3 font-mono text-sm font-black uppercase tracking-widest text-brut-ink shadow-[6px_6px_0_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_#0a0a0a] active:shadow-none disabled:opacity-50"
          >
            {loading ? "Sto forgiando il tuo destino…" : "SPAWNA ACCOUNT"}
          </button>
        </form>
        <p className="mt-8 text-center font-mono text-sm font-bold text-brut-ink">
          Già main character?{" "}
          <Link
            href="/login"
            className="border-b-4 border-brut-ink bg-brut-hot px-1 text-white hover:bg-brut-deep"
          >
            SPEEDRUN LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
