import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { Ruolo } from "@/generated/prisma/enums";
import { registerSchema } from "@/lib/validators";
import { errorJson, json, parseJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await parseJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = registerSchema.safeParse(body.data);
  if (!parsed.success) {
    return errorJson(400, "VALIDATION", "Dati non validi", parsed.error.flatten());
  }

  const { nome, cognome, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return errorJson(409, "EMAIL_IN_USE", "Email già registrata");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nome,
      cognome,
      email,
      passwordHash,
      ruolo: Ruolo.DIPENDENTE,
    },
  });

  const token = await signToken({ sub: user.id, ruolo: user.ruolo });

  return json({
    token,
    user: {
      id: user.id,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      ruolo: user.ruolo,
    },
  });
}
