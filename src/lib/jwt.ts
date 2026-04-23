import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "amx-servicehub-secret-fallback";

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function signJwt(payload: JwtPayload): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64url(sig)}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = base64url(createHmac("sha256", SECRET).update(`${header}.${body}`).digest());
    if (expected !== sig) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return createHmac("sha256", SECRET).update(password).digest("hex");
}
