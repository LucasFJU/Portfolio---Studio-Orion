import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Dribbble,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { HeroBackgroundStage } from "./HeroBackgroundStage";
import type { HeroSharedProps } from "./types";
import {
  DEFAULT_HERO_CONFIG,
  resolveHeroImage,
  type HeroConfig,
  type CustomHeroElement,
} from "@/config/heroConfig";

export interface HeroEditorialProps extends HeroSharedProps {
  previewDevice?: "desktop" | "tablet" | "mobile";
}

export const HeroSplitEditorial: React.FC<HeroEditorialProps> = ({
  statProjects: fallbackStatProjects,
  statClients: fallbackStatClients,
  statExperience: fallbackStatExperience,
  instagramUrl: fallbackInstagram,
  behanceUrl: fallbackBehance,
  linkedinUrl: fallbackLinkedin,
  dribbbleUrl: fallbackDribbble,
  openContactDrawer,
  colors,
  bg,
  config: inputConfig,
  previewDevice = "desktop",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const cfg: HeroConfig = inputConfig || DEFAULT_HERO_CONFIG;

  const isMobileView = previewDevice === "mobile";
  const mobileOverridesActive = cfg.mobileOverrides?.enabled;

  // Resolve values with config taking precedence over legacy props
  const projectsCount = cfg.metrics.statProjects || fallbackStatProjects;
  const clientsCount = cfg.metrics.statClients || fallbackStatClients;
  const experienceCount = cfg.metrics.statExperience || fallbackStatExperience;

  const instagramLink = cfg.social.customInstagram || fallbackInstagram;
  const behanceLink = cfg.social.customBehance || fallbackBehance;
  const linkedinLink = cfg.social.customLinkedin || fallbackLinkedin;
  const dribbbleLink = cfg.social.customDribbble || fallbackDribbble;

  const resolvedImage = resolveHeroImage(cfg.media);

  // Check layer visibility
  const isLayerVisible = (layerId: string) => {
    const layer = cfg.layers?.find((l) => l.id === layerId);
    if (!layer) return true;
    if (isMobileView) return layer.visibleMobile;
    return layer.visibleDesktop;
  };

  // Mobile Overrides resolution
  const effectiveTextAlignment =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.textAlignment
      ? cfg.mobileOverrides.textAlignment
      : cfg.layout.textAlignment;

  const effectiveHeadlineFontSize =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.headlineFontSize
      ? cfg.mobileOverrides.headlineFontSize
      : cfg.typography.headlineFontSize;

  const effectiveAspectRatio =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.imageAspectRatio
      ? cfg.mobileOverrides.imageAspectRatio
      : cfg.media.aspectRatio;

  const isKickerHidden =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.hideKicker;
  const isMetricsHidden =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.hideMetrics;
  const isSocialHidden =
    isMobileView && mobileOverridesActive && cfg.mobileOverrides?.hideSocial;

  // Layout & positioning classes
  const isCentered = cfg.layout.columnDistribution === "centered";
  const isInverted = cfg.layout.columnDistribution === "inverted";
  const is66 = cfg.layout.columnDistribution === "6-6";

  let leftColSpan = "lg:col-span-7 xl:col-span-7";
  let rightColSpan = "lg:col-span-5 xl:col-span-5";

  if (isCentered) {
    leftColSpan = "lg:col-span-12 text-center max-w-4xl mx-auto flex flex-col items-center";
    rightColSpan = "lg:col-span-12 max-w-2xl mx-auto w-full";
  } else if (is66) {
    leftColSpan = "lg:col-span-6 xl:col-span-6";
    rightColSpan = "lg:col-span-6 xl:col-span-6";
  } else if (isInverted) {
    leftColSpan = "lg:col-span-7 xl:col-span-7 order-2 lg:order-2";
    rightColSpan = "lg:col-span-5 xl:col-span-5 order-1 lg:order-1";
  }

  // Padding classes
  const paddingClass =
    cfg.layout.paddingY === "compact"
      ? "pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 lg:pt-36 lg:pb-16"
      : cfg.layout.paddingY === "spacious"
      ? "pt-36 pb-24 sm:pt-40 sm:pb-28 md:pt-44 lg:pt-48 lg:pb-28 xl:pt-52"
      : "pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-36 lg:pt-40 lg:pb-20 xl:pt-44";

  // Headline font size
  const headlineClamp =
    effectiveHeadlineFontSize === "huge"
      ? "clamp(42px, 5.5vw, 84px)"
      : effectiveHeadlineFontSize === "compact"
      ? "clamp(30px, 3.8vw, 54px)"
      : "clamp(36px, 4.8vw, 70px)";

  // Aspect ratio class
  const aspectClass =
    effectiveAspectRatio === "1/1"
      ? "aspect-square"
      : effectiveAspectRatio === "4/3"
      ? "aspect-[4/3]"
      : effectiveAspectRatio === "3/4"
      ? "aspect-[3/4]"
      : effectiveAspectRatio === "4/5"
      ? "aspect-[4/5]"
      : effectiveAspectRatio === "16/11"
      ? "aspect-[16/11]"
      : "aspect-[16/10]";

  // Border radius class
  const radiusClass = cfg.media.borderRadius || "rounded-3xl";

  const handlePrimaryClick = () => {
    if (cfg.actions.primaryAction === "drawer") {
      openContactDrawer();
    } else if (cfg.actions.primaryAction === "whatsapp") {
      const msg = encodeURIComponent("Olá Lucas! Gostaria de conversar sobre um projeto de design.");
      window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
    } else {
      const contactSection = document.getElementById("contato");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      } else {
        openContactDrawer();
      }
    }
  };

  const badgeStatusColors: Record<string, { bg: string; text: string; dot: string }> = {
    emerald: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    primary: {
      bg: "bg-primary/15 border-primary/30",
      text: "text-primary",
      dot: "bg-primary",
    },
    amber: {
      bg: "bg-amber-500/15 border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    blue: {
      bg: "bg-blue-500/15 border-blue-500/30",
      text: "text-blue-400",
      dot: "bg-blue-400",
    },
  };
  const badgeTheme = badgeStatusColors[cfg.media.badgeStatus] || badgeStatusColors.emerald;

  // Render a custom element added via builder
  const renderCustomElement = (elem: CustomHeroElement) => {
    const isVisible = isMobileView ? elem.visibleMobile : elem.visibleDesktop;
    if (!isVisible) return null;

    if (elem.type === "text") {
      return (
        <div key={elem.id} className="my-4">
          <p
            className={`text-foreground/90 leading-relaxed ${
              elem.style?.size === "sm"
                ? "text-xs"
                : elem.style?.size === "lg"
                ? "text-base font-medium"
                : "text-sm"
            } ${
              elem.style?.color === "primary"
                ? "text-primary font-medium"
                : elem.style?.color === "muted"
                ? "text-muted-foreground"
                : ""
            } ${elem.style?.alignment === "center" ? "text-center" : "text-left"}`}
          >
            {elem.content}
          </p>
        </div>
      );
    }

    if (elem.type === "image") {
      return (
        <div
          key={elem.id}
          className={`my-5 ${elem.style?.alignment === "center" ? "flex justify-center" : "flex justify-start"}`}
        >
          <img
            src={elem.content}
            alt={elem.title}
            className={`max-h-24 sm:max-h-32 object-contain rounded-lg ${
              elem.style?.size === "sm" ? "max-h-16" : elem.style?.size === "lg" ? "max-h-40" : ""
            }`}
          />
        </div>
      );
    }

    if (elem.type === "button") {
      return (
        <div
          key={elem.id}
          className={`my-3 inline-block ${elem.style?.alignment === "center" ? "w-full text-center" : ""}`}
        >
          <a
            href={elem.linkUrl || "#"}
            target={elem.linkUrl?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-foreground text-xs font-semibold backdrop-blur-md transition-all hover:scale-[1.02]"
          >
            <span>{elem.content || elem.title}</span>
            <ExternalLink size={13} className="text-primary" />
          </a>
        </div>
      );
    }

    if (elem.type === "divider") {
      return (
        <div key={elem.id} className="my-5 w-full">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent w-full" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative bg-[#000000] overflow-hidden">
      {/* Main Hero Stage */}
      <div
        className={`relative min-h-[100dvh] lg:min-h-[clamp(740px,100dvh,960px)] flex flex-col justify-center ${paddingClass} overflow-hidden`}
      >
        {/* Dynamic / Custom Background Stage (Shader, Video or Image) */}
        <HeroBackgroundStage backgroundConfig={cfg.background} colors={colors} bg={bg} />

        {/* Content Container (z-20, above dynamic background) */}
        <div className="container-editorial relative z-20 w-full py-2 sm:py-4 lg:py-6">
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center ${
              cfg.layout.order === "image-first" && !isInverted ? "flex flex-col-reverse lg:grid" : ""
            }`}
          >
            {/* Left Column / Text Block */}
            <div
              className={`${leftColSpan} ${
                effectiveTextAlignment === "center" || isCentered
                  ? "text-center items-center"
                  : "text-left"
              }`}
            >
              {/* Kicker: Availability + Specialties */}
              {cfg.kicker.enabled && !isKickerHidden && isLayerVisible("kicker") && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-flex flex-wrap items-center gap-2.5 text-[12px] sm:text-[13px] xl:text-[14px] mb-5 lg:mb-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md ${
                    isCentered || effectiveTextAlignment === "center" ? "mx-auto" : ""
                  }`}
                >
                  {cfg.kicker.pulseDot && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 shadow-[0_0_12px_#FF4001] animate-pulse" />
                  )}
                  {cfg.kicker.statusText && (
                    <span className="text-foreground font-semibold">{cfg.kicker.statusText}</span>
                  )}
                  {cfg.kicker.statusText && cfg.kicker.subText && (
                    <span className="text-muted-foreground" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {cfg.kicker.subText && (
                    <span className="text-muted-foreground">{cfg.kicker.subText}</span>
                  )}
                </motion.div>
              )}

              {/* Main Headline */}
              {isLayerVisible("headline") && (
                <motion.h1
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-bold text-foreground tracking-[-0.03em] mb-5 lg:mb-6 text-balance"
                  style={{
                    fontSize: headlineClamp,
                    lineHeight: 1.05,
                  }}
                >
                  {cfg.typography.headlineLine1}{" "}
                  {cfg.typography.headlineHighlight1 && (
                    <span className="text-primary">{cfg.typography.headlineHighlight1}</span>
                  )}{" "}
                  <br className="hidden sm:inline" />
                  {cfg.typography.headlineLine2}{" "}
                  {cfg.typography.headlineHighlight2 && (
                    <span className="text-primary">{cfg.typography.headlineHighlight2}</span>
                  )}
                  {cfg.typography.headlineEnd && ` ${cfg.typography.headlineEnd}`}
                </motion.h1>
              )}

              {/* Subtitle */}
              {cfg.typography.subtitle && isLayerVisible("subtitle") && (
                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`text-muted-foreground text-[16px] sm:text-[17px] xl:text-[19px] leading-[1.6] max-w-[50ch] mb-8 lg:mb-9 ${
                    isCentered || effectiveTextAlignment === "center" ? "mx-auto" : ""
                  }`}
                >
                  {cfg.typography.subtitle}
                </motion.p>
              )}

              {/* Custom Elements positioned before CTAs */}
              {Array.isArray(cfg.customElements) &&
                cfg.customElements.map((elem) => renderCustomElement(elem))}

              {/* CTA Action Buttons */}
              {isLayerVisible("actions") && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex flex-wrap items-center gap-3.5 mb-9 lg:mb-11 ${
                    isCentered || effectiveTextAlignment === "center" ? "justify-center" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="rounded-full bg-primary text-white px-7 sm:px-8 py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-semibold inline-flex items-center gap-2.5 transition-all duration-200 hover:bg-[#ff551a] hover:shadow-[0_0_32px_rgba(255,64,1,0.55)] group cursor-pointer"
                  >
                    {cfg.actions.primaryAction === "whatsapp" && <MessageCircle size={16} />}
                    <span>{cfg.actions.primaryText || "Solicitar Orçamento"}</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>

                  {cfg.actions.showSecondary && (
                    <Link
                      to={cfg.actions.secondaryLink || "/projetos"}
                      className="rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-foreground px-7 sm:px-8 py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-medium inline-flex items-center justify-center transition-all duration-200 hover:border-white/35 hover:bg-white/[0.08]"
                    >
                      {cfg.actions.secondaryText || "Ver Projetos"}
                    </Link>
                  )}
                </motion.div>
              )}

              {/* Metrics + Social Icons Bar */}
              {isLayerVisible("metrics") &&
                ((cfg.metrics.enabled && !isMetricsHidden) ||
                  (cfg.social.enabled && !isSocialHidden)) && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={`pt-6 lg:pt-7 border-t border-white/[0.1] flex flex-wrap items-center gap-y-5 gap-x-8 ${
                      isCentered || effectiveTextAlignment === "center" ? "justify-center" : ""
                    }`}
                  >
                    {/* Metrics */}
                    {cfg.metrics.enabled && !isMetricsHidden && (
                      <div className="flex items-center gap-6 sm:gap-8">
                        <div>
                          <div className="font-display text-[22px] sm:text-[26px] font-bold text-foreground leading-none tabular-nums">
                            {projectsCount}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-1">
                            {cfg.metrics.statProjectsLabel || "Projetos"}
                          </div>
                        </div>

                        <div className="h-7 w-[1px] bg-white/10" aria-hidden="true" />

                        <div>
                          <div className="font-display text-[22px] sm:text-[26px] font-bold text-foreground leading-none tabular-nums">
                            {clientsCount}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-1">
                            {cfg.metrics.statClientsLabel || "Clientes"}
                          </div>
                        </div>

                        <div className="h-7 w-[1px] bg-white/10" aria-hidden="true" />

                        <div>
                          <div className="font-display text-[22px] sm:text-[26px] font-bold text-primary leading-none tabular-nums">
                            {experienceCount}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-1">
                            {cfg.metrics.statExperienceLabel || "Experiência"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Circle Icons */}
                    {cfg.social.enabled && !isSocialHidden && (
                      <div
                        className={`flex items-center gap-2 ${
                          isCentered || effectiveTextAlignment === "center"
                            ? "w-full justify-center mt-2"
                            : "sm:ml-auto"
                        }`}
                      >
                        {cfg.social.showInstagram && (
                          <a
                            href={instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                          >
                            <Instagram size={15} />
                          </a>
                        )}
                        {cfg.social.showBehance && (
                          <a
                            href={behanceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Behance"
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-[12px] font-bold text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                          >
                            Be
                          </a>
                        )}
                        {cfg.social.showLinkedin && (
                          <a
                            href={linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                          >
                            <Linkedin size={15} />
                          </a>
                        )}
                        {cfg.social.showDribbble && (
                          <a
                            href={dribbbleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Dribbble"
                            className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm flex items-center justify-center text-foreground/85 hover:text-white hover:border-primary hover:bg-primary/20 transition-all"
                          >
                            <Dribbble size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
            </div>

            {/* Right Column: Visual Stage / Portrait Card */}
            {isLayerVisible("media") && (
              <div className={`${rightColSpan} flex flex-col gap-5`}>
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative ${radiusClass} border border-white/15 bg-black/45 backdrop-blur-xl overflow-hidden shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] group`}
                >
                  {/* Glow accent */}
                  {cfg.media.glowEffect && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/25 blur-3xl"
                    />
                  )}

                  {/* Portrait Image */}
                  <div className={`relative ${aspectClass} overflow-hidden bg-black/60`}>
                    <img
                      src={resolvedImage}
                      alt={cfg.media.cardFooterTitle || "Lucas Evangelista — Direção de Arte e Design"}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    {/* Bottom gradient fade for text legibility */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent"
                    />

                    {/* Status Badge */}
                    {cfg.media.badgeEnabled && cfg.media.badgeText && (
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border ${badgeTheme.bg} text-[11px] font-mono ${badgeTheme.text} flex items-center gap-1.5 shadow-lg`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeTheme.dot} animate-pulse`} />
                        <span>{cfg.media.badgeText}</span>
                      </div>
                    )}
                  </div>

                  {/* Studio Information & Credentials below the photo */}
                  {cfg.media.cardFooterEnabled && (
                    <div className="p-5 sm:p-6 bg-[#0E1014]/90 border-t border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-foreground text-[16px] font-semibold flex items-center gap-2">
                            <span>{cfg.media.cardFooterTitle || "Lucas Evangelista"}</span>
                            {cfg.media.cardFooterRole && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                                {cfg.media.cardFooterRole}
                              </span>
                            )}
                          </h3>
                          {cfg.media.cardFooterSubtitle && (
                            <p className="text-[12px] text-muted-foreground font-mono mt-0.5">
                              {cfg.media.cardFooterSubtitle}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handlePrimaryClick}
                          className="px-3.5 py-1.5 rounded-full bg-primary/15 hover:bg-primary text-primary hover:text-white border border-primary/30 text-[12px] font-semibold transition-all duration-200 flex items-center gap-1.5"
                        >
                          <span>Orçamento</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      {/* Trust guarantees bar */}
                      {cfg.media.cardGuaranteeText && (
                        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[12px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-primary" />
                            {cfg.media.cardGuaranteeText}
                          </span>
                          <span className="font-mono text-foreground/80 font-medium">
                            +{clientsCount} atendidos
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
