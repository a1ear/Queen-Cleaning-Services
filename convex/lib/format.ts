// Small helpers shared by the Convex functions.

export const TIME_ZONE = "Asia/Manila";

// No 0/O or 1/I, so references can be read out over the phone.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** YYYY-MM-DD in Philippine time. */
export function manilaDate(ms: number) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms),
  );
}

/** e.g. QC-20261006-7KQ2M. Random, so references reveal nothing about volume. */
export function makeRef(prefix: string, now: number) {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `${prefix}-${manilaDate(now).replaceAll("-", "")}-${suffix}`;
}

export const peso = (centavos: number) =>
  `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
