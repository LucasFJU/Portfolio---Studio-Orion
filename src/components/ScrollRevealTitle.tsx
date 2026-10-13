import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ScrollRevealWordProps {
  children: string;
  progress: any;
  range: [number, number];
  shouldReduceMotion: boolean | null;
  fromColor: string;
  toColor: string;
}

const ScrollRevealWord = ({
  children,
  progress,
  range,
  shouldReduceMotion,
  fromColor,
  toColor,
}: ScrollRevealWordProps) => {
  const opacity = useTransform(progress, range, [0.22, 1]);
  const color = useTransform(progress, range, [fromColor, toColor]);

  if (shouldReduceMotion) {
    return <span className="inline-block mr-[0.25em]">{children}</span>;
  }

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.25em] transition-opacity duration-75"
    >
      {children}
    </motion.span>
  );
};

export interface ScrollRevealTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
  offset?: [string, string];
  id?: string;
  theme?: "dark" | "light";
  fromColor?: string;
  toColor?: string;
}

export const ScrollRevealTitle = ({
  text,
  as: Tag = "h2",
  className = "",
  style,
  offset = ["start 0.92", "start 0.55"],
  id,
  theme = "dark",
  fromColor,
  toColor,
}: ScrollRevealTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const resolvedFrom = fromColor || (theme === "light" ? "#9CA3AF" : "#737373");
  const resolvedTo = toColor || (theme === "light" ? "#090A0C" : "#FFFFFF");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: offset as any,
  });

  const words = text.split(" ").filter((w) => w.length > 0);

  return (
    <div ref={containerRef} className="inline-block max-w-full">
      <Tag id={id} className={className} style={style}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = Math.min(1, start + 1.2 / words.length);
          return (
            <ScrollRevealWord
              key={`${word}-${i}`}
              progress={scrollYProgress}
              range={[start, end]}
              shouldReduceMotion={shouldReduceMotion}
              fromColor={resolvedFrom}
              toColor={resolvedTo}
            >
              {word}
            </ScrollRevealWord>
          );
        })}
      </Tag>
    </div>
  );
};

export default ScrollRevealTitle;
