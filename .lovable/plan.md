## Goal

Track which links and buttons visitors click, using a custom analytics logger stored in your own Hostinger MySQL database — no third-party service, anonymous by default (no cookies, no consent gate).

## What gets tracked

Automatic page views on every route change, plus explicit click events on:
- Episode cards / "Listen" links (episode slug recorded)
- Blog cards and related-content carousel items
- Platform buttons on episode pages (Spotify, Apple, iHeartRadio, YouTube, Spreaker, Amazon)
- Footer + header subscribe/social links
- Newsletter CTA submit, STEPS/Kajabi checkout buttons, merch product and PayPal buttons
- Any outbound `http(s)` link to another domain (generic fallback catcher)

Each event stores: event type, label, destination URL, page path, referrer, UTM params, device type, coarse browser/OS, hashed-IP visitor token (salted daily, so no raw IP is stored), and timestamp.

## Backend (PHP/MySQL)

- `public/api/track.php` — public POST endpoint. Validates and whitelists event fields, caps string lengths, rate-limits per visitor token, ignores admin routes and bot user agents, inserts into MySQL. Always returns 204 fast.
- `public/api/analytics.php` — admin-session-protected GET endpoint returning aggregates: totals by day, top pages, top clicked links, top episodes, top outbound destinations, referrer/UTM breakdown, for a chosen date range.
- New table `analytics_events` created automatically on first request (same self-provisioning pattern used elsewhere in the API), with indexes on `created_at`, `event_type`, and `label`.
- Add an `ANALYTICS_SALT` config constant in `config.php` (overridden in `config.local.php` on the live server) used for the daily visitor hash.

## Frontend

- `src/lib/analytics.ts` — small `track(event, props)` helper: fire-and-forget `navigator.sendBeacon` (falls back to `fetch keepalive`), batching/queueing so clicks aren't lost on navigation, silent no-op in the Lovable preview where PHP doesn't run.
- `src/components/AnalyticsProvider.tsx` — mounted in `App.tsx`, records page views on route change and installs a global capture-phase click listener that auto-logs outbound links and any element carrying a `data-track` attribute.
- Add `data-track` / `data-track-label` attributes to the key components: `EpisodeCard`, `EpisodePlatformLinks`, `FeaturedEpisode`, `LatestEpisodes`, `BlogCard`, `RelatedContentCarousel`, `NewsletterCTA`, `HomeCTA`, `Header`, `Footer`, `MerchCard`, `Steps` CTA buttons.

## Admin reporting page

- New route `/admin/analytics` with sidebar entry (placed after Blog Posts, keeping the existing section ordering) — visible to Admin and Manager roles.
- Date-range selector (7 / 30 / 90 days, custom), summary cards (page views, unique visitors, total clicks, outbound clicks), a views-over-time chart using the existing Recharts setup, and sortable tables for Top Pages, Top Clicked Links, Top Episodes, and Top Referrers. CSV export button.

## Notes

- PHP endpoints don't execute in the Lovable preview, so the analytics page will show a "live site only" empty state there; real data appears after deploy to Hostinger.
- Because no cookies are used and IPs are stored only as a salted daily hash, this stays outside cookie-consent requirements; I'll add a short line to the Privacy Policy describing the anonymous first-party measurement.
