import ResponsiveImage from "@/components/ResponsiveImage";
import type { PointerEvent } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import portrait from "@/assets/lucas-about-orion-v5.webp";
import "./about-portrait.css";

export default function AboutPortrait({ src = portrait, className = "", loading = "lazy" }: { src?: string; className?: string; loading?: "lazy" | "eager" }) {
  const interactive = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    event.currentTarget.style.setProperty("--portrait-x", `${x * 6}px`);
    event.currentTarget.style.setProperty("--portrait-y", `${y * 6}px`);
  };
  const reset = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty("--portrait-x");
    event.currentTarget.style.removeProperty("--portrait-y");
  };
  return (
    <div className={`orion-portrait-scene ${className}`} onPointerMove={move} onPointerLeave={reset}>
      <div aria-hidden="true" className="orion-portrait-halo" />
      <div aria-hidden="true" className="orion-portrait-ring orion-portrait-ring-outer" />
      <div aria-hidden="true" className="orion-portrait-ring orion-portrait-ring-inner" />
      <ResponsiveImage src={src} sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw" alt="Lucas Evangelista" width={1194} height={1600} loading={loading} decoding="async" className="orion-about-portrait" />
      <div aria-hidden="true" className="orion-portrait-tags">
        <span>Identidade visual</span><span>Redes sociais</span><span>Sites e interfaces</span>
      </div>
    </div>
  );
}
