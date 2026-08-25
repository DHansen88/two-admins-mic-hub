import {
  track as trackAnalyticsEvent,
  trackClick as trackAnalyticsClick,
  trackPageView as trackAnalyticsPageView,
} from "@/lib/analytics";

type LegacyAnalyticsOptions = {
  event_category?: string;
  target_url?: string;
  target_text?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export function trackPageView(path?: string): void {
  trackAnalyticsPageView(path);
}

export function trackClick(eventName: string, options: LegacyAnalyticsOptions = {}): void {
  trackAnalyticsClick(options.target_text || eventName, {
    category: options.event_category || eventName,
    href: options.target_url,
  });
}

export function trackOutboundClick(
  eventName: string,
  targetUrl: string,
  options: Omit<LegacyAnalyticsOptions, "target_url"> = {},
): void {
  trackAnalyticsEvent("outbound", {
    label: options.target_text || eventName,
    category: options.event_category || eventName,
    href: targetUrl,
  });
}

export function getAnalyticsElementText(element: Element): string {
  const explicit = element.getAttribute("data-analytics-label");
  if (explicit) return explicit;
  return (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160);
}
