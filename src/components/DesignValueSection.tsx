import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import "./home-surfaces.css";

const benefits = [
  {
    title: "Reconhecimento",
    description: "Uma linguagem visual que ajuda o público a identificar sua marca.",
  },
  {
    title: "Consistência",
    description: "Identidade, redes e site comunicando a mesma essência.",
  },
  {
    title: "Clareza",
    description: "Informação organizada para facilitar a compreensão da oferta.",
  },
];

export default function DesignValueSection() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const animated = desktop && !reducedMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.5 });
  const titleY = useTransform(progress, [0, 1], [20, -20]);
  const brandY = useTransform(progress, [0, 1], [60, -60]);
  const curveY = useTransform(progress, [0, 1], [-60, 60]);
  const benefitY = useTransform(progress, [0, 1], [16, -16]);
  const alternateY = useTransform(progress, [0, 1], [-16, 16]);
  return (
    <section
      ref={ref}
      id="valor-do-design"
      aria-labelledby="design-value-title"
      data-motion={animated ? "scroll" : "static"}
      className="home-surface-light relative isolate overflow-hidden py-16 lg:py-28"
    >
      <motion.div
        aria-hidden="true"
        style={{ y: animated ? brandY : 0 }}
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 select-none text-center text-[29vw] font-semibold leading-none tracking-[-0.09em] text-[#090A0C]/[0.035] lg:top-16"
      >ORION</motion.div>
      <div className="relative orion-content-container">
        <motion.svg
          style={{ y: animated ? curveY : 0 }}
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 600 320"
          className="pointer-events-none absolute -right-12 -top-12 h-auto w-[60%] max-w-[600px] opacity-[0.18]"
        >
          <path d="M24 210 C90 10 600 10 540 174 C480 338 180 310 246 170 C300 68 492 100 582 284" fill="none" stroke="#FF4001" strokeWidth="2" />
        </motion.svg>
        <p className="relative mb-7 text-xs tracking-wide text-muted-foreground">
          <span className="mr-3 font-mono text-primary">02.</span>Valor do design
        </p>
        <motion.h2
          id="design-value-title"
          style={{ y: animated ? titleY : 0, opacity: 1 }}
          className="relative max-w-[22ch] text-[36px] font-medium leading-[1.1] tracking-[-0.04em] sm:text-[48px] lg:text-[64px]"
        >
          Design que torna sua marca mais clara, consistente e reconhecível.
        </motion.h2>
        <div className="relative mt-12 grid grid-cols-1 border-t border-border lg:mt-24 lg:grid-cols-3 lg:pb-4">
          {benefits.map((benefit, index) => (
            <motion.article
              style={{ y: animated ? (index === 1 ? alternateY : benefitY) : 0 }}
              key={benefit.title}
              aria-labelledby={`design-benefit-${index}`}
              className={`border-b border-border py-7 lg:border-b-0 lg:py-8 ${index ? "lg:border-l lg:pl-9" : ""} ${index < 2 ? "lg:pr-9" : ""}`}
            >
              <p aria-hidden="true" className="mb-5 font-mono text-xs text-primary">/ 0{index + 1}</p>
              <h3 id={`design-benefit-${index}`} className="mb-3 text-2xl font-medium">{benefit.title}</h3>
              <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">{benefit.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
