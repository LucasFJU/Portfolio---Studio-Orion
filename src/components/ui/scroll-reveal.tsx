import React, { ElementType } from "react";
import { motion, useReducedMotion, Variants, HTMLMotionProps } from "framer-motion";

export interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  scale?: boolean | number;
  className?: string;
  viewportMargin?: string;
  once?: boolean;
  as?: ElementType;
}

export const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.55,
  yOffset = 22,
  xOffset = 22,
  scale = false,
  className = "",
  viewportMargin = "-50px",
  once = true,
  as: Component = "div",
  ...props
}: ScrollRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  let initialX = 0;
  let initialY = 0;

  if (direction === "up") initialY = yOffset;
  if (direction === "down") initialY = -yOffset;
  if (direction === "left") initialX = xOffset;
  if (direction === "right") initialX = -xOffset;

  const initialScale = typeof scale === "number" ? scale : scale ? 0.97 : 1;

  const MotionComponent = (motion as any)[Component as string] || motion.div;

  return (
    <MotionComponent
      initial={{
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: initialScale,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, margin: viewportMargin as any }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Cubic bezier for natural luxury easing
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewportMargin?: string;
  once?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

export const StaggerContainer = ({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className = "",
  viewportMargin = "-50px",
  once = true,
  ...props
}: StaggerContainerProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerDelay, delayChildren }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin as any }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
}

export const StaggerItem = ({
  children,
  className = "",
  yOffset = 20,
  duration = 0.5,
  ...props
}: StaggerItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
