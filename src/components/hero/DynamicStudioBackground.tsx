import { useReducedMotion } from "framer-motion";
import { Velaris } from "@/components/ui/velaris";
import { HeroParticles } from "./HeroParticles";

export const DynamicStudioBackground = ({
  colors = ["#FF4001", "#000000", "#141518", "#090A0C"],
  bg = "#000000",
}: {
  colors?: string[];
  bg?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#000000]"
    >
      {/* 1. Base Layer: Obsidian Deep Black Canvas */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* 2. WebGL Simplex-Noise Mesh Gradient with living orange/black motion */}
      {!shouldReduceMotion ? (
        <div className="absolute inset-0 opacity-85">
          <Velaris
            bg={bg}
            colors={colors}
            speed={1.8}
            grain={0.24}
            height="100%"
            className="h-full w-full"
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 75% 35%, rgba(255,64,1,0.35) 0%, rgba(245,158,11,0.18) 40%, transparent 75%)",
          }}
        />
      )}

      {/* 3. Subtle Animated Particle Field (Orange & Amber Embers) */}
      <HeroParticles />

      {/* 4. Fine Film Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* 5. Contrast Protection Mask: Soft vignette so Velaris breathes across the entire canvas while maintaining crisp typography contrast */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 35%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 65%, #000000 100%)",
        }}
      />
      {/* Subtle directional shading for typography */}
      <div
        className="hidden lg:block absolute inset-y-0 left-0 w-1/2 z-[3] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)",
        }}
      />
    </div>
  );
};
