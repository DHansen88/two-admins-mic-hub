/**
 * Anonymous first-party analytics client.
 *
 * Sends page views and click events to /api/track.php (PHP + MySQL on Hostinger).
 * No cookies are set and no personal data is collected — the backend stores only
 * a daily salted hash of the IP address.
 *
 * Fire-and-forget: failures are swallowed so tracking can never break the UI.
 */

export type TrackEventType = "pageview" | "click" | "outbound" | "form";

export interface TrackProps {
  label?: string;
  category?: string;
  href?: string;
  path?: string;
}

interface QueuedEvent extends TrackProps {
  type: TrackEventType;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

const PREVIEW_HOST_PATTERNS = ["localhost", "127.0.0.1", ".lovable.app", ".lovableproject.com"];
const ENDPOINT = "/api/track.php";
const FLUSH_DELAY = 800;
const MAX_BATCH = 20;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** PHP does not execute in the Lovable preview, so tracking is a no-op there. */
export function isTrackingAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return !PREVIEW_HOST_PATTERNS.some((pattern) =>
    pattern.startsWith(".") ? host.endsWith(pattern) : host === pattern,
  );
}

function truncate(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function currentPath(): string {
  const { pathname, search } = window.location;
  return truncate(pathname + search, 255);
}

function shortReferrer(): string {
  try {
    const ref = document.referrer;
    if (!ref) return "";
    const url = new URL(ref);
    if (url.hostname === window.location.hostname) return "";
    return truncate(url.hostname + url.pathname, 255);
  } catch {
    return "";
  }
}

function utmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: truncate(params.get("utm_source") ?? "", 128),
    utm_medium: truncate(params.get("utm_medium") ?? "", 128),
    utm_campaign: truncate(params.get("utm_campaign") ?? "", 128),
  };
}

function send(events: QueuedEvent[]): void {
  if (events.length === 0) return;
  const body = JSON.stringify({ events });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
credentials: "omit",
    }).catch(() => undefined);
  } catch {
    /* tracking must never throw */
  }
}

export function flushEvents(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const pending = queue;
  queue = [];
  send(pending);
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flushEvents, FLUSH_DELAY);
}

export function track(type: TrackEventType, props: TrackProps = {}): void {
  if (!isTrackingAvailable()) return;

  const path = truncate(props.path ?? currentPath(), 255);
  if (!path || path.startsWith("/admin")) return;

  queue.push({
    type,
    label: truncate(props.label ?? "", 191),
    category: truncate(props.category ?? "", 64),
    href: truncate(props.href ?? "", 512),
    path,
    referrer: shortReferrer(),
    ...utmParams(),
  });

  if (queue.length >= MAX_BATCH) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

export function trackPageView(path?: string): void {
  track("pageview", { path });
}

export function trackClick(label: string, props: Omit<TrackProps, "label"> = {}): void {
  track("click", { label, ...props });
}

export function isOutboundHref(href: string): boolean {
  if (!href || href.startsWith("#")) return false;
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).hostname !== window.location.hostname;
  } catch {
    return false;
  }
}
