# Deploying to Hostinger

## 1. Build the project

```bash
npm run build
```

This creates a `dist/` folder with all static files ready for deployment.

## 2. Upload to Hostinger

1. Log in to your Hostinger control panel (hPanel).
2. Open **File Manager** or connect via **FTP/SFTP**.
3. Navigate to `/public_html/`.
4. **Delete** any existing files (or back them up first).
5. Upload the **contents** of the `dist/` folder into `/public_html/`.
   - Do NOT upload the `dist/` folder itself — upload everything *inside* it.

Your directory should look like:

```
public_html/
├── .htaccess          ← SPA routing + caching + security
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── images...
├── favicon.ico
├── robots.txt
└── api/               ← PHP backend (if using)
    ├── .htaccess
    ├── config.php
    └── ...
```

## 3. Verify

- Visit your domain — the homepage should load.
- Navigate to `/blog` or `/episodes` and refresh the page — the `.htaccess` SPA fallback should serve `index.html` correctly.
- Check that images and styles load (no broken paths).

## 4. PHP Backend (Optional)

The `api/` directory contains PHP files for admin functionality. If using:
- Ensure PHP is enabled on your Hostinger plan.
- Update `public/api/config.php` with your MySQL database credentials.
- Run the setup endpoint once: `https://yourdomain.com/api/setup.php`

## 5. Environment Notes

- The Beehiiv newsletter subscription URLs are public embed/form URLs (not secret API keys), so they are safe in the frontend code.
- If you add private API keys in the future, use the PHP backend (`/api/`) to proxy those calls — never expose private keys in frontend JS.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pages return 404 on refresh | Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled |
| Assets not loading | Verify you uploaded the *contents* of `dist/`, not the folder itself |
| Blank page | Check browser console for JS errors; ensure `base: "./"` is set in `vite.config.ts` |
