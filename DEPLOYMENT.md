# Deploying to Hostinger

## 1. Build the project

```bash
npm run build
```

This creates a `dist/` folder with all production-ready files:

```
dist/
├── .htaccess              ← SPA routing + caching + gzip
├── index.html
├── favicon.ico
├── robots.txt
├── placeholder.svg
├── assets/
│   ├── js/                ← Minified JS bundles (vendor, UI, app)
│   ├── css/               ← Minified CSS
│   ├── images/            ← Optimized images with hashed filenames
│   └── fonts/             ← Web fonts (if any)
└── api/                   ← PHP backend
    ├── .htaccess
    ├── config.php          ← ⚠️ Update DB credentials
    ├── subscribe.php       ← ⚠️ Add Beehiiv API key
    ├── auth.php
    ├── content.php
    ├── authors.php
    ├── generate.php
    ├── rss.php
    ├── setup.php
    └── users.php
```

## 2. Pre-upload checklist

Before uploading, edit these files **inside the `dist/` folder**:

| File | Action |
|------|--------|
| `api/config.php` | Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` with Hostinger MySQL credentials |
| `api/config.php` | Change `ALLOWED_ORIGIN` to `'https://twoadminsandamic.com'` |
| `api/config.php` | Change `INITIAL_ADMIN_PASSWORD` to a strong password |
| `api/subscribe.php` | Add your Beehiiv API key to `BEEHIIV_API_KEY` |

## 3. Upload to Hostinger

1. Log in to **hPanel** → **File Manager** (or use FTP/SFTP)
2. Navigate to `/public_html/`
3. **Delete** existing files (back up first if needed)
4. Upload the **contents** of `dist/` into `/public_html/`
   - Upload everything **inside** `dist/`, not the folder itself

### Hostinger Git deployment

If you're using **Hostinger Git deployment** instead of manual upload:

1. Set the branch to `deploy`
2. Set the repository path to your site repo
3. **Leave the Hostinger "Directory" field empty** so the deploy branch is checked out directly into `/public_html`
4. Do **not** point Hostinger at a nested folder like `dist/` or `public/`

If the `Directory` field is set incorrectly, Hostinger may serve files from the wrong root and your `/api/*.php` routes can be downloaded as source instead of executing as PHP.

## 4. Post-upload setup

1. Visit `https://yourdomain.com/api/setup.php` once to create the database tables
2. After setup, restrict access by uncommenting the block in `api/.htaccess`:
   ```apache
   <Files "setup.php">
       Deny from all
   </Files>
   ```

## 5. Verify

- ✅ Homepage loads at `https://yourdomain.com`
- ✅ Navigate to `/blog` or `/episodes` and refresh — should not 404
- ✅ Images and styles load correctly
- ✅ Newsletter subscription works
- ✅ Admin login works at `/admin/login`

## Build optimizations included

- **JS**: Minified with Terser, console logs stripped, vendor code split into cached chunks
- **CSS**: Minified and extracted into separate files
- **Images**: Hashed filenames for cache-busting
- **Gzip**: Enabled via `.htaccess` for text-based assets
- **Caching**: Static assets cached for 1 year via `.htaccess` `mod_expires`
- **Security**: X-Content-Type-Options, X-Frame-Options, XSS protection headers

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pages 404 on refresh | Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled in Hostinger |
| Assets not loading | Verify you uploaded **contents** of `dist/`, not the folder itself |
| Blank page | Check browser console; ensure no CORS or path errors |
| Newsletter not working | Verify Beehiiv API key is set in `api/subscribe.php` |
| Admin login fails | Run `setup.php` first, then check DB credentials in `config.php` |
| `/api/*.php` shows raw PHP code in the browser | Confirm the site root is `/public_html`, leave Hostinger Git `Directory` empty, and make sure the uploaded `api/.htaccess` is present so PHP files are handled by Apache |
