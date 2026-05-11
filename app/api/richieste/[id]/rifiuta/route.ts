import { prisma } from "@/lib/prisma";
import { Ruolo, StatoRichiesta } from "@/generated/prisma/enums";
import { errorJson, json, requireAuth, requireRuolo } from "@/lib/http";
import { richiestaInclude, toRichiestaJson } from "@/lib/richiesta-json";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const role = requireRuolo(auth.auth, [Ruolo.RESPONSABILE]);
  if (!role.ok) return role.response;

  const { id } = await ctx.params;

  const existing = await prisma.richiestaPermesso.findUnique({ where: { id } });
  if (!existing) {
    return errorJson(404, "NOT_FOUND", "Richiesta non trovata");
  }
  if (existing.stato !== StatoRichiesta.IN_ATTESA) {
    return errorJson(400, "INVALID_STATE", "Solo richieste IN_ATTESA possono essere rifiutate");
  }

  const now = new Date();
  const updated = await prisma.richiestaPermesso.update({
    where: { id },
    data: {
      stato: StatoRichiesta.RIFIUTATO,
      dataValutazione: now,
      valutatoreId: auth.auth.sub,
    },
    include: richiestaInclude,
  });

  return json(toRichiestaJson(updated as Parameters<typeof toRichiestaJson>[0]));
}
