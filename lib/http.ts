import type { Ruolo } from "@/generated/prisma/enums";
import { getBearerToken, verifyToken, type JwtPayload } from "./auth";

export function json(data: unknown, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : (init?.status ?? 200);
  return Response.json(data, typeof init === "number" ? { status } : { ...init, status });
}

export function errorJson(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    status,
  );
}

export async function requireAuth(request: Request): Promise<
  | { ok: true; auth: JwtPayload }
  | { ok: false; response: Response }
> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, response: errorJson(401, "UNAUTHORIZED", "Token mancante") };
  }
  const auth = await verifyToken(token);
  if (!auth) {
    return { ok: false, response: errorJson(401, "UNAUTHORIZED", "Token non valido") };
  }
  return { ok: true, auth };
}

export function requireRuolo(
  auth: JwtPayload,
  allowed: Ruolo[],
): { ok: true } | { ok: false; response: Response } {
  if (!allowed.includes(auth.ruolo)) {
    return {
      ok: false,
      response: errorJson(403, "FORBIDDEN", "Permessi insufficienti"),
    };
  }
  return { ok: true };
}

export async function parseJson<T>(request: Request): Promise<
  | { ok: true; data: T }
  | { ok: false; response: Response }
> {
  try {
    const raw = await request.json();
    return { ok: true, data: raw as T };
  } catch {
    return {
      ok: false,
      response: errorJson(400, "BAD_JSON", "Body JSON non valido"),
    };
  }
}
