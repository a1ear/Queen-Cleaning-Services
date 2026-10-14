"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { STATUSES, type Status } from "@convex/lib/statuses";
import { clock, dateTime, longDate, peso, statusClass } from "./format";

type Filter = "All" | Status;

export function InquiriesView() {
  const [filter, setFilter] = useState<Filter>("New");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const counts = useQuery(api.inquiries.counts);
  const rows = useQuery(api.inquiries.list, { status: filter, search: debounced || undefined });

  return (
    <section>
      <div className="admin-head">
        <h1>Inquiries</h1>
        <label className="admin-search">
          <span className="visually-hidden">Search inquiries</span>
          <input type="search" placeholder="Search name, phone, reference, address" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="tabs" role="tablist" aria-label="Filter by status">
        {(["All", ...STATUSES] as Filter[]).map((s) => (
          <button key={s} role="tab" aria-selected={filter === s} className="tab" onClick={() => setFilter(s)}>
            {s}
            <span className="tab-count">{counts ? counts[s] ?? 0 : "·"}</span>
          </button>
        ))}
      </div>

      {rows === undefined ? (
        <ul className="rows" aria-busy="true" aria-label="Loading inquiries">
          {[0, 1, 2, 3].map((i) => <li key={i} className="row row-skeleton" />)}
        </ul>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          <h2>{debounced ? "No matches" : filter === "All" ? "No inquiries yet" : `No ${filter.toLowerCase()} inquiries`}</h2>
          <p>
            {debounced
              ? "Try a different name, phone number, or reference."
              : "New requests from the website's Request Services form appear here automatically."}
          </p>
        </div>
      ) : (
        <ul className="rows">
          {rows.map((r) => (
            <li key={r._id}>
              <Link href={`/admin/inquiries/${r._id}`} className="row">
                <div className="row-main">
                  <p className="row-title">{r.name} <span className="row-ref">{r.ref}</span></p>
                  <p className="row-sub">{r.service} · {r.propertyType} · {r.phone}</p>
                  <p className="row-sub row-address">{r.address}</p>
                </div>
                <div className="row-side">
                  <span className={statusClass(r.status)}>{r.status}</span>
                  {r.scheduledDate && <span className="row-meta">Scheduled {longDate(r.scheduledDate)} {clock(r.scheduledTime)}</span>}
                  {r.quoteCentavos !== undefined && <span className="row-meta">{peso(r.quoteCentavos)}</span>}
                  <span className="row-meta">{dateTime(r.createdAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length >= 200 && <p className="admin-note">Showing the 200 most recent. Use search to find older ones.</p>}
    </section>
  );
}
