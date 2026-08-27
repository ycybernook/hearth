// Full-length recorded guided sessions, keyed by `${patternId}-${minutes}`.
// When one exists for the picked practice + length, it replaces the
// synthesised phase tones — the voice already carries the pacing.
const COACH_AUDIO = {
  "heart-5": "/audio/heart-5.mp3",
  "heart-10": "/audio/heart-10.mp3",
};

export function getCoachAudioUrl(patternId, minutes) {
  return COACH_AUDIO[`${patternId}-${minutes}`] || null;
}
