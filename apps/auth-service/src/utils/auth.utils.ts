import crypto from "crypto";

/**
 * Hash a plaintext password using SHA-256.
 * @param password - The plaintext password.
 * @returns Hex-encoded SHA-256 hash of the password.
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify a plaintext password against a SHA-256 hex hash.
 * @param password - The plaintext password to verify.
 * @param hash - The expected hex-encoded SHA-256 hash.
 * @returns True if the password hashes to the provided hash, false otherwise.
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  return passwordHash === hash;
}

/**
 * Generate a minimal JWT-like token (header.payload.signature) signed with HMAC-SHA256.
 * Note: This is a lightweight helper for environments that don't use a JWT library.
 * It does NOT provide token verification utilities — use a proper JWT library
 * (e.g. jsonwebtoken) if you need complete JWT feature set and security guarantees.
 *
 * @param userId - The subject (sub) claim for the token.
 * @param jwtSecret - Secret used to sign the token (HMAC-SHA256).
 * @param expiresInSeconds - Optional expiration time in seconds (defaults to 24 hours).
 * @returns A string in the form header.payload.signature
 */
export function generateToken(
  userId: string,
  jwtSecret: string,
  expiresInSeconds = 24 * 60 * 60
): string {
  if (!jwtSecret) {
    throw new Error("JWT secret is required to generate tokens");
  }

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url"
  );

  const now = Math.floor(Date.now() / 1000);
  const payloadObj = {
    sub: userId,
    iat: now,
    exp: now + Math.floor(expiresInSeconds),
  };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}
