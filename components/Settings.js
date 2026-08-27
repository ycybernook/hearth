"use client";

import { PATTERNS, LENGTHS } from "@/lib/patterns";

function LockIcon() {
  return (
    <svg className="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Pro">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function Settings({
  isPro,
  patternId,
  minutes,
  sound,
  haptics,
  onPickPattern,
  onPickLength,
  onToggleSound,
  onToggleHaptics,
}) {
  return (
    <section className="panel" aria-label="Session settings">
      <div className="field">
        <span className="field-label">Practice</span>
        <div className="patterns" role="group" aria-label="Breathing practice">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              className="pattern"
              data-id={p.id}
              aria-pressed={patternId === p.id}
              onClick={() => onPickPattern(p)}
            >
              <span className="pattern-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d={p.mark} />
                </svg>
              </span>
              <span className="pattern-text">
                <span className="pattern-name">{p.name}</span>
                <span className="pattern-meta">{p.meta}</span>
              </span>
              {p.pro && !isPro && <span className="tag-pro">Pro</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Length</span>
        <div className="chips" role="group" aria-label="Session length">
          {LENGTHS.map((l) => (
            <button
              key={l.mins}
              className="chip"
              aria-pressed={minutes === l.mins}
              onClick={() => onPickLength(l)}
            >
              {l.mins} min
              {l.pro && !isPro && <LockIcon />}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Cues</span>
        <div className="toggles">
          <button className="toggle" aria-pressed={sound} onClick={onToggleSound}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
            Sound
          </button>
          <button className="toggle" aria-pressed={haptics} onClick={onToggleHaptics}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="7" y="3" width="10" height="18" rx="2" />
              <path d="M3 9v6M21 9v6" />
            </svg>
            Vibration
          </button>
        </div>
      </div>

      <p className="safety">
        Breathwork changes how you feel fast. Sit or lie down, never practise in or near water,
        and stop if you feel dizzy or faint. Skip breath holds if you are pregnant or live with
        epilepsy, a heart condition, or high blood pressure. This is not medical care.
      </p>
    </section>
  );
}
