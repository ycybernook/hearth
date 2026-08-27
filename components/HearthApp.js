"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Orb from "./Orb";
import Settings from "./Settings";
import UpgradeSheet from "./UpgradeSheet";
import { PATTERNS, getPattern } from "@/lib/patterns";
import { useBreathEngine, fmtClock } from "@/lib/useBreathEngine";
import { useEntitlement } from "@/lib/entitlement";
import { unlockAudio, tone, buzz } from "@/lib/audio";

export default function HearthApp() {
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [minutes, setMinutes] = useState(3);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const refs = {
    swell: useRef(null),
    heart: useRef(null),
    ring: useRef(null),
    count: useRef(null),
    elapsed: useRef(null),
  };

  const engine = useBreathEngine(refs, { sound, haptics });
  const { isPro, gate, requirePro, closeGate, startCheckout } = useEntitlement();

  const summary = useMemo(() => `${pattern.name} · ${minutes} min`, [pattern, minutes]);
  const idle = !engine.running && !engine.result;

  const pickPattern = useCallback(
    (p) => {
      if (!requirePro(p.pro, `${p.name} is part of Pro.`)) return;
      setPattern(p);
    },
    [requirePro]
  );

  const pickLength = useCallback(
    (l) => {
      if (!requirePro(l.pro, "Free sessions run up to 5 minutes.")) return;
      setMinutes(l.mins);
    },
    [requirePro]
  );

  const onStart = useCallback(() => {
    if (engine.running) {
      engine.stop();
      return;
    }
    unlockAudio();
    engine.start(pattern, minutes * 60);
  }, [engine, pattern, minutes]);

  const onPanic = useCallback(() => {
    const sigh = getPattern("sigh");
    setPattern(sigh);
    setMinutes(1);
    unlockAudio();
    engine.start(sigh, 60);
  }, [engine]);

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">
          Hearth<em>.</em>
        </h1>
        <span className="status">{engine.running ? "In session" : "Resting"}</span>
      </header>

      <main className="stage">
        <Orb
          cue={engine.cue}
          summary={summary}
          showHeart={pattern.heart}
          accent={engine.accent}
          refs={refs}
          ringCirc={engine.RING_CIRC}
        />

        <p className={`prompt${engine.prompt ? " on" : ""}`} role="status" aria-live="polite">
          {engine.prompt}
        </p>

        <div className="elapsed" ref={refs.elapsed}>
          {fmtClock(minutes * 60)} remaining
        </div>

        <div className="controls">
          <button className="btn btn-primary" onClick={onStart}>
            {engine.running ? "Stop" : "Begin"}
          </button>
          {!engine.running && (
            <button className="btn btn-panic" onClick={onPanic}>
              Steady me
            </button>
          )}
        </div>
      </main>

      {engine.result ? (
        <section className="panel" aria-label="Session complete">
          <div className="finish">
            <h2>That&rsquo;s the round.</h2>
            <p>{engine.result.closing}</p>
            <div className="stats">
              <div>
                <span className="stat-num">{engine.result.breaths}</span>
                <span className="stat-lbl">Breaths</span>
              </div>
              <div>
                <span className="stat-num">{engine.result.minutes}</span>
                <span className="stat-lbl">Minutes</span>
              </div>
            </div>
            <button className="btn" onClick={engine.stop} autoFocus>
              Back to start
            </button>
          </div>
        </section>
      ) : (
        idle && (
          <Settings
            isPro={isPro}
            patternId={pattern.id}
            minutes={minutes}
            sound={sound}
            haptics={haptics}
            onPickPattern={pickPattern}
            onPickLength={pickLength}
            onToggleSound={() => {
              setSound((s) => {
                if (!s) tone(528, 0.3);
                return !s;
              });
            }}
            onToggleHaptics={() => {
              setHaptics((h) => {
                if (!h) buzz(30);
                return !h;
              });
            }}
          />
        )
      )}

      <UpgradeSheet reason={gate} onClose={closeGate} onUpgrade={startCheckout} />
    </div>
  );
}
