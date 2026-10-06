"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DROP_OFF, FIELDS, LIMITS, needsAddress, validateInquiry, type Field, type InquiryErrors } from "@/lib/validate";
import { Icon } from "./Icon";

type Props = {
  services: { id: string; name: string }[];
  extraServiceOptions: string[];
  offersPickupDelivery: boolean;
  serviceTypes: string[];
  timeSlots: string[];
  amountLabel: string;
  amountHint: string;
  phone: string;
  phoneHref: string;
  messengerUrl: string;
};

type Status = "idle" | "submitting" | "success" | "error";

const TIMEOUT_MS = 25_000;
const DEFAULT_ERROR = "We couldn't submit your request right now. Please try again or contact us directly";

const newSubmissionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

function localToday() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function QuoteForm(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // One ID per filled-in form, so a retry can't create a second row.
  const submissionId = useRef<string>("");

  const [errors, setErrors] = useState<InquiryErrors>({});
  const [summaryKey, setSummaryKey] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState(DEFAULT_ERROR);
  const [inquiryId, setInquiryId] = useState("");
  const [serviceType, setServiceType] = useState(props.offersPickupDelivery ? "" : DROP_OFF);

  const read = () => Object.fromEntries(new FormData(formRef.current!)) as Record<string, string>;
  const control = <T extends Element>(name: string) => formRef.current?.elements.namedItem(name) as T | null;

  useEffect(() => {
    // Browser-only setup (the page itself is prerendered): block past dates in
    // the customer's own time zone, and preselect a service when arriving from
    // a "Request this service" link.
    control<HTMLInputElement>("preferredDate")?.setAttribute("min", localToday());
    const wanted = new URLSearchParams(location.search).get("service");
    const match = props.services.find((s) => s.id === wanted);
    const select = control<HTMLSelectElement>("service");
    if (match && select) select.value = match.name;
  }, [props.services]);

  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.scrollIntoView({ block: "center" });
      successRef.current?.focus();
    }
    if (status === "error") errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [status]);

  /** Re-check one field and update only its message. */
  function check(name: Field) {
    const { errors: next } = validateInquiry(read(), { today: localToday() });
    setErrors((prev) => {
      if (prev[name] === next[name]) return prev;
      const copy = { ...prev };
      if (next[name]) copy[name] = next[name];
      else delete copy[name];
      return copy;
    });
  }

  function onBlur(e: React.FocusEvent<HTMLFormElement>) {
    const target = e.target as Element as HTMLInputElement;
    const name = target.name as Field;
    if (FIELDS.includes(name) && name !== "serviceType" && target.value) check(name);
  }

  function onInput(e: React.FormEvent<HTMLFormElement>) {
    const name = (e.target as Element as HTMLInputElement).name as Field;
    if (errors[name]) check(name);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const raw = read();
    const result = validateInquiry(raw, { today: localToday() });
    setErrors(result.errors);
    if (!result.valid) {
      setStatus("idle");
      setSummaryKey((k) => k + 1);
      return;
    }

    setStatus("submitting");
    if (!submissionId.current) submissionId.current = newSubmissionId();
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...result.values, website: raw.website ?? "", submissionId: submissionId.current }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok === true) {
        setInquiryId(typeof data.inquiryId === "string" ? data.inquiryId : "");
        setStatus("success");
        document.title = document.title.replace(/^[^|]+/, "Request Submitted ");
        return;
      }
      if (response.status === 422 && data?.errors) {
        // The server found something the browser missed (e.g. a stale option).
        setErrors(data.errors);
        setStatus("idle");
        setSummaryKey((k) => k + 1);
        return;
      }
      setErrorText(
        response.status === 429
          ? "You've sent several requests in a short time. Please wait a few minutes, or contact us directly"
          : DEFAULT_ERROR,
      );
      setStatus("error");
    } catch {
      setErrorText(DEFAULT_ERROR);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="success-panel">
        <span className="success-icon"><Icon name="check" /></span>
        <h2 ref={successRef} tabIndex={-1}>Request Submitted!</h2>
        <p>Thank you for contacting us. We&apos;ve received your inquiry and will get back to you shortly.</p>
        {inquiryId && (
          <p className="ref">
            Your reference number is <strong>{inquiryId}</strong>. Mention it when you talk to us.
          </p>
        )}
        <Link className="btn btn-primary btn-lg" href="/">Back to Home</Link>
      </div>
    );
  }

  const submitting = status === "submitting";
  const errorList = FIELDS.filter((f) => errors[f]);
  const showAddress = props.offersPickupDelivery && needsAddress(serviceType);

  return (
    <form ref={formRef} className="quote-form" noValidate onSubmit={onSubmit} onBlur={onBlur} onInput={onInput}
      aria-busy={submitting}>
      {errorList.length > 0 && summaryKey > 0 && (
        <div className="alert alert-error error-summary" ref={summaryRef} tabIndex={-1} key={summaryKey}>
          <h2>Please check the highlighted fields</h2>
          <ul>
            {errorList.map((f) => (
              <li key={f}>
                <a href={`#${f}`} onClick={(e) => { e.preventDefault(); document.getElementById(f)?.focus(); }}>
                  {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="form-section">
        <legend><span className="step-num" aria-hidden="true">1</span> Your details</legend>
        <FieldWrap id="name" label="Full name" error={errors.name}>
          {(d) => <input id="name" name="name" type="text" autoComplete="name" required maxLength={LIMITS.name} {...d} />}
        </FieldWrap>
        <FieldWrap id="phone" label="Phone number" hint="We'll call or text this number about your request." error={errors.phone}>
          {(d) => <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} {...d} />}
        </FieldWrap>
        <FieldWrap id="email" label="Email address" optional error={errors.email}>
          {(d) => <input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} maxLength={LIMITS.email} {...d} />}
        </FieldWrap>
      </fieldset>

      <fieldset className="form-section">
        <legend><span className="step-num" aria-hidden="true">2</span> Your laundry</legend>
        <FieldWrap id="service" label="Service" error={errors.service}>
          {(d) => (
            <div className="select-wrap">
              <select id="service" name="service" required defaultValue="" {...d}>
                <option value="">Choose a service</option>
                {props.services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                {props.extraServiceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
        </FieldWrap>
        <FieldWrap id="amount" label={props.amountLabel} optional hint={props.amountHint} error={errors.amount}>
          {(d) => <input id="amount" name="amount" type="text" maxLength={LIMITS.amount} {...d} />}
        </FieldWrap>
      </fieldset>

      <fieldset className="form-section">
        <legend>
          <span className="step-num" aria-hidden="true">3</span> {props.offersPickupDelivery ? "Pickup & schedule" : "Schedule"}
        </legend>

        {props.offersPickupDelivery ? (
          <>
            <fieldset className={`field choice-field${errors.serviceType ? " has-error" : ""}`}
              aria-describedby={errors.serviceType ? "serviceType-error" : undefined}>
              <legend>How should we get your laundry?</legend>
              <div className="choices">
                {props.serviceTypes.map((type, i) => (
                  <label className="choice" key={type}>
                    <input type="radio" name="serviceType" value={type} id={i === 0 ? "serviceType" : undefined} required
                      checked={serviceType === type}
                      onChange={() => {
                        setServiceType(type);
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.serviceType;
                          delete next.address;
                          return next;
                        });
                      }} />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {errors.serviceType && <p className="field-error" id="serviceType-error">{errors.serviceType}</p>}
            </fieldset>

            {showAddress && (
              <div className="pickup-fields">
                <FieldWrap id="address" label="Pickup or delivery address"
                  hint="House number, street, barangay, and a landmark if it helps us find you." error={errors.address}>
                  {(d) => <textarea id="address" name="address" rows={3} required maxLength={LIMITS.address} autoComplete="street-address" {...d} />}
                </FieldWrap>
              </div>
            )}
          </>
        ) : (
          <input type="hidden" name="serviceType" value={DROP_OFF} />
        )}

        <div className="field-row">
          <FieldWrap id="preferredDate" label="Preferred date" optional error={errors.preferredDate}>
            {(d) => <input id="preferredDate" name="preferredDate" type="date" {...d} />}
          </FieldWrap>
          <FieldWrap id="preferredTime" label="Preferred time" optional error={errors.preferredTime}>
            {(d) => (
              <div className="select-wrap">
                <select id="preferredTime" name="preferredTime" defaultValue="" {...d}>
                  <option value="">No preference</option>
                  {props.timeSlots.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            )}
          </FieldWrap>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><span className="step-num" aria-hidden="true">4</span> Anything else?</legend>
        <FieldWrap id="message" label="Message" optional
          hint="Tell us about your laundry needs or any special instructions." error={errors.message}>
          {(d) => <textarea id="message" name="message" rows={4} maxLength={LIMITS.message} {...d} />}
        </FieldWrap>
      </fieldset>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <div className="alert alert-error submit-error" role="alert" ref={errorRef}>
          <Icon name="alert" />
          <p>
            {errorText} at <a href={props.phoneHref}>{props.phone}</a>
            {props.messengerUrl && <> or on <a href={props.messengerUrl} rel="noopener" target="_blank">Messenger</a></>}.
          </p>
        </div>
      )}

      <button className={`btn btn-primary btn-lg btn-block submit-btn${submitting ? " is-loading" : ""}`} type="submit"
        disabled={submitting}>
        <span className="spinner" aria-hidden="true" />
        <span>{submitting ? "Sending your request..." : "Submit Request"}</span>
      </button>
      <p className="visually-hidden" role="status">{submitting ? "Sending your request..." : ""}</p>
      <p className="form-privacy">
        We only use your details to reply to this request. See our <Link href="/privacy">privacy notice</Link>.
      </p>
    </form>
  );
}

type Described = { "aria-describedby"?: string; "aria-invalid"?: boolean };

/** Label, optional hint, control, and error message, wired together for screen readers. */
function FieldWrap({ id, label, optional = false, hint, error, children }: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (described: Described) => ReactNode;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional">Optional</span>}
      </label>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {children({ "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
