"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  apiFetch,
  readStoredUser,
  type StoredUser,
} from "@/lib/client-auth";
import {
  brutBtn,
  brutBtnGhost,
  brutInput,
  brutLabel,
  brutPanel,
  brutSubtitle,
  brutTableWrap,
  brutTd,
  brutTh,
  brutTitle,
} from "@/lib/brut-ui";

type Categoria = { id: string; descrizione: string };

type Richiesta = {
  id: string;
  dataInizio: string;
  dataFine: string;
  motivazione: string;
  stato: string;
  categoriaId: string;
  categoria: Categoria;
};

function toInputDate(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DashboardDipendentePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [rows, setRows] = useState<Richiesta[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [motivazione, setMotivazione] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [cRes, rRes] = await Promise.all([
      apiFetch("/api/categorie"),
      apiFetch("/api/richieste"),
    ]);
    if (cRes.ok) setCategorie(await cRes.json());
    if (rRes.ok) setRows(await rRes.json());
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
      if (u.ruolo !== "DIPENDENTE") {
        router.replace("/dashboard/responsabile");
        return;
      }
      setUser(u);
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [router, load]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await apiFetch("/api/richieste", {
      method: "POST",
      body: JSON.stringify({
        dataInizio,
        dataFine,
        categoriaId,
        motivazione,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error?.message ?? "Il server ha fatto 🙃. Riprova.");
      return;
    }
    setMsg("Richiesta inviata. Ora respira: tocca al boss.");
    setDataInizio("");
    setDataFine("");
    setMotivazione("");
    setCategoriaId(categorie[0]?.id ?? "");
    setEditingId(null);
    await load();
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setErr(null);
    setMsg(null);
    const res = await apiFetch(`/api/richieste/${editingId}`, {
      method: "PUT",
      body: JSON.stringify({
        dataInizio,
        dataFine,
        categoriaId,
        motivazione,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error?.message ?? "Patch fallita. Il DB ha detto no.");
      return;
    }
    setMsg("Edit salvato. Speedrun documentazione completato.");
    setEditingId(null);
    setDataInizio("");
    setDataFine("");
    setMotivazione("");
    await load();
  }

  function startEdit(r: Richiesta) {
    setEditingId(r.id);
    setDataInizio(toInputDate(r.dataInizio));
    setDataFine(toInputDate(r.dataFine));
    setCategoriaId(r.categoriaId);
    setMotivazione(r.motivazione);
    setMsg(null);
    setErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDataInizio("");
    setDataFine("");
    setMotivazione("");
    setCategoriaId(categorie[0]?.id ?? "");
  }

  async function elimina(id: string) {
    if (
      !confirm(
        "Elimini questa richiesta? È irreversibile come un messaggio inviato alle 3 di notte.",
      )
    )
      return;
    setErr(null);
    const res = await apiFetch(`/api/richieste/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error?.message ?? "Nope, non puoi cancellare sto drama.");
      return;
    }
    setMsg("Eliminata. Come se non fosse mai esistita (almost).");
    await load();
  }

  if (!user) {
    return (
      <p className="font-mono text-sm font-black uppercase tracking-widest text-brut-deep">
        Caricamento… (non chiudere, è free real estate)
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={brutTitle}>Area chill / permessi</h1>
        <p className={`mt-2 ${brutSubtitle}`}>
          Ehi {user.nome}, chiedi ferie prima che il burn-out chieda te.
        </p>
      </div>

      {msg && (
        <p className="border-4 border-brut-ink bg-brut-ok px-3 py-2 font-mono text-sm font-black text-brut-ink shadow-[4px_4px_0_0_#0a0a0a]">
          {msg}
        </p>
      )}
      {err && (
        <p className="border-4 border-brut-ink bg-brut-bad px-3 py-2 font-mono text-sm font-black text-white shadow-[4px_4px_0_0_#0a0a0a]">
          {err}
        </p>
      )}

      <section className={brutPanel}>
        <h2 className="font-mono text-sm font-black uppercase tracking-[0.3em] text-brut-hot">
          {editingId ? "Patch note" : "Nuovo side quest"}
        </h2>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={editingId ? submitEdit : submitCreate}
        >
          <div>
            <label className={brutLabel}>Quando scappi (inizio)</label>
            <input
              type="date"
              required
              className={`mt-1 w-full ${brutInput}`}
              value={dataInizio}
              onChange={(e) => setDataInizio(e.target.value)}
            />
          </div>
          <div>
            <label className={brutLabel}>Quando rientri (fine)</label>
            <input
              type="date"
              required
              className={`mt-1 w-full ${brutInput}`}
              value={dataFine}
              onChange={(e) => setDataFine(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={brutLabel}>Tipo di assenza lore</label>
            <select
              required
              className={`mt-1 w-full ${brutInput}`}
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Pick your fighter…</option>
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descrizione}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={brutLabel}>Motivo (sii onesto, tanto…)</label>
            <textarea
              required
              rows={3}
              className={`mt-1 w-full ${brutInput}`}
              value={motivazione}
              onChange={(e) => setMotivazione(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className={brutBtn}>
              {editingId ? "Salva patch" : "Invia al capo (pls)"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className={brutBtnGhost}>
                Nvm annulla
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-sm font-black uppercase tracking-[0.3em] text-brut-deep">
          Storico del caos (tue)
        </h2>
        <div className={brutTableWrap}>
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className={brutTh}>Date cursed</th>
                <th className={brutTh}>Scusa ufficiale</th>
                <th className={brutTh}>Drama level</th>
                <th className={brutTh}>Bottoni pericolosi</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-brut-paper">
                  <td className={`${brutTd} whitespace-nowrap`}>
                    {toInputDate(r.dataInizio)} → {toInputDate(r.dataFine)}
                  </td>
                  <td className={brutTd}>{r.categoria.descrizione}</td>
                  <td className={`${brutTd} font-black`}>{r.stato}</td>
                  <td className={brutTd}>
                    {r.stato === "IN_ATTESA" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="border-2 border-brut-ink bg-brut-acid px-2 py-1 font-mono text-[10px] font-black uppercase text-brut-ink shadow-[2px_2px_0_0_#0a0a0a] hover:bg-brut-hot hover:text-white"
                          onClick={() => startEdit(r)}
                        >
                          Edit lore
                        </button>
                        <button
                          type="button"
                          className="border-2 border-brut-ink bg-brut-bad px-2 py-1 font-mono text-[10px] font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a]"
                          onClick={() => void elimina(r.id)}
                        >
                          Yeet
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={`${brutTd} py-10 text-center font-mono font-bold text-brut-deep`}
                  >
                    Qui non è successo niente. Ancora. 👀
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
