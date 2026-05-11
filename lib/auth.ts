import { SignJWT, jwtVerify } from "jose";
import type { Ruolo } from "@/generated/prisma/enums";

const JWT_ALG = "HS256";

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET deve essere definito (min 16 caratteri)");
  }
  return new TextEncoder().encode(s);
}

export type JwtPayload = {
  sub: string;
  ruolo: Ruolo;
};

export async function signToken(payload: JwtPayload, expiresIn = "7d") {
  return new SignJWT({ ruolo: payload.ruolo })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALG],
    });
    const sub = payload.sub;
    const ruolo = payload.ruolo as Ruolo | undefined;
    if (!sub || (ruolo !== "DIPENDENTE" && ruolo !== "RESPONSABILE")) {
      return null;
    }
    return { sub, ruolo };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}
