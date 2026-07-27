import { getAdminApiBase, getAdminAuthHeaders, canUseAdminFallback } from "@/lib/admin-auth";

export interface AnalyticsRow {
  label: string;
  category?: string;
  href?: string;
  views?: number | string;
  clicks?: number | string;
  visits?: number | string;
  visitors?: number | string;
  events?: number | string;
}

export interface AnalyticsReport {
  range: { start: string; end: string };
  empty: boolean;
  totals: { pageviews: number; visitors: number; clicks: number; outbound: number };
  timeseries: { day: string; pageviews: number; clicks: number; visitors: number }[];
  top_pages: AnalyticsRow[];
  top_links: AnalyticsRow[];
  top_episodes: AnalyticsRow[];
  top_referrers: AnalyticsRow[];
  devices: AnalyticsRow[];
}

export class AnalyticsPreviewUnavailable extends Error {
  constructor() {
    super("Analytics is only available on the live site (PHP backend required).");
    this.name = "AnalyticsPreviewUnavailable";
  }
}

export async function fetchAnalyticsReport(days: number): Promise<AnalyticsReport> {
  if (canUseAdminFallback()) {
    throw new AnalyticsPreviewUnavailable();
  }

  const base = getAdminApiBase();
  const res = await fetch(`${base}/analytics.php?days=${encodeURIComponent(String(days))}`, {
    headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
  });

  const text = await res.text();
  if (text.trim().startsWith("<?php")) {
    throw new AnalyticsPreviewUnavailable();
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Unexpected response from the analytics API");
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data as AnalyticsReport;
}

export function toCsv(rows: AnalyticsRow[], columns: { key: keyof AnalyticsRow; header: string }[]): string {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const head = columns.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}
