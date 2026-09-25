# Everline Plumbing — landing page

Call-only, mobile-first static landing page for paid traffic. The only
conversion path is a phone call. No forms, no tracking beyond an optional
GA4 tag. Zero runtime dependencies.

## Repo layout

- Root (`index.html`, `assets/`, `base.css`, `theme.css`, `app.js`,
  `privacy.html`, `terms.html`, `404.html`, `robots.txt`, `sitemap.xml`) —
  the built static site. This is what Cloudflare Pages serves.
- `src/` — editable source. Edit here, then rebuild.
- `_headers`, `_redirects` — Cloudflare Pages config (security headers,
  caching, and www to apex redirect).

## Edit and rebuild

1. Change values in `src/.env` (business name, phone, service area, colors,
   analytics ID). See the notes in that file.
2. Edit copy or layout in `src/content.html`, styling in `src/theme.css`.
3. Rebuild:

   ```
   npm run build
   ```

   This regenerates the root files from `src/`.

## Configure before running ads

In `src/.env`, set at least:

- `PHONE` — the real inbound number. It is a placeholder now, so the page
  is not call-ready until you set it.
- `BRAND_NAME`, `EMAIL`, `ADDRESS`, `SERVICE_AREA`, `SITE_URL`.
- `GA4_ID` — optional. Leave blank to disable analytics.

## Deploy to Cloudflare Pages (static, not a Worker)

Git-connected (auto-deploys on every push):

1. Cloudflare dashboard, Workers and Pages, Create, Pages, Connect to Git.
2. Pick this repository.
3. Settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `/`
4. Save and deploy.

CLI alternative (direct upload):

```
npm run build
npx wrangler pages project create everline-plumbing --production-branch main
npx wrangler pages deploy . --project-name everline-plumbing --branch main
```

## Custom domain

In the Pages project, Custom domains, add `everlineplumbing.com` and
`www.everlineplumbing.com`. The domain must be a zone in the same
Cloudflare account. The `_redirects` file sends `www` to the apex.

## Content policy

No fabricated reviews, credentials, guarantees, certifications, or service
areas. No same-day, 24/7, licensed, insured, or transfer claims. Photos are
licensed for commercial use (Pexels) and are illustrative.
