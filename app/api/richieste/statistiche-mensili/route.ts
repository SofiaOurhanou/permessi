import { prisma } from "@/lib/prisma";
import { Ruolo, StatoRichiesta } from "@/generated/prisma/enums";
import { monthEndUtc, monthStartUtc, overlapInclusiveDays } from "@/lib/dates";
import { errorJson, json, requireAuth, requireRuolo } from "@/lib/http";
import { statisticheQuerySchema } from "@/lib/validators";

/**
 * Giorni nel mese che intersecano il periodo della richiesta (tutte le richieste → giorniRichiesti;
 * solo APPROVATO → giorniApprovati). Definizione documentata per la prova.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const role = requireRuolo(auth.auth, [Ruolo.RESPONSABILE]);
  if (!role.ok) return role.response;

  const { searchParams } = new URL(request.url);
  const raw = {
    mese: searchParams.get("mese") ?? undefined,
    dipendenteId: searchParams.get("dipendenteId") ?? undefined,
  };

  const parsed = statisticheQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return errorJson(400, "VALIDATION", "Query non valida", parsed.error.flatten());
  }

  const now = new Date();
  const defaultMese = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const mese = parsed.data.mese ?? defaultMese;
  const [ys, ms] = mese.split("-");
  const year = Number(ys);
  const month = Number(ms) - 1;
  if (month < 0 || month > 11 || !Number.isFinite(year)) {
    return errorJson(400, "INVALID_MONTH", "Mese non valido");
  }

  const winStart = monthStartUtc(year, month);
  const winEnd = monthEndUtc(year, month);
  const dipFilter = parsed.data.dipendenteId;

  const dipendenti = await prisma.user.findMany({
    where: {
      ruolo: Ruolo.DIPENDENTE,
      ...(dipFilter ? { id: dipFilter } : {}),
    },
    select: { id: true, nome: true, cognome: true, email: true },
  });

  const richieste = await prisma.richiestaPermesso.findMany({
    where: {
      dataFine: { gte: winStart },
      dataInizio: { lte: winEnd },
      richiedenteId: { in: dipendenti.map((d) => d.id) },
    },
    select: {
      richiedenteId: true,
      dataInizio: true,
      dataFine: true,
      stato: true,
    },
  });

  const map = new Map<
    string,
    { giorniRichiesti: number; giorniApprovati: number }
  >();
  for (const d of dipendenti) {
    map.set(d.id, { giorniRichiesti: 0, giorniApprovati: 0 });
  }

  for (const r of richieste) {
    const daysAll = overlapInclusiveDays(r.dataInizio, r.dataFine, winStart, winEnd);
    const cur = map.get(r.richiedenteId);
    if (!cur) continue;
    cur.giorniRichiesti += daysAll;
    if (r.stato === StatoRichiesta.APPROVATO) {
      cur.giorniApprovati += daysAll;
    }
  }

  const righe = dipendenti.map((d) => {
    const g = map.get(d.id)!;
    return {
      dipendenteId: d.id,
      nome: d.nome,
      cognome: d.cognome,
      email: d.email,
      giorniRichiesti: g.giorniRichiesti,
      giorniApprovati: g.giorniApprovati,
    };
  });

  return json({
    mese,
    definizione:
      "giorniRichiesti: somma giorni calendario (UTC) in intersezione [dataInizio,dataFine] con il mese, per tutte le richieste del dipendente; giorniApprovati: stesso calcolo limitato a richieste APPROVATO.",
    righe,
  });
}
