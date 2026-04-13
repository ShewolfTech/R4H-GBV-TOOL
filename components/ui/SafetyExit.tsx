"use client";
import { useState, useRef, useEffect } from "react";

export default function SafetyExit() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const offset  = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const btnRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPos({ x: window.innerWidth - 120, y: 12 });
  }, []);

  // ── Mouse ─────────────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    hasMoved.current = false;
    setDragging(true);
    offset.current = {
      x: e.clientX - (pos?.x ?? 0),
      y: e.clientY - (pos?.y ?? 0),
    };
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      hasMoved.current = true;
      setPos(clamp(e.clientX - offset.current.x, e.clientY - offset.current.y));
    }
    function onMouseUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // ── Touch ─────────────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    hasMoved.current = false;
    setDragging(true);
    offset.current = {
      x: t.clientX - (pos?.x ?? 0),
      y: t.clientY - (pos?.y ?? 0),
    };
  }

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!dragging) return;
      e.preventDefault();
      hasMoved.current = true;
      const t = e.touches[0];
      setPos(clamp(t.clientX - offset.current.x, t.clientY - offset.current.y));
    }
    function onTouchEnd() {
      setDragging(false);
      // On touch: if no movement, treat as a tap → exit
      if (!hasMoved.current) {
        window.location.replace("https://www.google.com");
      }
    }
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging]);

  function clamp(x: number, y: number) {
    const btnW = btnRef.current?.offsetWidth  ?? 100;
    const btnH = btnRef.current?.offsetHeight ?? 36;
    return {
      x: Math.max(8, Math.min(x, window.innerWidth  - btnW - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - btnH - 8)),
    };
  }

  // ── Click — only fires if mouse didn't move ───────────────────────────────
  function onClick() {
    if (!hasMoved.current) {
      window.location.replace("https://www.google.com");
    }
  }

  if (!pos) return null;

  return (
    <button
      ref={btnRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onClick}
      aria-label="Quick exit — leave this page immediately"
      style={{
        position:     "fixed",
        left:         pos.x,
        top:          pos.y,
        zIndex:       9999,
        background:   "#731107",
        color:        "white",
        border:       "none",
        padding:      "7px 14px",
        borderRadius: "6px",
        fontSize:     "12px",
        fontWeight:   600,
        fontFamily:   "'DM Sans', sans-serif",
        cursor:       dragging ? "grabbing" : "grab",
        boxShadow:    dragging
          ? "0 8px 24px rgba(0,0,0,0.35)"
          : "0 2px 8px rgba(0,0,0,0.25)",
        letterSpacing: "0.03em",
        userSelect:   "none",
        touchAction:  "none",
        transform:    dragging ? "scale(1.05)" : "scale(1)",
        transition:   dragging ? "box-shadow 0.15s" : "box-shadow 0.15s, transform 0.1s",
      }}
    >
      ✕ Quick Exit
    </button>
  );
}
