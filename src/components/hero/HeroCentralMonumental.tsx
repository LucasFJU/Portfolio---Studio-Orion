import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Dribbble, Check, Sparkles } from "lucide-react";
import { DynamicStudioBackground } from "./DynamicStudioBackground";
import type { HeroSharedProps } from "./types";

export const HeroCentralMonumental = ({
  statProjects,
  statClients,
  statExperience,
  instagramUrl,
  behanceUrl,
  linkedinUrl,
  dribbbleUrl,
  openContactDrawer,
  isComparisonMode,
  onSelectThisVariant,
  colors,
  bg,
}: HeroSharedProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative bg-[#000000] overflow-hidden">
      {/* Comparison Mode Header Bar */}
      {isComparisonMode && (
        <div className="bg-[#0C0E13] border-y border-amber-500/25 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 relative z-30">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-bold uppercase tracking-wider">
              Conceito 02
            </span>
            <span className="text-foreground font-semibold text-[14px]">
              Centro Monumental Tipográfico
            </span>
            <span className="hidden md:inline text-muted-foreground text-[13px]">
              — Escala artística centralizada com tipografia monumental e iluminação WebGL viva
            </span>
          </div>
          {onSelectThisVariant && (
            <button
              type="button"
              onClick={onSelectThisVariant}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-amber-500 text-white text-[12px] font-medium border border-white/15 transition-colors"
            >
              <Check size={13} />
              <span>Escolher este layout</span>
            </button>
          )}
        </div>
      )}

      {/* Main Central Stage with generous clearance from navbar */}
      <div className="relative min-h-[100dvh] lg:min-h-[clamp(740px,100dvh,960px)] flex flex-col justify-center pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-36 lg:pt-40 lg:pb-20 xl:pt-44 overflow-hidden">
        {/* Dynamic Studio Background with WebGL Velaris living mesh */}
        <DynamicStudioBackground colors={colors} bg={bg} />

        {/* Central Content */}
        <div className="container-editorial relative z-20 w-full text-center max-w-4xl mx-auto py-2 sm:py-4">
          {/* Top Centered Kicker */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] sm:text-[13px] backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#FF4001]" />
            <span className="text-foreground font-medium">Disponível para novos projetos</span>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span className="text-muted-foreground">
              Brand Identity, Social Media &amp; Web Design
            </span>
          </motion.div>

          {/* Monumental Headline */}
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display font-extrabold uppercase tracking-tight text-white/95 text-balance mb-6"
            style={{
              fontSize: "clamp(38px, 6.4vw, 84px)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
            }}
          >
            Design Estratégico que <span className="text-primary">posiciona</span> &amp;{" "}
            <span className="text-primary">converte</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-muted-foreground text-[16px] sm:text-[18px] lg:text-[20px] leading-relaxed max-w-[62ch] mx-auto mb-9"
          >
            Transformo a presença da sua marca através de identidades visuais memoráveis,
            estratégia visual para redes sociais e interfaces criadas para gerar autoridade e vendas.
          </motion.p>

          {/* Center Action Buttons */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <button
              type="button"
              onClick={openContactDrawer}
              className="rounded-full bg-primary text-white px-8 py-4 text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-[#ff551a] hover:shadow-[0_0_32px_rgba(255,64,1,0.55)] transition-all group cursor-pointer"
            >
              <span>Solicitar Orçamento</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
            <Link
              to="/projetos"
              className="rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-foreground px-8 py-4 text-[15px] font-medium hover:border-white/35 hover:bg-white/[0.08] transition-all"
            >
              Ver Projetos Selecionados
            </Link>
          </motion.div>

          {/* Bottom Centered Metrics & Social Proof Bar */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            <div className="flex items-center gap-8 sm:gap-12">
              <div>
                <div className="font-display text-[26px] sm:text-[30px] font-bold text-foreground leading-none tabular-nums">
                  {statProjects}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">Projetos Concluídos</div>
              </div>
              <div className="h-8 w-[1px] bg-white/10" aria-hidden="true" />
              <div>
                <div className="font-display text-[26px] sm:text-[30px] font-bold text-foreground leading-none tabular-nums">
                  {statClients}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">Clientes Atendidos</div>
              </div>
              <div className="h-8 w-[1px] bg-white/10" aria-hidden="true" />
              <div>
                <div className="font-display text-[26px] sm:text-[30px] font-bold text-primary leading-none tabular-nums">
                  {statExperience}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">Anos de Experiência</div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-foreground hover:text-white hover:border-primary transition-all"
              >
                <Instagram size={15} />
              </a>
              <a
                href={behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Behance"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-[12px] font-bold text-foreground hover:text-white hover:border-primary transition-all"
              >
                Be
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-foreground hover:text-white hover:border-primary transition-all"
              >
                <Linkedin size={15} />
              </a>
              <a
                href={dribbbleUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dribbble"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-foreground hover:text-white hover:border-primary transition-all"
              >
                <Dribbble size={15} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
