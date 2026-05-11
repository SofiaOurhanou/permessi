"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch, readStoredUser, type StoredUser } from "@/lib/client-auth";
import {
  brutInput,
  brutLabel,
  brutPanel,
  brutSubtitle,
  brutTableWrap,
  brutTd,
  brutTh,
  brutTitle,
} from "@/lib/brut-ui";

type Riga = {
  dipendenteId: string;
  nome: string;
  cognome: string;
  email: string;
  giorniRichiesti: number;
  giorniApprovati: number;
};

type StatsResponse = {
  mese: string;
  definizione: string;
  righe: Riga[];
};

function currentMonthValue() {
  const n = new Date();
  return `${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function StatistichePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mese, setMese] = useState(currentMonthValue);
  const [dipendenteId, setDipendenteId] = useState("");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const q = new URLSearchParams();
    q.set("mese", mese);
    const res = await apiFetch(`/api/richieste/statistiche-mensili?${q.toString()}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(
        body?.error?.message ??
          "Le stats hanno ragequit. Prova dopo un caffè triplo.",
      );
      setData(null);
      return;
    }
    setData(body as StatsResponse);
  }, [mese]);

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

  const righeFiltrate = useMemo(() => {
    const all = data?.righe ?? [];
    if (!dipendenteId) return all;
    return all.filter((r) => r.dipendenteId === dipendenteId);
  }, [data, dipendenteId]);

  const chartData = useMemo(
    () =>
      righeFiltrate.map((r) => ({
        nome: `${r.nome} ${r.cognome}`.trim(),
        giorniRichiesti: r.giorniRichiesti,
        giorniApprovati: r.giorniApprovati,
      })),
    [righeFiltrate],
  );

  const dipOptions = data?.righe ?? [];

  if (!user) {
    return (
      <p className="font-mono text-sm font-black uppercase tracking-widest text-brut-deep">
        Caricamento… stiamo crunchando i numeri (fake deep work).
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={brutTitle}>Numeri che fanno paura (in senso buono)</h1>
        <p className={`mt-2 ${brutSubtitle}`}>
          Grafico = flex. Tabella = proof. Se qualcuno chiede “perché rosa?” → perché sì.
        </p>
      </div>

      <div className={`flex flex-wrap items-end gap-6 ${brutPanel}`}>
        <div>
          <label className={brutLabel}>Mese target (choose your fighter)</label>
          <input
            type="month"
            className={`mt-1 min-w-[10rem] ${brutInput}`}
            value={mese}
            onChange={(e) => setMese(e.target.value)}
          />
        </div>
        <div>
          <label className={brutLabel}>Zoom su un player (opz.)</label>
          <select
            className={`mt-1 min-w-[14rem] ${brutInput}`}
            value={dipendenteId}
            onChange={(e) => setDipendenteId(e.target.value)}
          >
            <option value="">Tutti (modalità chaos)</option>
            {dipOptions.map((r) => (
              <option key={r.dipendenteId} value={r.dipendenteId}>
                {r.nome} {r.cognome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <p className="border-4 border-brut-ink bg-brut-bad px-3 py-2 font-mono text-sm font-black text-white shadow-[4px_4px_0_0_#0a0a0a]">
          {err}
        </p>
      )}

      {data && (
        <p className="border-l-8 border-brut-hot bg-brut-paper pl-3 font-mono text-[11px] font-bold leading-relaxed text-brut-ink">
          TL;DR: contiamo i giorni che cadono nel mese selezionato. Nero = richieste
          varie, Rosa = solo approvate (stonks). Se non capisci il grafico, va bene
          uguale: fa figo.
        </p>
      )}

      <div
        className={`h-80 w-full border-4 border-brut-ink bg-white p-3 shadow-[8px_8px_0_0_#0a0a0a]`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#0a0a0a" strokeOpacity={0.25} />
            <XAxis
              dataKey="nome"
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#0a0a0a", fontWeight: 700 }}
              angle={-22}
              textAnchor="end"
              height={56}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#c4006e", fontWeight: 800 }}
            />
            <Tooltip
              contentStyle={{
                border: "4px solid #0a0a0a",
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 700,
                boxShadow: "4px 4px 0 #0a0a0a",
              }}
            />
            <Legend wrapperStyle={{ fontFamily: "monospace", fontWeight: 800, fontSize: 11 }} />
            <Bar
              dataKey="giorniRichiesti"
              name="Chiesti (big mood)"
              fill="#0a0a0a"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="giorniApprovati"
              name="Approvati (pog)"
              fill="#ff1493"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={brutTableWrap}>
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className={brutTh}>Umano</th>
              <th className={brutTh}>Ping @</th>
              <th className={brutTh}>Giorni “uhm”</th>
              <th className={brutTh}>Giorni “yay”</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {righeFiltrate.map((r) => (
              <tr key={r.dipendenteId} className="hover:bg-brut-paper">
                <td className={`${brutTd} font-black`}>
                  {r.nome} {r.cognome}
                </td>
                <td className={brutTd}>{r.email}</td>
                <td className={`${brutTd} font-mono font-black`}>{r.giorniRichiesti}</td>
                <td className={`${brutTd} font-mono font-black text-brut-hot`}>
                  {r.giorniApprovati}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
