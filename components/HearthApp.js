"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Orb from "./Orb";
import Settings from "./Settings";
import UpgradeSheet from "./UpgradeSheet";
import MoodPicker from "./MoodPicker";
import { PATTERNS, getPattern } from "@/lib/patterns";
import { useBreathEngine, fmtClock } from "@/lib/useBreathEngine";
import { useEntitlement } from "@/lib/entitlement";
import { unlockAudio, tone, buzz } from "@/lib/audio";
import { logSession, setMoodAfter, getStreak } from "@/lib/sessions";
import { getCoachAudioUrl } from "@/lib/coachAudio";
import { createClient } from "@/lib/supabase/client";

export default function HearthApp({ user }) {
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [minutes, setMinutes] = useState(3);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter_] = useState(null);
  const [streak, setStreak] = useState(0);

  const sessionIdRef = useRef(null);

  const refs = {
    swell: useRef(null),
    heart: useRef(null),
    ring: useRef(null),
    count: useRef(null),
    elapsed: useRef(null),
  };

  const coachAudioUrl = useMemo(() => getCoachAudioUrl(pattern.id, minutes), [pattern.id, minutes]);
  const engine = useBreathEngine(refs, { sound, haptics, coachAudioUrl });
  const { isPro, gate, requirePro, closeGate, startCheckout, checkingOut } = useEntitlement(user);

  const summary = useMemo(
    () => `${pattern.name} · ${minutes} min${coachAudioUrl ? " · Guided" : ""}`,
    [pattern, minutes, coachAudioUrl]
  );
  const idle = !engine.running && !engine.result;

  const refreshStreak = useCallback(() => {
    if (user) getStreak(user.id).then(setStreak);
  }, [user]);

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  // Log the round the moment it finishes, then let the mood-after pick
  // update that same row — the session is never lost if they walk away.
  useEffect(() => {
    if (!engine.result) return;
    sessionIdRef.current = null;
    setMoodAfter_(null);
    logSession({
      userId: user?.id,
      patternId: pattern.id,
      minutes: engine.result.minutes,
      breaths: engine.result.breaths,
      moodBefore,
    }).then((id) => {
      sessionIdRef.current = id;
      if (id) refreshStreak();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.result]);

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

  const onMoodAfter = useCallback((level) => {
    setMoodAfter_(level);
    setMoodAfter(sessionIdRef.current, level);
  }, []);

  const onBackToStart = useCallback(() => {
    setMoodBefore(null);
    engine.stop();
  }, [engine]);

  const onSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">
          Hearth<em>.</em>
        </h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--s2)" }}>
          {user && streak > 0 && (
            <span className="status" title="Current streak">
              🔥 {streak}d
            </span>
          )}
          <span className="status">{engine.running ? "In session" : "Resting"}</span>
          {user ? (
            <button className="toggle" onClick={onSignOut} style={{ padding: "4px 10px" }}>
              Sign out
            </button>
          ) : (
            <a className="toggle" href="/login" style={{ padding: "4px 10px", textDecoration: "none" }}>
              Sign in
            </a>
          )}
        </div>
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
            {user && (
              <MoodPicker label="How do you feel now?" value={moodAfter} onPick={onMoodAfter} />
            )}
            <button className="btn" onClick={onBackToStart} autoFocus>
              Back to start
            </button>
          </div>
        </section>
      ) : (
        idle && (
          <>
            {user && (
              <section className="panel" aria-label="Mood check-in">
                <MoodPicker label="How do you feel right now?" value={moodBefore} onPick={setMoodBefore} />
              </section>
            )}
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
          </>
        )
      )}

      <UpgradeSheet reason={gate} onClose={closeGate} onUpgrade={startCheckout} checkingOut={checkingOut} />
    </div>
  );
}
