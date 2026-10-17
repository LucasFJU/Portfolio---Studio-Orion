import ResponsiveImage from "@/components/ResponsiveImage";
import React from "react";
import { DynamicStudioBackground } from "./DynamicStudioBackground";
import type { HeroConfig } from "@/config/heroConfig";
import heroBgJpg from "@/assets/hero-bg.jpg";

interface HeroBackgroundStageProps {
  backgroundConfig?: HeroConfig["background"];
  colors?: string[];
  bg?: string;
}

export const HeroBackgroundStage: React.FC<HeroBackgroundStageProps> = ({
  backgroundConfig,
  colors,
  bg = "#000000",
}) => {
  const bgType = backgroundConfig?.type || "shader";
  const overlayOpacity = typeof backgroundConfig?.overlayOpacity === "number" ? backgroundConfig.overlayOpacity : 65;
  const overlayAlpha = Math.min(Math.max(overlayOpacity, 0), 100) / 100;

  if (bgType === "image") {
    const imgSrc = backgroundConfig?.imageUrl?.trim() || heroBgJpg;
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none" aria-hidden="true">
        <ResponsiveImage
          src={imgSrc}
          loading="eager"
          alt=""
          role="presentation"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 filter brightness-90 transition-opacity duration-700"
        />
        {/* Dark contrast scrim */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayAlpha }}
        />
        {/* Subtle studio gradient overlay to fade smoothly into bottom section */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>
    );
  }

  if (bgType === "video") {
    const videoSrc =
      backgroundConfig?.videoUrl?.trim() ||
      "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31913-large.mp4";

    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* Dark contrast scrim */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayAlpha }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>
    );
  }

  // Default: WebGL shader background
  return <DynamicStudioBackground colors={colors} bg={bg} />;
};
