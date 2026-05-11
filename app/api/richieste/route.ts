import { prisma } from "@/lib/prisma";
import { Ruolo, StatoRichiesta } from "@/generated/prisma/enums";
import { richiestaCreateSchema } from "@/lib/validators";
import { parseFlexibleDateInput } from "@/lib/parse-date";
import { errorJson, json, parseJson, requireAuth, requireRuolo } from "@/lib/http";
import { richiestaInclude, toRichiestaJson } from "@/lib/richiesta-json";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const where =
    auth.auth.ruolo === Ruolo.RESPONSABILE
      ? {}
      : { richiedenteId: auth.auth.sub };

  const rows = await prisma.richiestaPermesso.findMany({
    where,
    include: richiestaInclude,
    orderBy: { dataRichiesta: "desc" },
  });

  return json(rows.map((r) => toRichiestaJson(r as Parameters<typeof toRichiestaJson>[0])));
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const role = requireRuolo(auth.auth, [Ruolo.DIPENDENTE]);
  if (!role.ok) return role.response;

  const body = await parseJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = richiestaCreateSchema.safeParse(body.data);
  if (!parsed.success) {
    return errorJson(400, "VALIDATION", "Dati non validi", parsed.error.flatten());
  }

  const { categoriaId, motivazione } = parsed.data;
  const dataInizio = parseFlexibleDateInput(parsed.data.dataInizio);
  const dataFine = parseFlexibleDateInput(parsed.data.dataFine);

  if (dataFine < dataInizio) {
    return errorJson(400, "DATE_RANGE", "dataFine deve essere >= dataInizio");
  }

  const cat = await prisma.categoriaPermesso.findUnique({
    where: { id: categoriaId },
  });
  if (!cat) {
    return errorJson(400, "UNKNOWN_CATEGORY", "Categoria non trovata");
  }

  const created = await prisma.richiestaPermesso.create({
    data: {
      richiedenteId: auth.auth.sub,
      categoriaId,
      dataInizio,
      dataFine,
      motivazione,
      stato: StatoRichiesta.IN_ATTESA,
    },
    include: richiestaInclude,
  });

  return json(toRichiestaJson(created as Parameters<typeof toRichiestaJson>[0]), 201);
}
