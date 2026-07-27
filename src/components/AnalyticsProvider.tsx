import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { flushEvents, isOutboundHref, isTrackingAvailable, track, trackPageView } from "@/lib/analytics";

/**
 * Records anonymous page views on route change and auto-captures clicks on
 * outbound links and any element marked with `data-track`.
 */
const AnalyticsProvider = () => {
  const location = useLocation();

  // Page views
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Global click capture
  useEffect(() => {
    if (!isTrackingAvailable()) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || typeof target.closest !== "function") return;

      const tracked = target.closest<HTMLElement>("[data-track]");
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      const element = tracked ?? anchor;
      if (!element) return;
      if (element.closest("[data-track-ignore]")) return;

      const href = anchor?.getAttribute("href") ?? element.getAttribute("data-track-href") ?? "";
      const outbound = isOutboundHref(href);

      if (!tracked && !outbound) return;

      const label =
        element.getAttribute("data-track-label")?.trim() ||
        element.getAttribute("aria-label")?.trim() ||
        element.textContent?.trim().slice(0, 100) ||
        (outbound ? href : "");

      if (!label) return;

      track(outbound ? "outbound" : "click", {
        label,
        category: element.getAttribute("data-track") || (outbound ? "outbound" : ""),
        href,
      });

      // Navigating away — send immediately rather than waiting for the batch.
      if (outbound) flushEvents();
    };

    const handleHide = () => {
      if (document.visibilityState === "hidden") flushEvents();
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("visibilitychange", handleHide);
    window.addEventListener("pagehide", flushEvents);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("visibilitychange", handleHide);
      window.removeEventListener("pagehide", flushEvents);
      flushEvents();
    };
  }, []);

  return null;
};

export default AnalyticsProvider;
