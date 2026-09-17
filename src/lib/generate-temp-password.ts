import "server-only";
import { randomInt } from "node:crypto";

const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%";

function pick(chars: string) {
  return chars[randomInt(chars.length)];
}

/** A one-time temporary password shown to the admin once, at account creation. */
export function generateTempPassword(): string {
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const all = LOWER + UPPER + DIGITS + SYMBOLS;
  const rest = Array.from({ length: 8 }, () => pick(all));
  const chars = [...required, ...rest];

  // Fisher-Yates shuffle so the required characters aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
