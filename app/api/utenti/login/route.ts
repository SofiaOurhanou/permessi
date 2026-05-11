import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { errorJson, json, parseJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await parseJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = loginSchema.safeParse(body.data);
  if (!parsed.success) {
    return errorJson(400, "VALIDATION", "Dati non validi", parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorJson(401, "INVALID_CREDENTIALS", "Credenziali non valide");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return errorJson(401, "INVALID_CREDENTIALS", "Credenziali non valide");
  }

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
