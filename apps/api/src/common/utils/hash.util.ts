import { createHash, randomInt } from 'node:crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Numeric OTP code of the configured length, cryptographically random. */
export function generateNumericCode(length: number): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

/** Stable, non-reversible visitor key for view counting (no raw IP stored). */
export function visitorFingerprint(ip: string, userAgent: string): string {
  return sha256(`${ip}|${userAgent}`).slice(0, 32);
}
