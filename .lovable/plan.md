# Add ™ to "Two Admins & a Mic" everywhere it shows to users

## Scope rules

- Apply ™ to the **brand/podcast/company name** "Two Admins & a Mic" (and the variants `Two Admins &amp; a Mic`, `Two Admins and a Mic`, `Two Admins And A Mic`) wherever it renders to users.
- Skip non-user-facing occurrences: PHP file-header comments, README.md, code comments, variable names, slugs, URLs.
- Skip the tagline "Two Admins. One Mic. Zero Fluff." — that's not the brand name.
- No DB rows, no slug changes, no URL changes.
- HTML entity context (`&amp;`) keeps `&amp;`; plain JS/TS strings keep `&`.

## Files to update

### Root / static
- `index.html` — `<title>`, `<meta name=description>`, `<meta name=author>`, JSON-LD `Organization.name`, og:title, twitter:title, og:description, twitter:description.
- `public/llms.txt` — H1, intro paragraph, Merch line.

### React components (user-visible text + alt)
- `src/components/Header.tsx` — logo `alt`.
- `src/components/Footer.tsx` — logo `alt`, copyright line.
- `src/components/Hero.tsx` — logo `alt`.

### Pages (SEO titles + on-page copy + JSON-LD)
- `src/pages/Index.tsx` — SEO title.
- `src/pages/About.tsx` — SEO title, "Two Admins & a Mic is a podcast…" body line.
- `src/pages/Blog.tsx` — SEO title (banner `alt` "Two Admins & a Blog" left as-is — different wordmark).
- `src/pages/BlogPost.tsx` — SEO title template, JSON-LD `publisher.name`.
- `src/pages/Contact.tsx` — SEO title + description.
- `src/pages/CookiePolicy.tsx` — SEO title/desc, body mentions, contact block.
- `src/pages/PrivacyPolicy.tsx` — SEO title/desc, body mentions, contact block.
- `src/pages/TermsOfService.tsx` — SEO title/desc, body mentions.
- `src/pages/EpisodeDetail.tsx` — SEO title template, fallback description, JSON-LD `partOfSeries.name`.
- `src/pages/Episodes.tsx` — SEO title + description.
- `src/pages/Merch.tsx` — SEO title + description, on-page line.
- `src/pages/MerchThankYou.tsx` — SEO title + description, on-page line.
- `src/pages/ProductDetail.tsx` — SEO title template, JSON-LD `brand.name`.
- `src/pages/TopicResults.tsx` — SEO title/description (verify after read).
- `src/pages/ResetPassword.tsx` — visible "Two Admins and a Mic — Admin Dashboard" heading.
- `src/pages/admin/AdminLogin.tsx` — visible brand text (verify after read).

### Data
- `src/data/merchData.ts` — product `name` "Two Admins & a Mic Hoodie" → `Two Admins & a Mic™ Hoodie`; image `alt`.
- `src/data/popupData.ts` — `LEGACY_NEWSLETTER_HEADING` (rendered heading).
- `src/data/popupBlockTypes.ts` — default `heading` "Two Admins And A Mic".

### Content generation (user-facing output)
- `src/lib/content-generator.ts` — generated SEO description suffix, conclusion paragraph, email body sign-off.

### PHP backend (user-facing emails, RSS, popups, config)
- `public/api/config.php` — `SMTP_FROM_NAME` value.
- `public/api/generate.php` — generated copy strings, SEO suffix, email body sign-off.
- `public/api/popups.php` — `LEGACY_NEWSLETTER_HEADING`.
- `public/api/reset-password.php` — email subject, HTML heading, body mentions, plain-text version, sign-off.
- `public/api/rss.php` — `RSS_OWNER_NAME`, `RSS_SHOW_COPYRIGHT`.

### Not modified
- `README.md` (dev-facing).
- PHP file-header comments (e.g. `tags.php`, `config.php` top banner).
- Slugs, URLs, route paths, DB identifiers.

## SEO title length check

Adding `™` is +1 char. The longest current title is `Two Admins & a Mic — Leadership Podcast for Executive Admins` (60). After ™ it's 61. The `SEO` component already truncates >60 to 57+`...`, which would cut the ™. I'll shorten that title to `Two Admins & a Mic™ — Leadership Podcast for Admins` (51) so the trademark survives. Other titles stay under 60.

## Verification

After edits, re-run `grep -rn "Two Admins" --include=*.{ts,tsx,html,php,txt}` and confirm every remaining hit is either:
- already followed by `™` / `&trade;`, or
- in an excluded category (README, code comment, slug, tagline).

## Deliverable

A summary message listing every modified file grouped by area (frontend pages, components, data, PHP backend, static).
