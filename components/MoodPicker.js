"use client";

const FACES = ["😞", "😕", "😐", "🙂", "😌"];

export default function MoodPicker({ label, value, onPick }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {FACES.map((face, i) => {
          const level = i + 1;
          return (
            <button
              key={level}
              type="button"
              className="chip"
              aria-pressed={value === level}
              aria-label={`${level} of 5`}
              onClick={() => onPick(level)}
            >
              {face}
            </button>
          );
        })}
      </div>
    </div>
  );
}
