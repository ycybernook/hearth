# Hearth

Breathwork on the web. Six practices, led by heart-centered breathing.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Push to GitHub, import the repo at vercel.com. Set the environment variables
below (`vercel env add <name> <environment>`, or the dashboard).

| Variable | Required for | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, sessions, subscriptions | Supabase dashboard → Project Settings → API — already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same | same — already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Stripe webhook writes | Supabase dashboard → Project Settings → API — **not set yet** |
| `STRIPE_SECRET_KEY` | Checkout, webhook | dashboard.stripe.com → Developers → API keys — **not set yet** |
| `STRIPE_PRICE_ID` | Checkout | dashboard.stripe.com → Product catalog (the Pro plan's recurring price) — **not set yet** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature check | dashboard.stripe.com → Developers → Webhooks → add endpoint `…/api/webhooks/stripe` — **not set yet** |

Until the Stripe vars are set, `startCheckout()` fails with a friendly message
in the upgrade sheet instead of a broken redirect — everything else works.

This project's Supabase instance is a **shared project** also used by unrelated
apps (an e-commerce store, a pickleball app). Every Hearth table, function, and
policy is prefixed `hearth_` to stay out of their way — see below.

## How it's put together

```
app/
  layout.js            fonts, metadata, theme colour, manifest link, SW register
  page.js              server component — loads the signed-in user, renders HearthApp
  manifest.json         PWA manifest
  login/page.js         magic-link sign-in form
  auth/callback/route.js   exchanges the emailed code for a session cookie
  api/checkout/route.js    creates a Stripe Checkout session for the signed-in user
  api/webhooks/stripe/route.js  updates hearth_subscriptions on Stripe events
  globals.css           every style, driven by CSS custom properties
components/
  HearthApp.js         state, wiring, layout, mood check-in, streak, sign-in/out
  Orb.js               the ring, the swell, the heart mark
  Settings.js          practice picker, length, cue toggles
  UpgradeSheet.js       the paywall, now wired to real checkout
  MoodPicker.js         1–5 face picker, used before and after a round
  ServiceWorkerRegister.js  registers /sw.js on mount
lib/
  patterns.js          practice data — edit this, not the engine
  useBreathEngine.js    the rAF loop
  audio.js             synthesised cues and haptics (no recordings yet — see below)
  entitlement.js        real Pro gate: reads hearth_subscriptions, drives checkout
  sessions.js           logs rounds to hearth_sessions, reads the streak
  stripe.js             server-only Stripe client
  supabase/client.js     browser Supabase client
  supabase/server.js     server Supabase client (Server Components, Route Handlers)
  supabase/admin.js      service-role client — webhook only, bypasses RLS
proxy.js                refreshes the Supabase session cookie on every request
public/
  sw.js                 cache-first service worker for the app shell
  icon.svg              app icon (used for the PWA manifest and favicon)
```

**The engine writes to DOM refs, not state.** A 60fps `setState` would re-render
the whole tree every frame. React state changes only when the phase label or
prompt changes — roughly once every few seconds.

## Adding a practice

Add an object to `PATTERNS` in `lib/patterns.js`:

```js
{
  id: "myPractice",
  name: "Long exhale",
  meta: "4·8 — down-regulate",
  phases: [["Inhale", 4], ["Exhale", 8]],
  prompts: ["Optional guided lines"],   // rotates every 4 breaths
  closing: "What the finish card says.",
  pro: false,
  mark: "M4 12h16",                     // 24×24 SVG path
}
```

Nothing else needs touching.

## Phase 2 — status

**Auth.** Supabase email magic-link sign-in (`/login`, `/auth/callback`,
`proxy.js` for session refresh). Nothing about the breathing app requires an
account — signed-out visitors get the full free experience, just without
history or Pro.

**Subscriptions.** `lib/entitlement.js` reads `hearth_subscriptions`
(`user_id`, `plan`, `status`, `current_period_end`) and is `isPro` for
`active`/`trialing` rows that haven't lapsed. `startCheckout()` posts to
`/api/checkout`, which creates a Stripe Checkout session for the signed-in
user with a 7-day trial. `/api/webhooks/stripe` upserts that row on
`checkout.session.completed`, `customer.subscription.updated`, and
`customer.subscription.deleted`, using a service-role client since RLS only
grants users read access to their own row. **Needs real Stripe keys** — see
the Deploy table above — this account had no Stripe credentials to configure.

**History and streaks.** `engine.result` triggers `logSession()`, which
inserts into `hearth_sessions` (`user_id`, `pattern_id`, `minutes`, `breaths`,
`mood_before`, `mood_after`, `completed_at`) and returns the row id so the
mood-after pick can update it in place. `hearth_current_streak(user_id)` is a
Postgres function (`security invoker`, so RLS still applies) counting
consecutive practice days; `HearthApp` shows it in the header once it's > 0.

**Mood check-in.** `MoodPicker` (1–5, before signed-in users start a round and
again on the finish card) writes `mood_before`/`mood_after` on the session row.
Skippable either side — nothing blocks on it.

**Coach audio — not done.** `lib/audio.js` still synthesises tones; recorded
lines for the `heart` pattern's prompts were planned but the TTS account had
no generation credits left when this was built. `playCue()`/`playChime()` are
the seam — swap them for an `AudioBufferSourceNode` player once clips exist,
preloading one phase ahead, matched one-to-one against each pattern's
`prompts` array.

**PWA.** `app/manifest.json` + `public/sw.js` (hand-rolled, cache-first for the
app shell) registered from `ServiceWorkerRegister`. `public/icon.svg` is a
plain SVG icon, not a raster set — fine for modern installs, but add real PNG
sizes if you need broader OS icon support.

## Known limits

- Coach audio is still synthesized tones, not recordings (see above).
- Signed-out use is fully functional but doesn't persist — no account, no
  history, no streak.
- Screen wake lock only works on HTTPS and in browsers that support it. Failure
  is silent by design.
- Vibration is Android-only; iOS Safari ignores `navigator.vibrate`.
- The Supabase project here is shared with unrelated apps. Every Hearth object
  is `hearth_`-prefixed; if you ever split it into its own project, that's a
  straightforward `pg_dump` of just those objects.
