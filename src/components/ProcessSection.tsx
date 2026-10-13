import { useRef, useState, useLayoutEffect } from "react";
import { gsap, ScrollTrigger, createEditorialScrollContext } from "@/lib/gsap";
import { ScrollRevealTitle } from "./ScrollRevealTitle";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const PROCESS_STEPS = [
  {
    num: "01",
    name: "Diagnóstico",
    summary: "Entendo o momento da marca, os objetivos do projeto e o público que precisamos alcançar.",
    deliverables: [
      "Reunião de alinhamento e levantamento de objetivos",
      "Análise do cenário atual e referências do setor",
      "Definição de escopo e cronograma de trabalho",
    ],
  },
  {
    num: "02",
    name: "Direção criativa",
    summary: "Defino caminhos visuais, referências, tipografia, paleta e estrutura da solução.",
    deliverables: [
      "Conceito visual e território criativo",
      "Seleção tipográfica, paleta de cores e proporções",
      "Arquitetura de conteúdo e estrutura de navegação",
    ],
  },
  {
    num: "03",
    name: "Desenvolvimento",
    summary: "Construo as peças, o sistema visual ou a interface digital com rodadas organizadas de ajuste.",
    deliverables: [
      "Criação das peças, telas ou sistema de identidade",
      "Apresentação aplicada em contextos reais de uso",
      "Rodadas de refinamento direto comigo",
    ],
  },
  {
    num: "04",
    name: "Entrega",
    summary: "Finalizo os arquivos abertos, guias de uso ou publicação da página pronta para operar.",
    deliverables: [
      "Arquivos finais organizados para digital e impresso",
      "Guia prático de aplicação e matrizes editáveis",
      "Publicação ou handoff técnico documentado",
    ],
  },
];

interface ProcessSectionProps {
  detailed?: boolean;
  sectionNumber?: string;
}

const ProcessSection = ({ detailed = false, sectionNumber = "04." }: ProcessSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const mm = createEditorialScrollContext(({ isDesktopMotion }) => {
      const steps = stepsRef.current.filter(Boolean) as HTMLDivElement[];
      if (!steps.length) return;

      if (progressFillRef.current) {
        gsap.fromTo(
          progressFillRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              end: "bottom 45%",
              scrub: 0.35,
            },
          }
        );
      }

      steps.forEach((stepEl, index) => {
        if (isDesktopMotion) {
          gsap.fromTo(
            stepEl,
            { opacity: 0.35, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: stepEl,
                start: "top 82%",
                end: "top 45%",
                scrub: 0.25,
              },
            }
          );
        }

        ScrollTrigger.create({
          trigger: stepEl,
          start: "top 65%",
          end: "bottom 50%",
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        });
      });
    }, sectionRef);

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#141518] sec-pad border-b border-border"
      aria-labelledby="process-heading"
    >
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Sticky Title on Desktop with ScrollReveal */}
          <div className="lg:col-span-5 lg:sticky lg:top-[110px]">
            <ScrollReveal delay={0.06} yOffset={20}>
              <div className="section-label mb-3">
                <span className="label-num">{sectionNumber}</span> Processo
              </div>

              <div className="mb-4">
                <ScrollRevealTitle
                  as="h2"
                  id="process-heading"
                  text="Do primeiro contato à entrega."
                  className="font-display font-medium"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.08 }}
                />
              </div>

              <p className="text-muted-foreground text-[16px] leading-[1.6] max-w-[38ch] mb-6">
                Quatro etapas claras para conduzir o projeto com organização e acompanhamento direto.
              </p>

              {/* Step indicator pills */}
              <div className="hidden lg:flex items-center gap-2 pt-2">
                {PROCESS_STEPS.map((step, idx) => (
                  <div
                    key={step.num}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === idx ? "w-8 bg-primary" : "w-2 bg-white/15"
                    }`}
                  />
                ))}
                <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
                  ETAPA 0{activeStep + 1} / 0{PROCESS_STEPS.length}
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Four Steps with animated vertical progress line */}
          <div className="lg:col-span-7 relative pl-5 sm:pl-7">
            {/* Vertical progress rail */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-border overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <div
                ref={progressFillRef}
                className="w-full h-full bg-primary origin-top scale-y-0"
              />
            </div>

            <div className="divide-y divide-border border-t border-border">
              {PROCESS_STEPS.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <div
                    key={step.num}
                    ref={(el) => {
                      stepsRef.current[index] = el;
                    }}
                    className="py-8 md:py-10 transition-colors duration-300"
                  >
                    <div className="flex items-baseline gap-4 mb-3">
                      <span
                        className={`font-mono text-[13px] font-medium tabular-nums transition-colors duration-300 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.num}
                      </span>
                      <h3
                        className={`font-display text-[22px] md:text-[26px] font-medium transition-colors duration-300 ${
                          isActive ? "text-foreground" : "text-foreground/85"
                        }`}
                      >
                        {step.name}
                      </h3>
                    </div>

                    <p className="pl-8 text-muted-foreground text-[16px] leading-[1.65] max-w-[52ch]">
                      {step.summary}
                    </p>

                    {detailed && (
                      <ul className="pl-8 mt-5 space-y-2 text-[14px] text-foreground/85">
                        {step.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="text-primary font-bold" aria-hidden="true">
                              ·
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
