---
name: Site Analytics
description: First-party anonymous pageview/click tracking in PHP+MySQL with /admin/analytics dashboard
type: feature
---
Custom analytics — no third-party service.

- Collector: `public/api/track.php` (POST, sendBeacon batches). Auto-creates `analytics_events` MySQL table. Stores event_type, label, category, href, path, referrer, UTMs, device/browser/os, `visitor_hash` (daily-salted SHA1 of IP, never raw IP), created_at. Skips bots and `/admin` paths, rate limited.
- Reporting: `public/api/analytics.php` (requireAuth) returns totals, timeseries, top pages/links/episodes/referrers.
- Frontend: `src/lib/analytics.ts` (`track`, `trackPageView`), `src/components/AnalyticsProvider.tsx` mounted in App — pageviews per route + global capture-phase click listener for outbound links and `data-track` elements.
- Mark trackable elements with `data-track="category"` and `data-track-label="…"`.
- Admin page: `/admin/analytics` (manager+), sidebar "Site Analytics" after Episodes.
- `ANALYTICS_SALT` in config.php; override in config.local.php on live server.
- No cookies, no consent gate. Preview shows "Live site only" (no PHP).
