"use client";
import { useState, useRef, useEffect } from "react";

export default function SafetyExit() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const offset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const isTouchingButton = useRef(false);

  const lastTap = useRef(0);

  const btnRef = useRef<HTMLButtonElement>(null);

  const DRAG_THRESHOLD = 6;
  const DOUBLE_TAP_DELAY = 300; // ms

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  // Initial position
  useEffect(() => {
    setPos({ x: window.innerWidth - 120, y: 12 });
  }, []);

  // ── Mouse ─────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    hasMoved.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);

    offset.current = {
      x: e.clientX - (pos?.x ?? 0),
      y: e.clientY - (pos?.y ?? 0),
    };
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;

      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);

      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        hasMoved.current = true;
        setPos(clamp(e.clientX - offset.current.x, e.clientY - offset.current.y));
      }
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

  // ── Touch ─────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];

    hasMoved.current = false;
    isTouchingButton.current = true;

    startPos.current = { x: t.clientX, y: t.clientY };
    setDragging(true);

    offset.current = {
      x: t.clientX - (pos?.x ?? 0),
      y: t.clientY - (pos?.y ?? 0),
    };
  }

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!dragging || !isTouchingButton.current) return;

      const t = e.touches[0];
      const dx = Math.abs(t.clientX - startPos.current.x);
      const dy = Math.abs(t.clientY - startPos.current.y);

      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        hasMoved.current = true;
        e.preventDefault();
        setPos(clamp(t.clientX - offset.current.x, t.clientY - offset.current.y));
      }
    }

    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [dragging]);

  function onTouchEnd() {
    if (!isTouchingButton.current) return;

    setDragging(false);

    // Ignore if it was a drag
    if (hasMoved.current) {
      isTouchingButton.current = false;
      return;
    }

    const now = Date.now();

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected → exit
      window.location.replace("https://www.google.com");
    }

    lastTap.current = now;
    isTouchingButton.current = false;
  }

  // ── Click (desktop only) ─────────────────────────────
  function onClick() {
    if (isTouchDevice) return; // ignore click on mobile

    if (!hasMoved.current) {
      window.location.replace("https://www.google.com");
    }
  }

  // ── Clamp inside viewport ────────────────────────────
  function clamp(x: number, y: number) {
    const btnW = btnRef.current?.offsetWidth ?? 100;
    const btnH = btnRef.current?.offsetHeight ?? 36;

    return {
      x: Math.max(8, Math.min(x, window.innerWidth - btnW - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - btnH - 8)),
    };
  }

  if (!pos) return null;

  return (
    <button
      ref={btnRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      aria-label="Quick exit — leave this page immediately"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        background: "#731107",
        color: "white",
        border: "none",
        padding: "7px 14px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: dragging ? "grabbing" : "grab",
        boxShadow: dragging
          ? "0 8px 24px rgba(0,0,0,0.35)"
          : "0 2px 8px rgba(0,0,0,0.25)",
        letterSpacing: "0.03em",
        userSelect: "none",
        touchAction: "manipulation",
        transform: dragging ? "scale(1.05)" : "scale(1)",
        transition: "box-shadow 0.15s, transform 0.1s",
      }}
    >
      ✕ Quick Exit
    </button>
  );
}
