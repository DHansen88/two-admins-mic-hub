import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getAnalyticsElementText,
  trackClick,
  trackOutboundClick,
  trackPageView,
} from "@/lib/site-analytics";

function isExternalUrl(url: string): boolean {
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

const SiteAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tagged = target.closest<HTMLElement>("[data-analytics-click]");
      if (tagged) {
        trackClick(tagged.dataset.analyticsClick || "tagged_click", {
          event_category: tagged.dataset.analyticsCategory || "tagged",
          target_text: getAnalyticsElementText(tagged),
          target_url: tagged instanceof HTMLAnchorElement ? tagged.href : undefined,
        });
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !isExternalUrl(anchor.href)) return;

      trackOutboundClick(anchor.dataset.analyticsClick || "outbound_link", anchor.href, {
        event_category: anchor.dataset.analyticsCategory || "outbound",
        target_text: getAnalyticsElementText(anchor),
      });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
};

export default SiteAnalyticsTracker;
