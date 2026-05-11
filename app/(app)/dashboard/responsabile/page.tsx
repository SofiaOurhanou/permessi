"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, readStoredUser, type StoredUser } from "@/lib/client-auth";
import {
  brutSubtitle,
  brutTableWrap,
  brutTd,
  brutTh,
  brutTitle,
} from "@/lib/brut-ui";

type Richiesta = {
  id: string;
  dataInizio: string;
  dataFine: string;
  motivazione: string;
  stato: string;
  richiedente: { nome: string; cognome: string; email: string };
  categoria: { descrizione: string };
};

function toInputDate(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DashboardResponsabilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [rows, setRows] = useState<Richiesta[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await apiFetch("/api/richieste/da-approvare");
    if (res.ok) setRows(await res.json());
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await Promise.resolve();
      if (!alive) return;
      const u = readStoredUser();
      if (!u) {
        router.replace("/login");
        return;
      }
      if (u.ruolo !== "RESPONSABILE") {
        router.replace("/dashboard/dipendente");
        return;
      }
      setUser(u);
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [router, load]);

  async function approva(id: string) {
    setErr(null);
    const res = await apiFetch(`/api/richieste/${id}/approva`, {
      method: "PUT",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error?.message ?? "Skill issue (lato server).");
      return;
    }
    await load();
  }

  async function rifiuta(id: string) {
    setErr(null);
    const res = await apiFetch(`/api/richieste/${id}/rifiuta`, {
      method: "PUT",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error?.message ?? "Skill issue (lato server).");
      return;
    }
    await load();
  }

  if (!user) {
    return (
      <p className="font-mono text-sm font-black uppercase tracking-widest text-brut-deep">
        Caricamento… stai calmo, il capo sta pensando.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={brutTitle}>Boss fight: inbox</h1>
        <p className={`mt-2 ${brutSubtitle}`}>
          {user.nome}, tocca decidere se il team vive in ferie o in copium.
        </p>
      </div>

      {err && (
        <p className="border-4 border-brut-ink bg-brut-bad px-3 py-2 font-mono text-sm font-black text-white shadow-[4px_4px_0_0_#0a0a0a]">
          {err}
        </p>
      )}

      <div className={brutTableWrap}>
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className={brutTh}>Player</th>
              <th className={brutTh}>Date del sospetto</th>
              <th className={brutTh}>Scusa tier list</th>
              <th className={brutTh}>Wall of text</th>
              <th className={brutTh}>Verdetto</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-brut-paper">
                <td className={brutTd}>
                  <span className="font-black">
                    {r.richiedente.nome} {r.richiedente.cognome}
                  </span>
                  <div className="font-mono text-[11px] font-bold text-brut-deep">
                    {r.richiedente.email}
                  </div>
                </td>
                <td className={`${brutTd} whitespace-nowrap`}>
                  {toInputDate(r.dataInizio)} → {toInputDate(r.dataFine)}
                </td>
                <td className={brutTd}>{r.categoria.descrizione}</td>
                <td className={`max-w-xs ${brutTd} truncate`} title={r.motivazione}>
                  {r.motivazione}
                </td>
                <td className={brutTd}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void approva(r.id)}
                      className="border-4 border-brut-ink bg-brut-ok px-2 py-1.5 font-mono text-[10px] font-black uppercase text-brut-ink shadow-[3px_3px_0_0_#0a0a0a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    >
                      GG approvo
                    </button>
                    <button
                      type="button"
                      onClick={() => void rifiuta(r.id)}
                      className="border-4 border-brut-ink bg-brut-bad px-2 py-1.5 font-mono text-[10px] font-black uppercase text-white shadow-[3px_3px_0_0_#0a0a0a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    >
                      L + ratio
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className={`${brutTd} py-12 text-center font-mono font-bold text-brut-deep`}
                >
                  Inbox pulita. O tutti hanno paura di chiederti roba.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
