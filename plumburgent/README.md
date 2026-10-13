# Plumb Urgent — landing page

Call-only, mobile-first static landing page for paid traffic. The only
conversion path is a phone call. No forms, no tracking beyond an optional
GA4 tag. Zero runtime dependencies.

## Repo layout

- `src/` — editable source (`.env`, `content.html`, `theme.css`, `base.css`,
  `app.js`, `assets/`, `_headers`, `_redirects`, `build.mjs`).
- `dist/` — the built static site. This is what Cloudflare Pages serves.

## Edit and rebuild

1. Change values in `src/.env` (business name, phone, service area, colors,
   analytics ID).
2. Edit copy in `src/content.html`, styling in `src/theme.css`.
3. Rebuild:

   ```
   npm run build
   ```

## Configure before running ads

In `src/.env`, set at least:

- `PHONE` and `PHONE_TEL` — the real inbound number. Placeholder now.
- `BRAND_NAME`, `EMAIL`, `ADDRESS`, `SERVICE_AREA`, `SITE_URL`.
- `GA4_ID` — optional. Leave blank to disable analytics.

## Deploy to Cloudflare Pages

- Production branch: `main`
- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`

Custom domain: add `plumburgent.com` and `www.plumburgent.com` in the Pages
project. The `_redirects` file sends `www` to the apex.

## Content policy

No fabricated reviews, credentials, guarantees, certifications, or service
areas. No same-day, 24/7, licensed, insured, or transfer claims. Photos are
illustrative.
