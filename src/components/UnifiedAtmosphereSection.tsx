import FAQSection from "./FAQSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

interface UnifiedAtmosphereSectionProps {
  sectionNumber?: string;
}

/**
 * UnifiedAtmosphereSection
 * 
 * Unifies "Dúvidas Frequentes" (FAQ), "CTA" (Vamos conversar) and "Footer"
 * into a single continuous atmospheric canvas matching the exact reference screenshot:
 * - Rich, saturated crimson/ruby red glow anchored at the top-left edge
 * - Soft, smoky warm dusty-peach/terracotta glow anchored at the top-right edge
 * - Seamlessly falls off into solid velvety obsidian black across CTA and Footer
 */
export const UnifiedAtmosphereSection = ({
  sectionNumber = "07.",
}: UnifiedAtmosphereSectionProps) => {
  return (
    <div className="relative overflow-hidden bg-[#07080A] border-t border-white/[0.12]">
      {/* ------------------------------------------------------------- */}
      {/* EXACT REFERENCE LIGHTING ATMOSPHERE                           */}
      {/* Anchored exclusively at the top, radiating downward to black */}
      {/* ------------------------------------------------------------- */}

      {/* Top Hairline with refined micro-accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1px] z-[3]"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(195, 26, 20, 0.7) 25%, rgba(220, 38, 28, 0.8) 50%, rgba(175, 88, 76, 0.6) 75%, transparent 95%)",
        }}
      />

      {/* 1. Top-Left Pure Crimson / Ruby Red Glow (Anchored to top-left edge) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-[55vw] max-w-[960px] h-[720px] lg:h-[860px]"
        style={{
          background:
            "radial-gradient(ellipse 95% 85% at 0% 0%, rgba(195, 26, 20, 0.95) 0%, rgba(160, 20, 15, 0.76) 26%, rgba(115, 14, 10, 0.44) 48%, rgba(40, 5, 5, 0.12) 70%, transparent 84%)",
        }}
      />

      {/* 2. Top-Right Soft Dusty Peach / Terracotta Ambient Glow (Anchored to top-right edge) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[50vw] max-w-[860px] h-[640px] lg:h-[780px]"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 100% 0%, rgba(175, 88, 76, 0.65) 0%, rgba(142, 68, 58, 0.42) 26%, rgba(98, 44, 38, 0.18) 50%, transparent 72%)",
        }}
      />

      {/* 3. Smooth Depth Vignette Mask (Flows naturally into pure velvety black) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(7, 8, 10, 0.05) 0%, rgba(7, 8, 10, 0.18) 320px, rgba(7, 8, 10, 0.65) 680px, #07080A 880px, #07080A 100%)",
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* SEAMLESS EMBEDDED CONTENT (One Single Continuous Flow)        */}
      {/* ------------------------------------------------------------- */}
      <FAQSection sectionNumber={sectionNumber} embedded />
      <CTASection embedded />
      <Footer embedded />
    </div>
  );
};

export default UnifiedAtmosphereSection;
