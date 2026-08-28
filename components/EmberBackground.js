"use client";

import { useEffect, useState } from "react";

const SPARK_COUNT = 16;

function randomSpark(i) {
  return {
    id: i,
    left: 8 + Math.random() * 84, // %
    duration: 5 + Math.random() * 4, // s
    delay: Math.random() * -9, // negative so sparks are already mid-flight on mount
    drift: `${(Math.random() * 40 - 20).toFixed(0)}px`,
  };
}

// Sparks lifting off dying coals — the ambient background behind the whole
// app. Generated client-side after mount (not during render) so the random
// per-spark values never cause a server/client hydration mismatch.
export default function EmberBackground() {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSparks(Array.from({ length: SPARK_COUNT }, (_, i) => randomSpark(i)));
  }, []);

  return (
    <div className="ember-bg" aria-hidden="true">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={{
            left: `${s.left}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            "--drift": s.drift,
          }}
        />
      ))}
    </div>
  );
}
