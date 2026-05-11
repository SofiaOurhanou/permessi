export type RichiestaApiRow = {
  id: string;
  dataRichiesta: Date;
  dataInizio: Date;
  dataFine: Date;
  motivazione: string;
  stato: string;
  categoriaId: string;
  richiedenteId: string;
  dataValutazione: Date | null;
  valutatoreId: string | null;
  categoria: { id: string; descrizione: string };
  richiedente: { id: string; nome: string; cognome: string; email: string };
  valutatore: { id: string; nome: string; cognome: string } | null;
};

export function toRichiestaJson(r: RichiestaApiRow) {
  return {
    id: r.id,
    dataRichiesta: r.dataRichiesta.toISOString(),
    dataInizio: r.dataInizio.toISOString(),
    dataFine: r.dataFine.toISOString(),
    motivazione: r.motivazione,
    stato: r.stato,
    categoriaId: r.categoriaId,
    categoria: r.categoria,
    richiedenteId: r.richiedenteId,
    richiedente: r.richiedente,
    dataValutazione: r.dataValutazione?.toISOString() ?? null,
    valutatoreId: r.valutatoreId,
    valutatore: r.valutatore,
  };
}

export const richiestaInclude = {
  richiedente: { select: { id: true, nome: true, cognome: true, email: true } },
  categoria: true,
  valutatore: { select: { id: true, nome: true, cognome: true } },
} as const;
