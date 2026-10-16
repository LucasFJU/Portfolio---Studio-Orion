import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import "./home-surfaces.css";

export interface SectionTransitionProps {
  sourceColor: string;
  destinationColor: string;
  direction?: "rise-left" | "rise-right";
}

/** Color and curve changes stay inside this text-free, fixed-height band. */
export default function SectionTransition({
  sourceColor,
  destinationColor,
  direction = "rise-right",
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = useReducedMotion();
  const animated = desktop && !reducedMotion;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.4 });
  const reveal = useTransform(progress, [0, 1], [6, -6]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="orion-section-transition"
      data-motion={animated ? "scroll" : "static"}
      data-source={sourceColor}
      data-destination={destinationColor}
      style={{ backgroundColor: sourceColor }}
    >
      <motion.div
        className="absolute -inset-x-px -bottom-2 top-0"
        style={{ y: animated ? reveal : 0 }}
      >
        <svg
          viewBox={desktop ? "0 0 1440 40" : "0 0 1440 20"}
          preserveAspectRatio="none"
          focusable="false"
          className={`block h-full w-full ${direction === "rise-left" ? "-scale-x-100" : ""}`}
        >
          <motion.path
            d={desktop
              ? "M0 20 C480 20 960 12 1440 12 L1440 40 L0 40 Z"
              : "M0 8 C480 8 960 4 1440 4 L1440 20 L0 20 Z"}
            fill={destinationColor}
          />
        </svg>
      </motion.div>
      {/* Solid edge prevents antialiasing seams where the next section starts. */}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: destinationColor }} />
    </div>
  );
}
