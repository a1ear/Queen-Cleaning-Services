"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { clock, longDate, peso, statusClass, todayManila } from "./format";

/** Upcoming cleaning jobs, grouped by day. */
export function ScheduleView() {
  const jobs = useQuery(api.inquiries.upcoming);
  const today = todayManila();

  const days = new Map<string, NonNullable<typeof jobs>>();
  for (const job of jobs ?? []) days.set(job.scheduledDate, [...(days.get(job.scheduledDate) ?? []), job]);

  return (
    <section>
      <div className="admin-head"><h1>Schedule</h1></div>
      <p className="admin-note">Upcoming jobs from today onward. Completed and cancelled jobs are hidden.</p>
      {jobs === undefined ? (
        <ul className="rows" aria-busy="true" aria-label="Loading schedule">
          {[0, 1].map((i) => <li key={i} className="row row-skeleton" />)}
        </ul>
      ) : jobs.length === 0 ? (
        <div className="admin-empty">
          <h2>Nothing scheduled</h2>
          <p>Open an inquiry and set a cleaning date to see it here.</p>
        </div>
      ) : (
        [...days].map(([day, list]) => (
          <div key={day} className="day">
            <h2 className="day-title">{day === today ? "Today · " : ""}{longDate(day)}</h2>
            <ul className="rows">
              {list.map((j) => (
                <li key={j._id}>
                  <Link href={`/admin/inquiries/${j._id}`} className="row">
                    <div className="row-time">{clock(j.scheduledTime) || "Any time"}</div>
                    <div className="row-main">
                      <p className="row-title">{j.name} <span className="row-ref">{j.ref}</span></p>
                      <p className="row-sub">{j.service} · {j.phone}</p>
                      <p className="row-sub row-address">{j.address}</p>
                    </div>
                    <div className="row-side">
                      <span className={statusClass(j.status)}>{j.status}</span>
                      {j.quoteCentavos !== undefined && <span className="row-meta">{peso(j.quoteCentavos)}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
