import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/http";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const categorie = await prisma.categoriaPermesso.findMany({
    orderBy: { descrizione: "asc" },
  });

  return Response.json(categorie);
}
