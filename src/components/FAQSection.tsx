import { useState } from "react";
import { Plus, Minus, HelpCircle, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScrollRevealTitle } from "./ScrollRevealTitle";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const faqs = [
  {
    q: "Como funciona o pedido de orçamento?",
    a: "Você preenche o formulário indicando o que precisa criar ou melhorar. Analiso as informações e entro em contato com uma proposta detalhando escopo, prazos e condições de pagamento.",
  },
  {
    q: "Posso contratar mais de uma frente no mesmo projeto?",
    a: "Sim. É comum combinarmos a criação da identidade visual com templates para redes sociais ou com o desenvolvimento do site institucional para que a marca já seja lançada de forma completa.",
  },
  {
    q: "Como funcionam as revisões durante o projeto?",
    a: "Trabalhamos em quatro etapas (Diagnóstico, Direção criativa, Desenvolvimento e Entrega). Cada fase é apresentada e validada com você antes de avançarmos, incluindo rodadas de ajustes previstas em contrato.",
  },
  {
    q: "Em quais formatos recebo os arquivos finais?",
    a: "Na entrega de identidade visual, você recebe todos os arquivos abertos e exportados (SVG, PDF, PNG, EPS) junto ao guia de uso. Em redes sociais e sites, entrego as matrizes organizadas no Figma e a página publicada.",
  },
];

interface FAQSectionProps {
  sectionNumber?: string;
  embedded?: boolean;
}

const FAQSection = ({ sectionNumber = "07.", embedded = false }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div className="container-editorial relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Heading & Context */}
          {/* Left Column: Heading and Context with ScrollReveal */}
          <div className="lg:col-span-5">
            <ScrollReveal delay={0.05} yOffset={20}>
              <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.14em] text-foreground/80 font-semibold">
                  {sectionNumber} Dúvidas frequentes
                </span>
              </div>

              <div className="mb-4">
                <ScrollRevealTitle
                  as="h2"
                  id="faq-heading"
                  text="Perguntas comuns sobre o trabalho."
                  className="font-display font-medium text-foreground text-balance"
                  style={{ fontSize: "clamp(28px, 3.8vw, 44px)", lineHeight: 1.1 }}
                />
              </div>

              <p className="text-muted-foreground text-[16px] leading-[1.65] max-w-[44ch] mb-6">
                Respostas diretas sobre prazos, entregáveis, metodologia e funcionamento dos projetos de design e interfaces.
              </p>

              <div className="hidden lg:flex items-center gap-2.5 text-[12px] text-muted-foreground/80 font-mono">
                <Sparkles size={14} className="text-primary" />
                <span>Transparência em todas as fases do processo</span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Cascading Frosted Glass FAQ Cards */}
          <StaggerContainer
            staggerDelay={0.07}
            className="lg:col-span-7 space-y-3.5"
          >
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <StaggerItem key={faq.q}>
                  <div
                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
                      isOpen
                        ? "bg-black/60 border-primary/45 shadow-[0_12px_36px_rgba(255,64,1,0.12)] ring-1 ring-primary/20"
                        : "bg-black/35 border-white/[0.09] hover:bg-white/[0.03] hover:border-white/[0.18]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl cursor-pointer"
                    >
                      <span className="font-display text-[17px] sm:text-[19px] font-medium text-foreground group-hover:text-white transition-colors pr-2">
                        {faq.q}
                      </span>
                      <span
                        className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
                          isOpen
                            ? "bg-primary text-white border-primary"
                            : "border-white/15 bg-white/[0.04] text-muted-foreground group-hover:border-primary group-hover:text-primary"
                        }`}
                        aria-hidden="true"
                      >
                        {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-white/[0.06]">
                            <p className="pt-3.5 text-muted-foreground text-[15px] sm:text-[16px] leading-[1.7] pr-4">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

        </div>
      </div>
  );

  if (embedded) {
    return (
      <div
        className="relative z-10 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14"
        aria-labelledby="faq-heading"
      >
        {content}
      </div>
    );
  }

  return (
    <section
      className="relative bg-[#07080A] sec-pad overflow-hidden border-t border-white/[0.08]"
      aria-labelledby="faq-heading"
    >
      {/* 1. Dramatic Crimson / Fire Red Light Aura (Top-Left) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 -left-36 sm:-left-44 w-[680px] sm:w-[920px] lg:w-[1180px] h-[600px] sm:h-[780px] lg:h-[960px] rounded-full opacity-85 sm:opacity-90 blur-[110px] sm:blur-[140px] mix-blend-screen animate-ambient-left"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #DC2626 0%, #FF3800 26%, #FF5A1F 46%, rgba(255, 64, 1, 0.45) 65%, transparent 80%)",
        }}
      />

      {/* 2. Soft Warm Peach / Apricot / Amber Light Aura (Top-Right) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-28 sm:-right-36 w-[520px] sm:w-[740px] lg:w-[940px] h-[480px] sm:h-[660px] lg:h-[840px] rounded-full opacity-70 sm:opacity-80 blur-[100px] sm:blur-[130px] mix-blend-screen animate-ambient-right"
        style={{
          background:
            "radial-gradient(circle at 65% 30%, #E87A5D 0%, #D96A4C 28%, rgba(217, 106, 76, 0.42) 52%, transparent 75%)",
        }}
      />

      {/* 3. Central Ambient Fill & Vignette Mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(7, 8, 10, 0.12) 0%, rgba(7, 8, 10, 0.45) 45%, #07080A 100%)",
        }}
      />

      {/* 4. Top subtle accent light hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1px] z-[2]"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(220, 38, 38, 0.55) 25%, rgba(255, 64, 1, 0.65) 50%, rgba(232, 122, 93, 0.45) 75%, transparent 95%)",
        }}
      />

      {content}
    </section>
  );
};

export default FAQSection;
