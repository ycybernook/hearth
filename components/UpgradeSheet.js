"use client";

import { useEffect, useRef } from "react";

const PERKS = [
  "Every practice, including Wim Hof rounds",
  "Build your own timing and round count",
  "Sessions up to 30 minutes",
  "Guided voice sessions and full history",
];

export default function UpgradeSheet({ reason, onClose, onUpgrade, checkingOut }) {
  const open = reason !== null;
  const cta = useRef(null);
  const returnTo = useRef(null);

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement;
      cta.current?.focus();
    } else if (returnTo.current) {
      returnTo.current.focus?.();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={onClose} />
      <div
        className={`sheet${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="sheetTitle"
      >
        <div className="grip" />
        <h2 id="sheetTitle">Go further with Hearth Pro</h2>
        <p>{reason || ""}</p>
        <ul className="perks">
          {PERKS.map((perk) => (
            <li key={perk}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m20 6-11 11-5-5" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
        <div className="sheet-actions">
          <button
            ref={cta}
            className="btn btn-primary"
            onClick={onUpgrade}
            disabled={checkingOut}
            tabIndex={open ? 0 : -1}
          >
            {checkingOut ? "Redirecting…" : "Start 7-day free trial"}
          </button>
          <button className="btn btn-quiet" onClick={onClose} tabIndex={open ? 0 : -1}>
            Not now
          </button>
        </div>
      </div>
    </>
  );
}
