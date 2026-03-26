"use client";
export default function SafetyExit() {
  return (
    <button
      className="safety-exit"
      onClick={() => window.location.replace("https://www.google.com")}
      aria-label="Quick exit — leave this page immediately"
    >
      ✕ Quick Exit
    </button>
  );
}
