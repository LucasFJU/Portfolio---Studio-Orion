import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/hooks/use-media-query";
import "./orion-cursor.css";

const NATIVE_TARGETS = "input,textarea,select,[contenteditable]:not([contenteditable='false']),[role='textbox'],[data-native-cursor],[draggable='true'],[disabled],[aria-disabled='true']";

export default function OrionCursor() {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    let frame: number | null = null;
    let x = 0;
    let y = 0;
    const hide = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      cursor.style.visibility = "hidden";
      delete document.documentElement.dataset.orionCursor;
    };
    const paint = () => {
      frame = null;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.dataset.edge = x + 90 > document.documentElement.clientWidth ? "left" : "right";
      cursor.dataset.vertical = y + 55 > document.documentElement.clientHeight ? "above" : "below";
      cursor.style.visibility = "visible";
      document.documentElement.dataset.orionCursor = "active";
    };
    const move = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const viewport = document.documentElement;
      if ((event.pointerType && event.pointerType !== "mouse") || !target || target.closest(NATIVE_TARGETS) ||
        event.clientX < 0 || event.clientY < 0 || event.clientX >= viewport.clientWidth || event.clientY >= viewport.clientHeight) {
        hide(); return;
      }
      const style = getComputedStyle(target);
      if (style.resize !== "none" || /resize|grab|text|wait|progress|not-allowed/.test(style.cursor)) {
        hide(); return;
      }
      x = event.clientX;
      y = event.clientY;
      if (frame === null) frame = requestAnimationFrame(paint);
    };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [enabled]);

  if (!enabled) return null;
  return createPortal(
    <div className="orion-cursor-layer" aria-hidden="true">
    <div ref={cursorRef} className="orion-cursor" aria-hidden="true">
      <svg width="25" height="30" viewBox="0 0 25 30" fill="none" focusable="false">
        <path d="M2 2L22 15L12 17L8 27L2 2Z" fill="#FF4001" stroke="#FFD4BE" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span>Você</span>
    </div>
    </div>, document.body,
  );
}
