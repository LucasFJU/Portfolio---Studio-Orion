import { useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useContactDrawer } from "./ContactDrawer";
import { Velaris } from "@/components/ui/velaris";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface CTASectionProps {
  embedded?: boolean;
}

const CTASection = ({ embedded = false }: CTASectionProps) => {
  const { openContactDrawer } = useContactDrawer();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 35 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  };

  const cardContent = (
    <div className="container-editorial relative z-10">
      <ScrollReveal scale={0.98} yOffset={24}>
        {/* Outer ambient halo behind the CTA card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-3xl opacity-60 blur-3xl animate-cta-orb-primary"
          style={{
            background:
              "radial-gradient(55% 65% at 75% 35%, rgba(255, 64, 1, 0.3), rgba(255, 115, 0, 0.12) 55%, transparent 80%)",
          }}
        />

        {/* Animated illuminated border wrapper */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group/cta relative rounded-2xl p-[1px] overflow-hidden shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)]"
        >
          {/* Rotating conic border light beam */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[120%] animate-cta-border-spin opacity-75 group-hover/cta:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(255, 64, 1, 0.45) 315deg, rgba(255, 160, 110, 0.95) 348deg, rgba(255, 64, 1, 0.65) 360deg)",
            }}
          />

          {/* Base subtle border fallback */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.09]"
          />

          {/* Card Interior */}
          <div className="relative rounded-[15px] bg-[#121317] p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Living WebGL Velaris Shader Mesh Background */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-75">
              <Velaris
                bg="#090A0C"
                colors={["#FF4001", "#000000", "#141518", "#090A0C"]}
                speed={1.6}
                grain={0.25}
                height="100%"
                className="h-full w-full"
              />
            </div>

            {/* Top horizon sweeping light beam */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-0 h-[1px] overflow-hidden z-[2]"
            >
              <div
                className="w-1/2 h-full animate-cta-beam"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 64, 1, 0.85) 45%, rgba(255, 200, 160, 1) 50%, rgba(255, 64, 1, 0.85) 55%, transparent 100%)",
                }}
              />
            </div>

            {/* Interactive mouse-tracking spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-[2]"
              style={{
                opacity: isHovered ? 1 : 0.45,
                background: `radial-gradient(520px circle at ${cursorPos.x}% ${cursorPos.y}%, rgba(255, 64, 1, 0.16), rgba(255, 120, 50, 0.05) 42%, transparent 72%)`,
              }}
            />

            {/* Subtle architectural light grid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage:
                  "radial-gradient(ellipse 80% 75% at 75% 35%, #000 20%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 75% at 75% 35%, #000 20%, transparent 80%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2.5 text-[13px] font-medium text-foreground/85 mb-4 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_12px_#FF4001]" />
                  </span>
                  <span>Agenda aberta para novos projetos</span>
                </div>

                <h2
                  className="font-display text-foreground font-medium mb-4"
                  style={{ fontSize: "clamp(28px, 4.2vw, 48px)", lineHeight: 1.08 }}
                >
                  Vamos conversar sobre o seu projeto?
                </h2>

                <p className="text-muted-foreground text-[16px] md:text-[18px] leading-[1.6] max-w-[52ch]">
                  Conte um pouco sobre a sua empresa e o que você precisa desenvolver. Retorno com uma
                  proposta clara de escopo, prazos e investimento.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => openContactDrawer()}
                  className="btn-primary group relative overflow-hidden shadow-[0_0_32px_rgba(255,64,1,0.38)] hover:shadow-[0_0_44px_rgba(255,64,1,0.6)] transition-all duration-300"
                >
                  <span>Solicitar orçamento</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <Link
                  to="/contato"
                  className="btn-ghost border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-sm"
                >
                  Ir para a página de contato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );

  if (embedded) {
    return (
      <div className="relative z-10 py-10 sm:py-14 lg:py-16">
        {cardContent}
      </div>
    );
  }

  return (
    <section className="relative bg-[#07080A] py-20 sm:py-24 lg:py-28 overflow-hidden">
      {/* Ambient Lighting Continuation from FAQ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-32 w-[600px] sm:w-[800px] h-[500px] sm:h-[650px] rounded-full opacity-65 sm:opacity-75 blur-[120px] mix-blend-screen animate-ambient-left"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, #DC2626 0%, #FF3D00 30%, #FF5A1F 55%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-24 w-[520px] sm:w-[700px] h-[450px] sm:h-[600px] rounded-full opacity-55 sm:opacity-65 blur-[110px] mix-blend-screen animate-ambient-right"
        style={{
          background:
            "radial-gradient(circle at 60% 60%, #E87A5D 0%, #D96A4C 35%, rgba(217, 106, 76, 0.3) 60%, transparent 75%)",
        }}
      />
      {cardContent}
    </section>
  );
};

export default CTASection;
