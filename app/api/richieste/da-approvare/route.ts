import { prisma } from "@/lib/prisma";
import { Ruolo, StatoRichiesta } from "@/generated/prisma/enums";
import { json, requireAuth, requireRuolo } from "@/lib/http";
import { richiestaInclude, toRichiestaJson } from "@/lib/richiesta-json";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const role = requireRuolo(auth.auth, [Ruolo.RESPONSABILE]);
  if (!role.ok) return role.response;

  const rows = await prisma.richiestaPermesso.findMany({
    where: { stato: StatoRichiesta.IN_ATTESA },
    include: richiestaInclude,
    orderBy: { dataRichiesta: "asc" },
  });

  return json(rows.map((r) => toRichiestaJson(r as Parameters<typeof toRichiestaJson>[0])));
}
