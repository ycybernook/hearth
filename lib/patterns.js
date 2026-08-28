// Every practice lives here. Phases are [label, seconds].
// Add `prompts` for guided text; the engine rotates them every 4 breaths.
// Add `pro: true` to put one behind the paywall.

export const PATTERNS = [
  {
    id: "heart",
    name: "Heart centered",
    meta: "6·6 with attention at the chest",
    heart: true,
    pro: false,
    phases: [["Breathe in", 6], ["Breathe out", 6]],
    prompts: [
      "Let your attention rest in the centre of your chest.",
      "Imagine the breath moving in and out through that spot.",
      "Bring to mind someone who is easy to care about.",
      "Hold that feeling gently. Nothing to force.",
      "Let the chest soften on every exhale.",
      "Now let that warmth spread outward, past you.",
    ],
    closing: "Carry a little of that with you.",
    mark: "M12 20c-5-3.6-8-6.4-8-10a4.6 4.6 0 0 1 8-2.6A4.6 4.6 0 0 1 20 10c0 3.6-3 6.4-8 10z",
  },
  {
    id: "box",
    name: "Box",
    meta: "4·4·4·4 — steady the nerves",
    pro: false,
    phases: [["Inhale", 4], ["Hold", 4], ["Exhale", 4], ["Hold", 4]],
    closing: "Sit here a moment before you get up.",
    mark: "M5 5h14v14H5z",
  },
  {
    id: "478",
    name: "Four seven eight",
    meta: "4·7·8 — for falling asleep",
    pro: false,
    phases: [["Inhale", 4], ["Hold", 7], ["Exhale", 8]],
    closing: "Let yourself stay heavy.",
    mark: "M4 16c4 0 4-8 8-8s4 8 8 8",
  },
  {
    id: "coh",
    name: "Coherent",
    meta: "5·5 — even, for focus",
    pro: false,
    phases: [["Inhale", 5], ["Exhale", 5]],
    closing: "Sit here a moment before you get up.",
    mark: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0M4 12h16",
  },
  {
    id: "sigh",
    name: "Physiological sigh",
    meta: "double inhale — fastest reset",
    pro: false,
    phases: [["Inhale", 2], ["Top up", 1], ["Exhale", 6]],
    closing: "That was sixty seconds. Notice what changed.",
    mark: "M4 14c3 0 3-4 6-4s2 3 5 3 4-5 5-5",
  },
  {
    id: "whm",
    name: "Wim Hof round",
    meta: "30 power breaths, then hold",
    pro: true,
    phases: [["Inhale", 1.5], ["Exhale", 1.5]],
    closing: "Come back slowly.",
    mark: "M12 3v18M5 8l7-5 7 5",
  },
];

export const LENGTHS = [
  { mins: 1, pro: false },
  { mins: 3, pro: false },
  { mins: 5, pro: false },
  { mins: 10, pro: false },
  { mins: 15, pro: true },
];

export const getPattern = (id) => PATTERNS.find((p) => p.id === id);
