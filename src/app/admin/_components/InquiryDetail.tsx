"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { STATUSES, type Status } from "@convex/lib/statuses";
import { clock, dateTime, errorMessage, longDate, peso, statusClass, todayManila } from "./format";

export function InquiryDetail({ id }: { id: string }) {
  const data = useQuery(api.inquiries.get, { id });

  if (data === undefined) return <div className="detail-skeleton" aria-busy="true" aria-label="Loading inquiry" />;
  if (data === null) {
    return (
      <div className="admin-empty">
        <h1>Inquiry not found</h1>
        <p>It may have been entered incorrectly.</p>
        <Link className="btn btn-primary" href="/admin">Back to inquiries</Link>
      </div>
    );
  }

  const { inquiry: q, customer, activity } = data;
  const tel = q.phone.replace(/[^\d+]/g, "");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.address)}`;

  return (
    <article className="detail">
      <Link href="/admin" className="back-link">← All inquiries</Link>
      <header className="detail-head">
        <div>
          <h1>{q.name}</h1>
          <p className="detail-sub">
            <span className="row-ref">{q.ref}</span> · received {dateTime(q.createdAt)}
          </p>
        </div>
        <span className={statusClass(q.status)}>{q.status}</span>
      </header>

      <div className="quick-actions">
        <a className="btn btn-primary btn-sm" href={`tel:${tel}`}>Call</a>
        <a className="btn btn-outline btn-sm" href={`sms:${tel}`}>Text</a>
        {q.email && <a className="btn btn-outline btn-sm" href={`mailto:${q.email}`}>Email</a>}
        <a className="btn btn-outline btn-sm" href={maps} target="_blank" rel="noopener">Map</a>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <section className="card">
            <h2>Request</h2>
            <dl className="facts">
              <Fact label="Service" value={q.service} />
              <Fact label="Property" value={[q.propertyType, q.propertySize].filter(Boolean).join(", ")} />
              <Fact label="Address" value={q.address} />
              <Fact label="Phone" value={q.phone} />
              <Fact label="Email" value={q.email} />
              <Fact label="Preferred date" value={q.preferredDate ? longDate(q.preferredDate) : ""} />
              <Fact label="Preferred time" value={q.preferredTime} />
              <Fact label="Message" value={q.message} multiline />
            </dl>
            <p className="card-foot">As sent by the customer. This part can&apos;t be edited.</p>
          </section>

          {customer && (
            <section className="card">
              <h2>Customer</h2>
              <p>
                <Link href={`/admin/customers/${customer._id}`}>{customer.name}</Link> ·{" "}
                {customer.inquiryCount === 1 ? "first request" : `${customer.inquiryCount} requests in total`}
              </p>
            </section>
          )}
        </div>

        <div className="detail-col">
          <StatusCard id={q._id} status={q.status} />
          <ScheduleCard key={`schedule-${q.scheduledDate}|${q.scheduledTime}`} id={q._id} date={q.scheduledDate} time={q.scheduledTime} />
          <QuoteCard key={`quote-${q.quoteCentavos}|${q.quoteNote}`} id={q._id} centavos={q.quoteCentavos} note={q.quoteNote} />
          <NotesCard id={q._id} />
          <section className="card">
            <h2>History</h2>
            <ol className="timeline">
              {activity.map((a) => (
                <li key={a._id} className={`tl tl-${a.kind}`}>
                  <p className="tl-text">{a.text}</p>
                  <p className="tl-meta">{dateTime(a.at)} · {a.actor === "website" ? "Website" : a.actor}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={multiline ? "fact fact-wide" : "fact"}>
      <dt>{label}</dt>
      <dd className={multiline ? "pre" : undefined}>{value || <span className="muted">Not given</span>}</dd>
    </div>
  );
}

/** Save state shared by the editing cards. */
function useSave() {
  const [state, setState] = useState<{ busy: boolean; error: string; saved: boolean }>({ busy: false, error: "", saved: false });
  async function run(fn: () => Promise<unknown>) {
    setState({ busy: true, error: "", saved: false });
    try {
      await fn();
      setState({ busy: false, error: "", saved: true });
    } catch (e) {
      setState({ busy: false, error: errorMessage(e), saved: false });
    }
  }
  return { ...state, run };
}

function SaveStatus({ busy, error, saved }: { busy: boolean; error: string; saved: boolean }) {
  return (
    <p className={`save-status${error ? " is-error" : ""}`} role={error ? "alert" : "status"}>
      {busy ? "Saving..." : error || (saved ? "Saved." : "")}
    </p>
  );
}

function StatusCard({ id, status }: { id: Id<"inquiries">; status: Status }) {
  const setStatus = useMutation(api.inquiries.setStatus);
  const save = useSave();
  return (
    <section className="card">
      <h2>Status</h2>
      <div className="status-buttons" role="group" aria-label="Change status">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={`status-btn${s === status ? " is-current" : ""}`}
            aria-pressed={s === status} disabled={save.busy}
            onClick={() => s !== status && save.run(() => setStatus({ id, status: s }))}>
            {s}
          </button>
        ))}
      </div>
      <SaveStatus {...save} />
    </section>
  );
}

function ScheduleCard({ id, date, time }: { id: Id<"inquiries">; date?: string; time?: string }) {
  const setSchedule = useMutation(api.inquiries.setSchedule);
  const save = useSave();
  const [d, setD] = useState(date ?? "");
  const [t, setT] = useState(time ?? "");
  const dirty = d !== (date ?? "") || t !== (time ?? "");
  return (
    <section className="card">
      <h2>Cleaning schedule</h2>
      {date && <p className="card-current">{longDate(date)}{time ? ` at ${clock(time)}` : ""}</p>}
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); save.run(() => setSchedule({ id, date: d, time: t })); }}>
        <label>Date<input type="date" value={d} min={todayManila()} onChange={(e) => setD(e.target.value)} /></label>
        <label>Time<input type="time" value={t} onChange={(e) => setT(e.target.value)} disabled={!d} /></label>
        <div className="inline-actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={!dirty || save.busy}>Save schedule</button>
          {date && (
            <button className="btn btn-outline btn-sm" type="button" disabled={save.busy}
              onClick={() => { setD(""); setT(""); save.run(() => setSchedule({ id, date: "", time: "" })); }}>
              Clear
            </button>
          )}
        </div>
      </form>
      <SaveStatus {...save} />
    </section>
  );
}

function QuoteCard({ id, centavos, note }: { id: Id<"inquiries">; centavos?: number; note?: string }) {
  const setQuote = useMutation(api.inquiries.setQuote);
  const save = useSave();
  const [amount, setAmount] = useState(centavos === undefined ? "" : String(centavos / 100));
  const [text, setText] = useState(note ?? "");
  return (
    <section className="card">
      <h2>Quote</h2>
      {centavos !== undefined && <p className="card-current">{peso(centavos)}{note ? ` · ${note}` : ""}</p>}
      <form className="inline-form" onSubmit={(e) => {
        e.preventDefault();
        const value = amount.trim() === "" ? null : Number(amount.replace(/[₱,\s]/g, ""));
        if (value !== null && !Number.isFinite(value)) {
          save.run(async () => { throw { data: "Enter the amount as a number, for example 2500." }; });
          return;
        }
        save.run(() => setQuote({ id, amountPesos: value, note: text }));
      }}>
        <label>Amount (₱)<input inputMode="decimal" value={amount} placeholder="e.g. 2500" onChange={(e) => setAmount(e.target.value)} /></label>
        <label className="grow">What it covers<input value={text} maxLength={500} placeholder="e.g. Deep cleaning, 2 bathrooms" onChange={(e) => setText(e.target.value)} /></label>
        <div className="inline-actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={save.busy}>Save quote</button>
        </div>
      </form>
      <p className="card-foot">Every change is kept in the history with the old and new amount.</p>
      <SaveStatus {...save} />
    </section>
  );
}

function NotesCard({ id }: { id: Id<"inquiries"> }) {
  const addNote = useMutation(api.inquiries.addNote);
  const save = useSave();
  const [text, setText] = useState("");
  return (
    <section className="card">
      <h2>Add a note</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        save.run(async () => { await addNote({ id, text }); setText(""); });
      }}>
        <label className="visually-hidden" htmlFor="note">Note</label>
        <textarea id="note" rows={3} maxLength={2000} value={text} placeholder="e.g. Called, will confirm on Friday"
          onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!text.trim() || save.busy}>Add note</button>
      </form>
      <SaveStatus {...save} />
    </section>
  );
}
