"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { dateTime, longDate, peso, statusClass } from "./format";

export function CustomersView() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);
  const rows = useQuery(api.customers.list, { search: debounced || undefined });

  return (
    <section>
      <div className="admin-head">
        <h1>Customers</h1>
        <label className="admin-search">
          <span className="visually-hidden">Search customers</span>
          <input type="search" placeholder="Search name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      <p className="admin-note">Grouped by phone number, so repeat clients show all their requests together.</p>

      {rows === undefined ? (
        <ul className="rows" aria-busy="true" aria-label="Loading customers">
          {[0, 1, 2].map((i) => <li key={i} className="row row-skeleton" />)}
        </ul>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          <h2>{debounced ? "No matches" : "No customers yet"}</h2>
          <p>{debounced ? "Try a different name or number." : "Customers are added automatically when they send a request."}</p>
        </div>
      ) : (
        <ul className="rows">
          {rows.map((c) => (
            <li key={c._id}>
              <Link href={`/admin/customers/${c._id}`} className="row">
                <div className="row-main">
                  <p className="row-title">{c.name}</p>
                  <p className="row-sub">{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
                </div>
                <div className="row-side">
                  <span className="row-meta">{c.inquiryCount} {c.inquiryCount === 1 ? "request" : "requests"}</span>
                  <span className="row-meta">Last: {dateTime(c.lastInquiryAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CustomerDetail({ id }: { id: string }) {
  const data = useQuery(api.customers.get, { id });
  if (data === undefined) return <div className="detail-skeleton" aria-busy="true" aria-label="Loading customer" />;
  if (data === null) {
    return (
      <div className="admin-empty">
        <h1>Customer not found</h1>
        <Link className="btn btn-primary" href="/admin/customers">Back to customers</Link>
      </div>
    );
  }
  const { customer: c, inquiries } = data;
  const tel = c.phone.replace(/[^\d+]/g, "");
  return (
    <article className="detail">
      <Link href="/admin/customers" className="back-link">← All customers</Link>
      <header className="detail-head">
        <div>
          <h1>{c.name}</h1>
          <p className="detail-sub">{c.phone}{c.email ? ` · ${c.email}` : ""} · customer since {dateTime(c.firstSeenAt)}</p>
        </div>
      </header>
      <div className="quick-actions">
        <a className="btn btn-primary btn-sm" href={`tel:${tel}`}>Call</a>
        <a className="btn btn-outline btn-sm" href={`sms:${tel}`}>Text</a>
        {c.email && <a className="btn btn-outline btn-sm" href={`mailto:${c.email}`}>Email</a>}
      </div>
      <h2 className="section-title">Requests ({inquiries.length})</h2>
      <ul className="rows">
        {inquiries.map((r) => (
          <li key={r._id}>
            <Link href={`/admin/inquiries/${r._id}`} className="row">
              <div className="row-main">
                <p className="row-title">{r.service} <span className="row-ref">{r.ref}</span></p>
                <p className="row-sub row-address">{r.address}</p>
              </div>
              <div className="row-side">
                <span className={statusClass(r.status)}>{r.status}</span>
                {r.scheduledDate && <span className="row-meta">Scheduled {longDate(r.scheduledDate)}</span>}
                {r.quoteCentavos !== undefined && <span className="row-meta">{peso(r.quoteCentavos)}</span>}
                <span className="row-meta">{dateTime(r.createdAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
