// Universal UUID v4 generator with broad browser support.
// Prefers native crypto.randomUUID when available; falls back to crypto.getRandomValues;
// and finally Math.random (lowest entropy) if neither is present.
export function uuidv4(): string {
  const g: typeof globalThis | undefined =
    typeof globalThis !== "undefined" ? globalThis : undefined;
  const c: Crypto | undefined =
    g && typeof g.crypto === "object" ? g.crypto : undefined;
  const maybeRandomUUID =
    c && (c as unknown as { randomUUID?: () => string }).randomUUID;
  if (typeof maybeRandomUUID === "function") return maybeRandomUUID.call(c);
  if (c && typeof c.getRandomValues === "function") {
    const buf = new Uint8Array(16);
    c.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant 10
    const b = Array.from(buf, (x) => x.toString(16).padStart(2, "0"));
    return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`;
  }
  // Math.random fallback (lower quality but ubiquitous)
  let s = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      s += "-";
      continue;
    }
    if (i === 14) {
      s += "4";
      continue;
    }
    if (i === 19) {
      s += (((Math.random() * 16) & 0x3) | 0x8).toString(16);
      continue;
    }
    s += ((Math.random() * 16) | 0).toString(16);
  }
  return s;
}
