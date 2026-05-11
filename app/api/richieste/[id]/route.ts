import { prisma } from "@/lib/prisma";
import { Ruolo, StatoRichiesta } from "@/generated/prisma/enums";
import { richiestaUpdateSchema } from "@/lib/validators";
import { parseFlexibleDateInput } from "@/lib/parse-date";
import { errorJson, json, parseJson, requireAuth } from "@/lib/http";
import { richiestaInclude, toRichiestaJson } from "@/lib/richiesta-json";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  const row = await prisma.richiestaPermesso.findUnique({
    where: { id },
    include: richiestaInclude,
  });
  if (!row) {
    return errorJson(404, "NOT_FOUND", "Richiesta non trovata");
  }

  if (
    auth.auth.ruolo !== Ruolo.RESPONSABILE &&
    row.richiedenteId !== auth.auth.sub
  ) {
    return errorJson(403, "FORBIDDEN", "Non autorizzato a visualizzare questa richiesta");
  }

  return json(toRichiestaJson(row as Parameters<typeof toRichiestaJson>[0]));
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  const existing = await prisma.richiestaPermesso.findUnique({ where: { id } });
  if (!existing) {
    return errorJson(404, "NOT_FOUND", "Richiesta non trovata");
  }
  if (existing.richiedenteId !== auth.auth.sub) {
    return errorJson(403, "FORBIDDEN", "Puoi modificare solo le tue richieste");
  }
  if (existing.stato !== StatoRichiesta.IN_ATTESA) {
    return errorJson(400, "NOT_EDITABLE", "Modifica consentita solo in stato IN_ATTESA");
  }

  const body = await parseJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = richiestaUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return errorJson(400, "VALIDATION", "Dati non validi", parsed.error.flatten());
  }

  const dataInizio = parseFlexibleDateInput(parsed.data.dataInizio);
  const dataFine = parseFlexibleDateInput(parsed.data.dataFine);
  if (dataFine < dataInizio) {
    return errorJson(400, "DATE_RANGE", "dataFine deve essere >= dataInizio");
  }

  const cat = await prisma.categoriaPermesso.findUnique({
    where: { id: parsed.data.categoriaId },
  });
  if (!cat) {
    return errorJson(400, "UNKNOWN_CATEGORY", "Categoria non trovata");
  }

  const updated = await prisma.richiestaPermesso.update({
    where: { id },
    data: {
      dataInizio,
      dataFine,
      categoriaId: parsed.data.categoriaId,
      motivazione: parsed.data.motivazione,
    },
    include: richiestaInclude,
  });

  return json(toRichiestaJson(updated as Parameters<typeof toRichiestaJson>[0]));
}

/**
 * Dipendente: elimina solo proprie richieste IN_ATTESA.
 * Responsabile: elimina richieste APPROVATO (cfr. regole di sicurezza consegna).
 */
export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  const existing = await prisma.richiestaPermesso.findUnique({ where: { id } });
  if (!existing) {
    return errorJson(404, "NOT_FOUND", "Richiesta non trovata");
  }

  if (auth.auth.ruolo === Ruolo.DIPENDENTE) {
    if (existing.richiedenteId !== auth.auth.sub) {
      return errorJson(403, "FORBIDDEN", "Puoi eliminare solo le tue richieste");
    }
    if (existing.stato !== StatoRichiesta.IN_ATTESA) {
      return errorJson(400, "NOT_DELETABLE", "Eliminazione consentita solo in stato IN_ATTESA");
    }
  } else if (auth.auth.ruolo === Ruolo.RESPONSABILE) {
    if (existing.stato !== StatoRichiesta.APPROVATO) {
      return errorJson(
        400,
        "NOT_DELETABLE",
        "Il responsabile può eliminare solo richieste già approvate",
      );
    }
  } else {
    return errorJson(403, "FORBIDDEN", "Ruolo non supportato");
  }

  await prisma.richiestaPermesso.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
