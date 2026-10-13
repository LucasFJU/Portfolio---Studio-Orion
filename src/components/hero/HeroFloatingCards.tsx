import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Dribbble, Check, Sparkles, TrendingUp } from "lucide-react";
import demoBrandIdentity from "@/assets/demo-brand-identity.jpg";
import demoSocialMedia from "@/assets/demo-social-media.jpg";
import { DynamicStudioBackground } from "./DynamicStudioBackground";
import type { HeroSharedProps } from "./types";

export const HeroFloatingCards = ({
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
        <div className="bg-[#0C0E13] border-y border-emerald-500/25 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 relative z-30">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold uppercase tracking-wider">
              Conceito 03
            </span>
            <span className="text-foreground font-semibold text-[14px]">
              Composição Dinâmica com Cards Flutuantes
            </span>
            <span className="hidden md:inline text-muted-foreground text-[13px]">
              — Retrato acompanhado de cards interativos de preview de projetos e métricas vivas
            </span>
          </div>
          {onSelectThisVariant && (
            <button
              type="button"
              onClick={onSelectThisVariant}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500 text-white text-[12px] font-medium border border-white/15 transition-colors"
            >
              <Check size={13} />
              <span>Escolher este layout</span>
            </button>
          )}
        </div>
      )}

      {/* Main Hero Stage */}
      <div className="relative min-h-[calc(100vh-64px)] lg:min-h-[clamp(640px,calc(100vh-60px),920px)] flex items-center pt-8 pb-12 lg:pt-10 lg:pb-12 overflow-hidden">
        {/* Dynamic Studio Background with WebGL Velaris living mesh */}
        <DynamicStudioBackground colors={colors} bg={bg} />

        {/* Content Container (Two Columns Grid on Desktop) */}
        <div className="container-editorial relative z-20 w-full py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (Editorial Information) */}
            <div className="lg:col-span-6 xl:col-span-7">
              {/* Kicker */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-wrap items-center gap-2.5 text-[12px] sm:text-[13px] xl:text-[14px] mb-4 lg:mb-5"
              >
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-[0_0_10px_#FF4001]" />
                <span className="text-foreground font-semibold">Disponível para novos projetos</span>
                <span className="text-muted-foreground" aria-hidden="true">
                  ·
                </span>
                <span className="text-muted-foreground">
                  Brand Identity, Social Media &amp; Web Design
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06 }}
                className="font-display font-bold text-foreground tracking-[-0.03em] mb-4 lg:mb-5 text-balance"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 64px)",
                  lineHeight: 1.05,
                }}
              >
                Design estratégico
                <br />
                que <span className="text-primary">posiciona</span> sua
                <br />
                marca e <span className="text-primary">converte</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="text-muted-foreground text-[15px] sm:text-[16px] xl:text-[18px] leading-[1.6] max-w-[46ch] mb-7 lg:mb-8"
              >
                Ajudo empresas a vender mais com identidades visuais, social media e sites que geram
                autoridade e atraem clientes todos os dias.
              </motion.p>

              {/* Mobile Portrait — Card com cantos suaves logo abaixo da chamada */}
              <div className="lg:hidden relative mx-auto w-full max-w-[360px] mb-7 rounded-2xl overflow-hidden border border-white/10 bg-[#121317] shadow-2xl">
                <picture>
                  <source srcSet={lucasHeroWebp} type="image/webp" />
                  <img
                    src={lucasHeroPng}
                    alt="Lucas Evangelista"
                    width={500}
                    height={580}
                    className="w-full h-auto object-cover object-top"
                  />
                </picture>
                {/* Floating preview badge inside mobile card */}
                <div className="absolute inset-x-2.5 bottom-2.5 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={demoBrandIdentity}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-white/20"
                    />
                    <div>
                      <div className="text-[12px] font-bold text-white leading-tight">
                        Identidade Visual &amp; Estratégia
                      </div>
                      <div className="text-[10px] text-primary flex items-center gap-1">
                        <Sparkles size={10} /> Case em Destaque
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white px-2 py-0.5 rounded bg-white/10">
                    {statProjects}
                  </span>
                </div>
              </div>

              {/* Two Pill Buttons */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="flex flex-wrap items-center gap-3.5 mb-8 lg:mb-10"
              >
                <button
                  type="button"
                  onClick={openContactDrawer}
                  className="rounded-full bg-primary text-white px-6 sm:px-7 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-semibold inline-flex items-center gap-2 transition-all duration-200 hover:bg-[#ff551a] hover:shadow-[0_0_28px_rgba(255,64,1,0.45)] group"
                >
                  <span>Solicitar Orçamento</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <Link
                  to="/projetos"
                  className="rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-foreground px-6 sm:px-7 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-medium inline-flex items-center justify-center transition-all duration-200 hover:border-white/35 hover:bg-white/[0.08]"
                >
                  Ver Projetos
                </Link>
              </motion.div>

              {/* Metrics + Social Icons Bar */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="pt-5 lg:pt-6 border-t border-white/[0.1] flex flex-wrap items-center gap-y-5 gap-x-7"
              >
                <div className="flex items-center gap-5 sm:gap-7">
                  <div>
                    <div className="font-display text-[22px] sm:text-[25px] font-bold text-foreground leading-none tabular-nums">
                      {statProjects}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-1">Projetos</div>
                  </div>

                  <div className="h-7 w-[1px] bg-white/10" aria-hidden="true" />

                  <div>
                    <div className="font-display text-[22px] sm:text-[25px] font-bold text-foreground leading-none tabular-nums">
                      {statClients}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-1">Clientes</div>
                  </div>

                  <div className="h-7 w-[1px] bg-white/10" aria-hidden="true" />

                  <div>
                    <div className="font-display text-[22px] sm:text-[25px] font-bold text-primary leading-none tabular-nums">
                      {statExperience}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-1">Experiência</div>
                  </div>
                </div>

                {/* Social Circle Icons */}
                <div className="flex items-center gap-2 sm:ml-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                  >
                    <Instagram size={15} />
                  </a>
                  <a
                    href={behanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Behance"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-[12px] font-bold text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                  >
                    Be
                  </a>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                  >
                    <Linkedin size={15} />
                  </a>
                  <a
                    href={dribbbleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dribbble"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                  >
                    <Dribbble size={15} />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Floating Cards Stage */}
            <div className="hidden lg:block lg:col-span-6 xl:col-span-5 relative">
              <div className="relative mx-auto max-w-[460px] h-[520px] xl:h-[580px] flex items-center justify-center">
                {/* Central Glassmorphic Studio Easel Backing */}
                <div className="w-[320px] h-[400px] rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-between p-6 overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>PORTFOLIO SELECTION</span>
                    <span className="text-primary font-bold">2026</span>
                  </div>
                  <div className="my-auto text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mb-3">
                      <Sparkles size={24} />
                    </div>
                    <div className="font-display font-bold text-foreground text-[18px]">
                      Estúdio Criativo
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-1">
                      Identidades visuais, redes sociais e experiências digitais
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{statProjects} Projetos</span>
                    <span className="text-primary font-semibold">{statExperience}</span>
                  </div>
                </div>

                {/* Floating Card 1: Top Left — Project Preview Card */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -30, y: -20 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          x: 0,
                          y: [0, -10, 0],
                        }
                  }
                  transition={{
                    opacity: { duration: 0.6, delay: 0.2 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="absolute top-8 -left-8 xl:-left-12 z-30 p-3.5 rounded-2xl bg-[#0D0F14]/90 border border-white/15 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.7)] max-w-[240px]"
                >
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-primary">
                    <Sparkles size={11} /> Case em Destaque
                  </div>
                  <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2.5 border border-white/10">
                    <img
                      src={demoBrandIdentity}
                      alt="Identidade Visual"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white">
                      Identidade Visual
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Posicionamento</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp size={12} /> +120%
                    </span>
                  </div>
                </motion.div>

                {/* Floating Card 2: Bottom Right — High Performance Badge */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 30, y: 20 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          x: 0,
                          y: [0, 8, 0],
                        }
                  }
                  transition={{
                    opacity: { duration: 0.6, delay: 0.35 },
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  }}
                  className="absolute bottom-16 -right-6 xl:-right-10 z-30 p-4 rounded-2xl bg-[#0D0F14]/90 border border-white/15 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.7)] min-w-[210px]"
                >
                  <div className="text-[11px] font-mono text-muted-foreground uppercase mb-1">
                    Histórico Comprovado
                  </div>
                  <div className="font-display text-[26px] font-extrabold text-foreground tabular-nums leading-tight">
                    {statProjects}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    entregas de alto impacto
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/80">Satisfação:</span>
                    <span className="text-primary font-bold">100% no prazo</span>
                  </div>
                </motion.div>

                {/* Floating Card 3: Middle Right — Social Media & UI Badge */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          scale: 1,
                          y: [0, -6, 0],
                        }
                  }
                  transition={{
                    opacity: { duration: 0.6, delay: 0.5 },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
                  }}
                  className="absolute top-1/2 -right-8 xl:-right-12 z-20 p-2.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-xl"
                >
                  <img
                    src={demoSocialMedia}
                    alt="Social Media Case"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight">
                      Social Media &amp; UI
                    </div>
                    <div className="text-[10px] text-muted-foreground">Engajamento &amp; Vendas</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
