import { useRef, useState, type MouseEvent } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import lucasHeroWebp from "@/assets/lucas-hero.webp";
import lucasHeroPng from "@/assets/lucas-hero.png";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const Word = ({
  children,
  progress,
  range,
  shouldReduceMotion,
}: {
  children: string;
  progress: any;
  range: [number, number];
  shouldReduceMotion: boolean | null;
}) => {
  const opacity = useTransform(progress, range, [0.22, 1]);
  if (shouldReduceMotion) {
    return <span className="inline-block mr-[0.28em] text-foreground">{children}</span>;
  }
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em] text-foreground">
      {children}
    </motion.span>
  );
};

const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portraitStageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.55"],
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = portraitStageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
  };

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback: string) => {
    const val = settings?.find((s: any) => s.key === key)?.value;
    return val && val.trim() ? val : fallback;
  };

  const statement =
    "Acredito que um bom projeto de design une clareza e intenção — construindo marcas reconhecíveis, materiais consistentes e páginas que facilitam a decisão do cliente.";
  const words = statement.split(" ");

  const metrics = [
    { value: getSetting("stat_projects", "2.500+"), label: "Projetos entregues" },
    { value: getSetting("stat_clients", "500+"), label: "Marcas atendidas" },
    { value: getSetting("stat_experience", "13+ anos"), label: "Anos de atuação" },
  ];

  return (
    <section className="bg-background sec-pad border-b border-border overflow-hidden">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Centered Orbital Portrait */}
          <div
            ref={portraitStageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="lg:col-span-6 flex flex-col items-center lg:items-start"
          >
            <div className="section-label mb-3 self-start">
              <span className="label-num">03.</span> Sobre
            </div>

            <div className="relative w-[330px] sm:w-[440px] lg:w-[480px] h-[390px] sm:h-[500px] lg:h-[540px] mx-auto flex items-center justify-center">
              {/* Warm ambient aura */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] rounded-full blur-[85px] opacity-65 transition-transform duration-300 ease-out"
                style={{
                  transform: `translate3d(${tilt.x * 18}px, ${tilt.y * 18}px, 0)`,
                  background:
                    "radial-gradient(circle, rgba(255,64,1,0.38) 0%, rgba(255,115,0,0.10) 55%, transparent 75%)",
                }}
              />

              {/* Outer Dashed Orbital Circle — Centered */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto w-[300px] sm:w-[400px] lg:w-[430px] h-[300px] sm:h-[400px] lg:h-[430px] rounded-full border border-dashed border-primary/30 animate-[spin_46s_linear_infinite]"
              />

              {/* Inner Solid Orbital Circle — Centered */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto w-[250px] sm:w-[340px] lg:w-[365px] h-[250px] sm:h-[340px] lg:h-[365px] rounded-full border border-white/[0.10]"
              />

              {/* Cutout Portrait Optically Centered on the Circle */}
              <div
                className="relative z-10 w-full h-full flex items-end justify-center overflow-hidden rounded-b-[200px] transition-transform duration-300 ease-out"
                style={{
                  transform: `translate3d(${tilt.x * 10}px, ${tilt.y * 8}px, 0)`,
                  maskImage:
                    "radial-gradient(ellipse 92% 95% at 50% 45%, #000 68%, rgba(0,0,0,0.5) 86%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 92% 95% at 50% 45%, #000 68%, rgba(0,0,0,0.5) 86%, transparent 100%)",
                }}
              >
                <picture className="flex justify-center">
                  <source srcSet={lucasHeroWebp} type="image/webp" />
                  <img
                    src={lucasHeroPng}
                    alt="Lucas Evangelista"
                    width={580}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="w-auto h-[370px] sm:h-[470px] lg:h-[515px] max-w-none object-contain -translate-x-[7%] sm:-translate-x-[8%] drop-shadow-[0_24px_48px_rgba(0,0,0,0.85)]"
                  />
                </picture>
              </div>
            </div>

            {/* Floating badge */}
            <ScrollReveal delay={0.2} yOffset={16}>
              <div className="relative z-20 -mt-5 mx-auto w-full max-w-[330px] rounded-full border border-white/15 bg-[#141518]/95 backdrop-blur-md px-5 py-3 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
                <div>
                  <div className="font-display text-[15px] font-semibold text-foreground leading-tight">
                    Lucas Evangelista
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    Designer &amp; Diretor Criativo
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-primary bg-primary/10 border border-primary/25 rounded-full px-2.5 py-0.5">
                  13+ ANOS
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Editorial Bio + Metrics */}
          <div className="lg:col-span-6 flex flex-col justify-between lg:pt-6">
            <div ref={containerRef} className="mb-8">
              <h2
                className="font-display font-medium tracking-[-0.025em] leading-[1.16] flex flex-wrap"
                style={{ fontSize: "clamp(24px, 3.2vw, 38px)" }}
              >
                {words.map((word, i) => {
                  const start = i / words.length;
                  const end = start + 1 / words.length;
                  return (
                    <Word
                      key={i}
                      progress={scrollYProgress}
                      range={[start, end]}
                      shouldReduceMotion={shouldReduceMotion}
                    >
                      {word}
                    </Word>
                  );
                })}
              </h2>
            </div>

            <ScrollReveal delay={0.1} yOffset={20}>
              <div className="space-y-4 text-muted-foreground text-[16px] md:text-[17px] leading-[1.68] max-w-[60ch] mb-10">
                <p>
                  Sou designer com mais de 13 anos de experiência criando identidades visuais,
                  conteúdo estratégico para redes sociais e interfaces digitais para empresas que
                  buscam fortalecer sua presença no mercado.
                </p>
                <p>
                  Cada projeto é conduzido diretamente por mim, do diagnóstico inicial à entrega
                  final, garantindo alinhamento próximo e atenção aos detalhes em todas as etapas.
                </p>
              </div>
            </ScrollReveal>

            {/* Metrics Strip with cascading stagger */}
            <StaggerContainer
              staggerDelay={0.12}
              className="grid grid-cols-3 gap-6 py-7 border-y border-border mb-9"
            >
              {metrics.map((m) => (
                <StaggerItem key={m.label}>
                  <div className="font-display text-[26px] sm:text-[34px] font-semibold text-foreground tracking-tight leading-none mb-2 tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-[13px] text-muted-foreground leading-snug">{m.label}</div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal delay={0.2} yOffset={16}>
              <div>
                <Link to="/sobre" className="btn-ghost group">
                  <span>Conhecer minha trajetória</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
