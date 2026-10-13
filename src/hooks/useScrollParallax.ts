import { RefObject } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

export interface ScrollParallaxSpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  restDelta?: number;
}

export interface UseScrollParallaxOptions {
  /**
   * The motion direction: "horizontal" translates 'x', "vertical" translates 'y'.
   * Defaults to "horizontal".
   */
  direction?: "horizontal" | "vertical";
  /**
   * Output range mapping corresponding to scroll progress [0, 1].
   * Example: ["2%", "-28%"] for horizontal glide or ["0px", "-100px"] for vertical.
   */
  range: [string | number, string | number];
  /**
   * Offset intersection points for useScroll.
   * Defaults to ["start end", "end start"].
   */
  offset?: [string, string];
  /**
   * Physics configuration for Framer Motion useSpring.
   */
  spring?: ScrollParallaxSpringConfig;
  /**
   * If true, bypasses spring smoothing and maps directly.
   */
  disableSpring?: boolean;
}

export interface UseScrollParallaxReturn {
  /** Raw 0 to 1 scroll progress */
  scrollYProgress: MotionValue<number>;
  /** Smoothed 0 to 1 scroll progress with spring physics */
  smoothProgress: MotionValue<number>;
  /** The computed translation MotionValue */
  translation: MotionValue<string | number>;
  /** Ready-to-spread style object for motion elements */
  style: { x?: MotionValue<string | number> | string; y?: MotionValue<string | number> | string };
  /** Whether reduced motion is active */
  shouldReduceMotion: boolean | null;
}

const DEFAULT_SPRING: ScrollParallaxSpringConfig = {
  damping: 24,
  stiffness: 85,
  mass: 0.2,
};

/**
 * Custom hook using Framer Motion to track scroll position relative to a target element
 * and map it to smooth, physics-buffered horizontal or vertical translation.
 */
export function useScrollParallax(
  targetRef: RefObject<HTMLElement | null>,
  options: UseScrollParallaxOptions
): UseScrollParallaxReturn {
  const {
    direction = "horizontal",
    range,
    offset = ["start end", "end start"],
    spring = DEFAULT_SPRING,
    disableSpring = false,
  } = options;

  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef as any,
    offset: offset as any,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING,
    ...spring,
  });

  const activeProgress = disableSpring ? scrollYProgress : smoothProgress;

  const translation = useTransform(activeProgress, [0, 1], range);

  const style = shouldReduceMotion
    ? { [direction === "horizontal" ? "x" : "y"]: "0%" }
    : { [direction === "horizontal" ? "x" : "y"]: translation };

  return {
    scrollYProgress,
    smoothProgress,
    translation,
    style,
    shouldReduceMotion,
  };
}

export default useScrollParallax;
