# Hearth

Breathwork on the web. Six practices, led by heart-centered breathing.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Push to GitHub, import the repo at vercel.com. No environment variables needed yet.

## How it's put together

```
app/
  layout.js        fonts, metadata, theme colour
  page.js          server component, renders the client app
  globals.css      every style, driven by CSS custom properties
components/
  HearthApp.js     state, wiring, layout
  Orb.js           the ring, the swell, the heart mark
  Settings.js      practice picker, length, cue toggles
  UpgradeSheet.js  the paywall
lib/
  patterns.js      practice data — edit this, not the engine
  useBreathEngine.js  the rAF loop
  audio.js         synthesised cues and haptics
  entitlement.js   the Pro gate, stubbed
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

## Phase 2 — what to wire next

**Subscriptions.** `lib/entitlement.js` is the only file that knows about Pro.
Replace `useEntitlement` with a Supabase read of a `subscriptions` table
(`user_id`, `plan`, `status`, `current_period_end`) and point `startCheckout()`
at an `/api/checkout` route that creates a Stripe Checkout session. A webhook at
`/api/webhooks/stripe` updates that row on `checkout.session.completed`,
`customer.subscription.updated`, and `customer.subscription.deleted`.

**History and streaks.** On `engine.result`, insert a row into `sessions`
(`user_id`, `pattern_id`, `minutes`, `breaths`, `completed_at`). Streak is a
window function over `completed_at::date`.

**Mood check-in.** A 1–5 slider before and after. Store both on the session row;
the delta over time is the chart that makes Pro worth paying for.

**Coach audio.** `lib/audio.js` exposes `playCue(label)`. Swap the oscillator for
an `AudioBufferSourceNode` fed from Supabase Storage, preloading the next clip
one phase ahead. The `prompts` array in each pattern maps one-to-one onto
recorded lines.

**PWA.** Add `app/manifest.json` and a service worker (`next-pwa` or hand-rolled)
to cache the shell and any downloaded audio.

## Known limits

- No persistence yet — reload clears the session.
- Screen wake lock only works on HTTPS and in browsers that support it. Failure
  is silent by design.
- Vibration is Android-only; iOS Safari ignores `navigator.vibrate`.
