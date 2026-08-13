import { createHash, randomBytes } from "crypto";

// Generate a cryptographically secure random token (raw, for emailing)
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

// Store only the hash of the token, never the raw value
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateJti(): string {
  return randomBytes(16).toString("hex");
}
