// Inquiry pipeline stages, in order. Shared by the database schema and the admin panel.
export const STATUSES = ["New", "Contacted", "Quoted", "Confirmed", "Completed", "Cancelled"] as const;
export type Status = (typeof STATUSES)[number];
