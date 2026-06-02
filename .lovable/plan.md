# Beehiiv Newsletter Integration (Manual Draft on Publish)

## Goal
Give admins a one-click way to push a published blog post to Beehiiv as a **draft email**, so Diana/Mel can review in Beehiiv and send to subscribers. No automatic sends — full editorial control.

## User experience

In **Admin → Blog Posts** (`/admin/blog-posts`), each row gets a new action:

- **"Send to Beehiiv"** button — only enabled when the post status is `Published`.
- Clicking it opens a small confirmation modal:
  - Shows post title, hero image preview, excerpt that will be sent.
  - Confirm → calls backend → toast "Draft created in Beehiiv ✓ — review and send from your Beehiiv dashboard."
  - If the post has already been sent, the button shows **"Resend to Beehiiv"** with a warning ("This will create a new draft in Beehiiv").
- A small status pill ("Beehiiv: Draft sent · Jun 2") appears on rows that have been pushed.

Same button is also added at the top of the **PublishBlog** edit screen for convenience after publishing.

## Email content sent to Beehiiv

For each post we send:
- **Subject line:** post title (e.g. `New on the blog: {title}`)
- **Preview text:** post excerpt (or AI-generated takeaway)
- **Body (HTML):**
  - Hero/featured image at top
  - Title as H1
  - Excerpt paragraph
  - "Read the full article →" CTA button linking to `https://twoadminsandamic.com/blog/{slug}`
  - Small footer line: "Two Admins & a Mic™"

## Technical design

### 1. Secrets (Hostinger `config.php`)
Add two new env values:
- `BEEHIIV_API_KEY` — Beehiiv API key (from beehiiv.com → Settings → Integrations → API)
- `BEEHIIV_PUBLICATION_ID` — Beehiiv publication ID (format `pub_xxx`)

(Stored in `public/api/config.php` alongside existing SMTP / DB credentials. User adds them on the Hostinger server; we won't commit values.)

### 2. New PHP endpoint: `public/api/beehiiv-publish.php`
- Method: `POST`
- Auth: requires valid admin session (same check used by `content.php`)
- Input: `{ slug: string }`
- Logic:
  1. Load post from MySQL by slug; confirm status = `published`.
  2. Build HTML body from template (title, hero image, excerpt, CTA URL).
  3. `POST` to `https://api.beehiiv.com/v2/publications/{BEEHIIV_PUBLICATION_ID}/posts` with:
     - `title`, `subtitle` (excerpt), `body_content` (HTML), `status: "draft"`, `content_tags: [post tags]`.
  4. On success, store `beehiiv_post_id` + `beehiiv_sent_at` against the blog row (new columns).
  5. Return `{ ok: true, beehiiv_post_id, beehiiv_url }`.
- Errors: bubble Beehiiv response message back to frontend; log to PHP error log.

### 3. DB migration (MySQL)
Add two columns to the blog posts table:
- `beehiiv_post_id VARCHAR(64) NULL`
- `beehiiv_sent_at DATETIME NULL`

(Done via a `public/api/migrate-beehiiv.php` one-shot script the user can hit once on Hostinger.)

### 4. Frontend changes
- `src/lib/beehiiv-publish.ts` — thin client that POSTs to `/api/beehiiv-publish.php`.
- `src/components/SendToBeehiivButton.tsx` — button + confirm modal (reuses shadcn `Dialog`, `Button`, `useToast`).
- `src/pages/admin/ManageBlogPosts.tsx` — add the button column + "Draft sent" pill.
- `src/pages/admin/PublishBlog.tsx` — add the button in the header action bar (visible after publish).

### 5. Lovable preview fallback
PHP doesn't run in the Lovable preview. The `beehiiv-publish.ts` client will detect the preview environment (same pattern used by other admin calls) and show a toast: "Beehiiv send is only available on the live site."

## Out of scope (for this round)
- Automatic send on publish (we explicitly chose manual).
- Sending the full post body (we chose teaser + CTA).
- Scheduling from inside the admin (use Beehiiv's scheduler after reviewing the draft).
- Per-tag/segment targeting in Beehiiv (can be added later as a dropdown).

## Files to be created / edited
- **New:** `public/api/beehiiv-publish.php`
- **New:** `public/api/migrate-beehiiv.php`
- **New:** `src/lib/beehiiv-publish.ts`
- **New:** `src/components/SendToBeehiivButton.tsx`
- **Edit:** `public/api/config.php` (add Beehiiv key placeholders + docs comment)
- **Edit:** `src/pages/admin/ManageBlogPosts.tsx`
- **Edit:** `src/pages/admin/PublishBlog.tsx`
- **Memory:** add `mem://features/beehiiv-publish` describing the flow.

## What you'll need to do once after I build it
1. In Beehiiv → Settings → Integrations → **API**, create a key and copy the **Publication ID**.
2. Add `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` to `public/api/config.php` on Hostinger.
3. Visit `https://twoadminsandamic.com/api/migrate-beehiiv.php` once to add the two DB columns.
4. Publish a post → click **Send to Beehiiv** → review the draft in Beehiiv → hit Send there.
