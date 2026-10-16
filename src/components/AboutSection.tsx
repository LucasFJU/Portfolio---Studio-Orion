import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import AboutPortrait from "./AboutPortrait";
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

const AboutSection = ({ sectionNumber = "03." }: { sectionNumber?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.55"],
  });

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
    <section className="bg-background sec-pad overflow-hidden">
      <div className="container-editorial">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Centered Orbital Portrait */}
          <div
            className="order-2 lg:order-1 relative lg:col-span-6 flex flex-col items-center lg:items-start lg:self-stretch lg:justify-end"
          >
            <AboutPortrait className="orion-home-portrait mx-auto max-w-[576px] h-[clamp(420px,110vw,600px)] lg:h-[clamp(560px,54vw,760px)]" />

          </div>

          {/* Editorial Bio + Metrics */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col justify-between lg:pt-6">
            <div className="section-label mb-6 lg:mb-0 lg:absolute lg:left-0 lg:top-12 z-20 self-start">
              <span className="label-num">{sectionNumber}</span> Sobre
            </div>
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
