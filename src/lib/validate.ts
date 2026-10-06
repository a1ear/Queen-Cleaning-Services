// Inquiry validation, shared by the quote form (instant feedback) and the API
// route (the real check, because anything from the browser can be forged).
// Keep this file dependency-free: the unit tests run it directly in Node.

/** Maximum lengths, after trimming. */
export const LIMITS = {
  name: 80,
  phone: 16,
  email: 120,
  service: 80,
  propertyType: 40,
  propertySize: 80,
  address: 300,
  preferredDate: 10,
  preferredTime: 40,
  message: 1000,
} as const;

export type Field = keyof typeof LIMITS;
export const FIELDS = Object.keys(LIMITS) as Field[];

export type InquiryValues = Record<Field, string>;
export type InquiryErrors = Partial<Record<Field, string>>;

/**
 * Philippine mobile (0917 123 4567, +63 917 123 4567) and landline
 * (034 433 1234, 02 8123 4567) numbers, once spaces and dashes are removed.
 */
export const PHONE_RE = /^(\+?63|0)[0-9]{9,10}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

// Control characters other than tab and newlines.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (value: unknown) =>
  (typeof value === "string" ? value : "").replace(CONTROL_CHARS, "").trim();
const oneLine = (value: unknown) => clean(value).replace(/\s+/g, " ");

export const normalizePhone = (value: unknown) => clean(value).replace(/[\s().-]/g, "");

function isRealDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export type ValidateOptions = {
  /** YYYY-MM-DD. Dates before this are rejected. */
  today?: string;
  /** When given, values outside these lists are rejected (server side). */
  allowed?: { service?: string[]; propertyType?: string[]; preferredTime?: string[] };
};

/** Clean and check an inquiry. Unknown keys are dropped. */
export function validateInquiry(raw: Record<string, unknown>, { today, allowed }: ValidateOptions = {}) {
  const values: InquiryValues = {
    name: oneLine(raw.name),
    phone: normalizePhone(raw.phone),
    email: clean(raw.email).toLowerCase(),
    service: oneLine(raw.service),
    propertyType: oneLine(raw.propertyType),
    propertySize: oneLine(raw.propertySize),
    address: clean(raw.address),
    preferredDate: clean(raw.preferredDate),
    preferredTime: oneLine(raw.preferredTime),
    message: clean(raw.message),
  };

  const errors: InquiryErrors = {};

  if (values.name.length < 2) errors.name = "Please enter your full name.";

  if (!values.phone) errors.phone = "Please enter your phone number.";
  else if (!PHONE_RE.test(values.phone)) errors.phone = "Please enter a valid phone number, like 0917 123 4567.";

  if (values.email && !EMAIL_RE.test(values.email))
    errors.email = "Please enter a valid email address, like name@example.com.";

  if (!values.service) errors.service = "Please choose a service.";
  else if (allowed?.service && !allowed.service.includes(values.service))
    errors.service = "Please choose a service from the list.";

  if (!values.propertyType) errors.propertyType = "Please choose the type of property.";
  else if (allowed?.propertyType && !allowed.propertyType.includes(values.propertyType))
    errors.propertyType = "Please choose the type of property from the list.";

  if (values.address.length < 5) errors.address = "Please enter the address of the place to be cleaned.";

  if (values.preferredDate) {
    if (!DATE_RE.test(values.preferredDate) || !isRealDate(values.preferredDate))
      errors.preferredDate = "Please choose a valid date.";
    else if (today && values.preferredDate < today) errors.preferredDate = "Please choose today or a later date.";
  }

  if (values.preferredTime && allowed?.preferredTime && !allowed.preferredTime.includes(values.preferredTime))
    errors.preferredTime = "Please choose a time from the list.";

  for (const field of FIELDS) {
    if (!errors[field] && values[field].length > LIMITS[field])
      errors[field] = `Please shorten this to ${LIMITS[field]} characters or fewer.`;
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}

/** Today's date (YYYY-MM-DD) in a given time zone. */
export function dateInZone(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
