import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

let isRegistered = false;

export function registerGsapPlugins() {
  if (typeof window !== "undefined" && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    isRegistered = true;
  }
}

registerGsapPlugins();

export const STACK_DESKTOP_MIN_WIDTH = 1024;

export interface EditorialScrollConditions {
  isDesktopStack: boolean;
  isDesktopMotion: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
}

/**
 * Helper to create a responsive GSAP matchMedia context scoped to a component ref.
 */
export function createEditorialScrollContext(
  setup: (conditions: EditorialScrollConditions) => void | (() => void),
  scope?: RefObject<Element | null> | Element | null
) {
  registerGsapPlugins();
  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktopStack: `(min-width: ${STACK_DESKTOP_MIN_WIDTH}px)`,
      isDesktopMotion: `(min-width: 768px)`,
      isMobile: `(max-width: ${STACK_DESKTOP_MIN_WIDTH - 1}px)`,
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const conditions = (context.conditions ?? {
        isDesktopStack: false,
        isDesktopMotion: false,
        isMobile: true,
        reduceMotion: false,
      }) as unknown as EditorialScrollConditions;

      return setup(conditions);
    },
    scope || undefined
  );

  return mm;
}

export { gsap, ScrollTrigger };
