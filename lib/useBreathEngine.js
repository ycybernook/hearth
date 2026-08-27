"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playCue, playChime, buzz } from "./audio";

const MIN_SCALE = 0.42;
const MAX_SCALE = 1;
const RING_CIRC = 2 * Math.PI * 112;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const fmtClock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * refs: { swell, heart, ring, count, elapsed }
 * The loop writes straight to these nodes so React never re-renders at 60fps.
 * State changes only when the phase or prompt actually changes.
 */
export function useBreathEngine(refs, { sound, haptics, coachAudioUrl }) {
  const [running, setRunning] = useState(false);
  const [cue, setCue] = useState("Ready");
  const [prompt, setPrompt] = useState("");
  const [accent, setAccent] = useState("ember");
  const [result, setResult] = useState(null); // { breaths, minutes, closing }

  const raf = useRef(null);
  const wakeLock = useRef(null);
  const breaths = useRef(0);
  const opts = useRef({ sound, haptics, coachAudioUrl });
  const reduced = useRef(false);
  const coachAudio = useRef(null);

  useEffect(() => {
    opts.current = { sound, haptics, coachAudioUrl };
  }, [sound, haptics, coachAudioUrl]);

  const stopCoachAudio = useCallback(() => {
    if (coachAudio.current) {
      coachAudio.current.pause();
      coachAudio.current = null;
    }
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) wakeLock.current = await navigator.wakeLock.request("screen");
    } catch (e) {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
    } catch (e) {}
  }, []);

  const paint = useCallback(
    (scale, isHeart) => {
      const s = reduced.current ? (scale > 0.7 ? MAX_SCALE : MIN_SCALE) : scale;
      if (refs.swell.current) refs.swell.current.style.transform = `scale(${s.toFixed(4)})`;
      if (isHeart && refs.heart.current) {
        refs.heart.current.style.transform = `scale(${(0.9 + 0.25 * (s - MIN_SCALE)).toFixed(3)})`;
      }
    },
    [refs]
  );

  const reset = useCallback(() => {
    setRunning(false);
    if (raf.current) cancelAnimationFrame(raf.current);
    releaseWakeLock();
    stopCoachAudio();
    setCue("Ready");
    setPrompt("");
    if (refs.count.current) refs.count.current.textContent = "";
    if (refs.ring.current) refs.ring.current.setAttribute("stroke-dashoffset", RING_CIRC);
    paint(0.75, false);
  }, [paint, refs, releaseWakeLock, stopCoachAudio]);

  const stop = useCallback(() => {
    reset();
    setResult(null);
  }, [reset]);

  const start = useCallback(
    (pattern, totalSeconds) => {
      setResult(null);
      setRunning(true);
      requestWakeLock();
      breaths.current = 0;

      stopCoachAudio();
      if (opts.current.sound && opts.current.coachAudioUrl) {
        const audioEl = new Audio(opts.current.coachAudioUrl);
        audioEl.play().catch(() => {});
        coachAudio.current = audioEl;
      }

      const phases = pattern.phases;
      const prompts = pattern.prompts || null;
      const t0 = performance.now();
      let idx = 0;
      let phaseStart = 0;
      let lastCount = -1;
      let announced = -1;
      let promptIdx = -1;

      if (prompts) {
        promptIdx = 0;
        setPrompt(prompts[0]);
      } else {
        setPrompt("");
      }
      setAccent(pattern.heart ? "rose" : "ember");

      const frame = (now) => {
        const t = (now - t0) / 1000;

        if (t >= totalSeconds) {
          if (opts.current.sound && !opts.current.coachAudioUrl) playChime();
          if (opts.current.haptics) buzz([40, 90, 40]);
          stopCoachAudio();
          setCue("Done");
          setPrompt("");
          if (refs.ring.current) refs.ring.current.setAttribute("stroke-dashoffset", 0);
          if (refs.elapsed.current) refs.elapsed.current.textContent = "00:00 remaining";
          if (refs.count.current) refs.count.current.textContent = "";
          paint(0.75, false);
          releaseWakeLock();
          setRunning(false);
          setResult({
            breaths: breaths.current,
            minutes: Math.round(totalSeconds / 60),
            closing: pattern.closing,
          });
          return;
        }

        while (t - phaseStart >= phases[idx][1]) {
          phaseStart += phases[idx][1];
          idx = (idx + 1) % phases.length;
          if (idx === 0) breaths.current += 1;
        }

        const [label, dur] = phases[idx];
        const p = Math.min((t - phaseStart) / dur, 1);

        if (announced !== idx) {
          announced = idx;
          setCue(label);
          const isHold = /hold|top up/i.test(label);
          setAccent(pattern.heart ? "rose" : isHold ? "hold" : "ember");
          if (opts.current.sound && !opts.current.coachAudioUrl) playCue(label, { heart: pattern.heart });
          if (opts.current.haptics) buzz(isHold ? 18 : 35);
        }

        if (prompts) {
          const want = Math.min(Math.floor(breaths.current / 4), prompts.length - 1);
          if (want !== promptIdx) {
            promptIdx = want;
            setPrompt(prompts[promptIdx]);
          }
        }

        const remain = Math.ceil(dur - (t - phaseStart));
        if (remain !== lastCount) {
          lastCount = remain;
          if (refs.count.current) refs.count.current.textContent = String(remain);
        }

        let scale;
        if (/in\b|inhale/i.test(label)) scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * easeInOut(p);
        else if (/out|exhale/i.test(label)) scale = MAX_SCALE - (MAX_SCALE - MIN_SCALE) * easeInOut(p);
        else if (/top up/i.test(label)) scale = MAX_SCALE;
        else scale = idx > 0 && /exhale|out/i.test(phases[idx - 1][0]) ? MIN_SCALE : MAX_SCALE;
        paint(scale, pattern.heart);

        if (refs.ring.current) {
          refs.ring.current.setAttribute("stroke-dashoffset", RING_CIRC * (1 - t / totalSeconds));
        }
        if (refs.elapsed.current) {
          refs.elapsed.current.textContent = fmtClock(totalSeconds - t) + " remaining";
        }

        raf.current = requestAnimationFrame(frame);
      };

      raf.current = requestAnimationFrame(frame);
    },
    [paint, refs, releaseWakeLock, requestWakeLock, stopCoachAudio]
  );

  // Screen lock is dropped when the tab is backgrounded — take it back.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && running) requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running, requestWakeLock]);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      releaseWakeLock();
      stopCoachAudio();
    };
  }, [releaseWakeLock, stopCoachAudio]);

  return { running, cue, prompt, accent, result, start, stop, reset, RING_CIRC };
}
