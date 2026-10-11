# Where Are You From 🌍📍

A mobile-first 3D globe. Visitors type **hello in their own language**, choose **which country** it's from, and a **red pin** is dropped on the globe. Pins are stored in **Supabase** and appear live for everyone.

- Portrait-only UI (a "turn your phone upright" screen shows in landscape)
- 3D globe you can spin and pinch-zoom ([globe.gl](https://globe.gl))
- Typing a greeting floats likely countries to the top ("Bonjour" → France, Canada, Belgium…); you can always pick any country
- No build step, plain static files: works as-is on GitHub Pages
- Runs in **demo mode** (pins saved in the browser only) until you add Supabase keys

## Run locally

ES modules need a web server (opening `index.html` as a file won't work):

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080> (use your browser's phone view, or open it on your phone via your computer's LAN IP).

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `pins` table, Row Level Security (the public key can **read and add** pins only), and enables Realtime.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon / public** key into [`js/config.js`](js/config.js).

The anon key is meant to be public, so committing it is fine. **Never** commit the `service_role` key.

## 2. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then choose `main` and `/ (root)`.
3. Your site appears at `https://<user>.github.io/<repo>/`. All paths in the app are relative, so the sub-path works (tested by serving the project from a `/<repo>/` sub-path).

Pages-readiness notes:

- `.nojekyll` makes Pages serve the files exactly as they are (no Jekyll processing).
- `404.html` is shown for unknown URLs. `manifest.webmanifest` and `icon.svg` make it installable to a phone's home screen.
- Third-party libraries load from CDNs at **pinned versions** (`globe.gl@2.46.2`, `three-globe@2.45.4` textures, `supabase-js@2.117.3`). To upgrade, change those in `index.html`, `js/app.js` and `js/store.js` and re-test.
- Pages is served over HTTPS, which Supabase and the globe need. Opening `index.html` directly from disk won't work (ES modules); use a local server.

## How it works

| File | Purpose |
| --- | --- |
| `index.html`, `css/style.css` | Portrait layout: globe on top, bottom sheet for input |
| `js/app.js` | UI flow, globe setup, pins and ripples |
| `js/countries.js` | ~200 countries with centre points; pins are scattered a little around them so they don't stack and no precise location is stored |
| `js/greetings.js` | Hello-word → country hints |
| `js/store.js` | Supabase read / insert / realtime, with a localStorage fallback |
| `js/config.js` | Your Supabase URL and anon key |
| `supabase/schema.sql` | Table, constraints, RLS policies, realtime |

## Known prototype limits / next steps

- **Spam**: anyone can insert (a 10 s client cooldown is the only throttle, and it's easy to bypass). For production: Supabase anonymous sign-ins plus a per-user rate limit, or an Edge Function that validates inserts.
- **Moderation**: the greeting is free text shown to everyone. Rendering is escaped (no XSS), but add a profanity filter / review step if the site is public. Delete pins from the Supabase dashboard.
- **Scale**: all pins are loaded at once (capped at 10,000) and drawn as individual meshes. Past a few thousand pins, aggregate by country or use globe.gl's `pointsMerge`.
- **Offline / PWA**: there's a manifest (portrait, standalone) but no service worker yet.
- **Orientation lock**: browsers can only truly lock orientation for installed PWAs; otherwise the landscape overlay is the fallback.
