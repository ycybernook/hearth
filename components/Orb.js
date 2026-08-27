"use client";

import { forwardRef } from "react";

const Orb = forwardRef(function Orb(
  { cue, summary, showHeart, accent, refs, ringCirc },
  _ref
) {
  return (
    <div className="orb-wrap" data-accent={accent}>
      <svg className="orb-svg" viewBox="0 0 240 240" aria-hidden="true">
        <circle className="ring-track" cx="120" cy="120" r="112" />
        <circle
          ref={refs.ring}
          className="ring-progress"
          cx="120"
          cy="120"
          r="112"
          transform="rotate(-90 120 120)"
          strokeDasharray={ringCirc}
          strokeDashoffset={ringCirc}
        />
        <g ref={refs.swell} className="swell">
          <circle className="swell-halo" cx="120" cy="120" r="92" />
          <circle className="swell-core" cx="120" cy="120" r="88" />
          <circle className="swell-edge" cx="120" cy="120" r="88" />
        </g>
        <path
          ref={refs.heart}
          className={`heartmark${showHeart ? " on" : ""}`}
          d="M120 148c-16-12-30-22-30-36a16 16 0 0 1 30-8 16 16 0 0 1 30 8c0 14-14 24-30 36z"
        />
      </svg>

      <div className="readout" role="status" aria-live="polite">
        <p className="cue">{cue}</p>
        <div className="count" ref={refs.count} aria-hidden="true" />
        <div className="rounds">{summary}</div>
      </div>
    </div>
  );
});

export default Orb;
