import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Dribbble, ExternalLink } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isValidSocialUrl, isValidWhatsappNumber } from "@/lib/caseStudy";
import { DEFAULT_HERO_CONFIG, resolveHeroImage, type CustomHeroElement } from "@/config/heroConfig";
import { HeroBackgroundStage } from "./HeroBackgroundStage";
import GradientBlinds from "@/components/ui/GradientBlinds";
import type { HeroSharedProps } from "./types";
import "./orion-hero.css";

export interface HeroEditorialProps extends HeroSharedProps {
  previewDevice?: "desktop" | "tablet" | "mobile";
}

function CustomElement({ element }: { element: CustomHeroElement }) {
  const style: CSSProperties = { textAlign: element.style?.alignment || "left" };
  const color = element.style?.color === "primary" ? "text-primary" : element.style?.color === "muted" ? "text-muted-foreground" : "text-foreground";
  const size = element.style?.size === "sm" ? "text-xs" : element.style?.size === "lg" ? "text-lg" : "text-sm";
  if (element.type === "divider") return <hr className="my-5 border-white/15" />;
  return (
    <div className={`my-4 ${color} ${size}`} style={style}>
      {element.type === "text" && <p>{element.content}</p>}
      {element.type === "image" && <img src={element.content} alt={element.title} className={`inline-block max-h-32 max-w-full object-contain ${element.style?.size === "sm" ? "max-h-16" : element.style?.size === "lg" ? "max-h-40" : ""}`} />}
      {element.type === "button" && (
        <a href={element.linkUrl || "#"} target={element.linkUrl?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="orion-action orion-action-secondary">
          {element.content || element.title}<ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

export function HeroSplitEditorial({
  statProjects, statClients, statExperience,
  instagramUrl, behanceUrl, linkedinUrl, dribbbleUrl,
  openContactDrawer, whatsappNumber, colors, bg, config: inputConfig, previewDevice,
}: HeroEditorialProps) {
  const cfg = inputConfig || DEFAULT_HERO_CONFIG;
  const actualMobile = useMediaQuery("(max-width: 767px)");
  const isMobile = previewDevice ? previewDevice === "mobile" : actualMobile;
  const reducedMotion = useReducedMotion();
  const mobile = isMobile && cfg.mobileOverrides?.enabled ? cfg.mobileOverrides : undefined;
  const visible = (id: string) => {
    const layer = cfg.layers?.find((item) => item.id === id);
    return !layer || (isMobile ? layer.visibleMobile : layer.visibleDesktop);
  };
  const alignment = mobile?.textAlignment || cfg.layout.textAlignment;
  const headlineSize = mobile?.headlineFontSize || cfg.typography.headlineFontSize;
  const imageAspect = mobile?.imageAspectRatio || cfg.media.aspectRatio;
  const hasMedia = visible("media");
  const enter = {
    initial: reducedMotion ? false as const : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.55 },
  };

  const handlePrimaryClick = () => {
    if (cfg.actions.primaryAction === "whatsapp" && isValidWhatsappNumber(whatsappNumber || "")) {
      const message = encodeURIComponent("Olá! Gostaria de conversar sobre um projeto com o Studio Orion.");
      window.open(`https://wa.me/${whatsappNumber!.replace(/\D/g, "")}?text=${message}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (cfg.actions.primaryAction === "contact") {
      const section = document.getElementById("contato");
      if (section) {
        section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        return;
      }
    }
    openContactDrawer();
  };

  const socialLinks = [
    { label: "Instagram", enabled: cfg.social.showInstagram, url: cfg.social.customInstagram || instagramUrl, icon: <Instagram size={16} /> },
    { label: "Behance", enabled: cfg.social.showBehance, url: cfg.social.customBehance || behanceUrl, icon: <span className="text-xs font-bold">Be</span> },
    { label: "LinkedIn", enabled: cfg.social.showLinkedin, url: cfg.social.customLinkedin || linkedinUrl, icon: <Linkedin size={16} /> },
    { label: "Dribbble", enabled: cfg.social.showDribbble, url: cfg.social.customDribbble || dribbbleUrl, icon: <Dribbble size={16} /> },
  ].filter((item) => item.enabled && isValidSocialUrl(item.url));

  return (
    <div className="orion-hero" data-preview={previewDevice} data-mobile={isMobile} data-layout={cfg.layout.columnDistribution} data-order={cfg.layout.order} data-padding={cfg.layout.paddingY} data-has-media={hasMedia} data-portrait={!cfg.media.imageUrl && cfg.media.imagePreset === "lucas-hero-png" ? "seated" : undefined}>
      <div className="orion-hero-stage">
        {cfg.background.type !== "shader" && <HeroBackgroundStage backgroundConfig={cfg.background} colors={colors} bg={bg} />}
        <div className="orion-hero-atmosphere" aria-hidden="true" />
        {hasMedia && (
          <div className="orion-hero-gradient" aria-hidden="true">
            <GradientBlinds gradientColors={["#f97316", "#ef4444"]} angle={20} blindCount={16} blindMinWidth={60}
              spotlightRadius={0.5} shine={0.4} relief={0.5} glow={0.4} sway={0.35}
              hoverTilt={0.6} clickEffect="ripple" noise={0.3} />
          </div>
        )}
        {cfg.media.glowEffect && <div className="orion-hero-light" aria-hidden="true" />}
        <div className="orion-hero-panels" aria-hidden="true"><span /><span /></div>

        <div className="orion-hero-container">
          <motion.div {...enter} className="orion-hero-copy" data-alignment={alignment}>
            {cfg.kicker.enabled && !mobile?.hideKicker && visible("kicker") && (
              <div className="orion-hero-kicker">
                {cfg.kicker.pulseDot && <span className="orion-status-dot" aria-hidden="true" />}
                <span>{cfg.kicker.statusText}</span>
                {cfg.kicker.subText && <span className="orion-hero-kicker-detail">{cfg.kicker.subText}</span>}
              </div>
            )}
            {visible("headline") && (
              <h1 className="orion-hero-title" data-size={headlineSize}>
                <span>{cfg.typography.headlineLine1}</span>{" "}
                <span>{cfg.typography.headlineHighlight1 && <>que <em>{cfg.typography.headlineHighlight1}</em>{" "}</>}{cfg.typography.headlineLine2}</span>{" "}
                <span>{cfg.typography.headlineHighlight2 && <>e <em>{cfg.typography.headlineHighlight2}</em></>}{cfg.typography.headlineEnd}</span>
              </h1>
            )}
            {cfg.typography.subtitle && visible("subtitle") && <p className="orion-hero-subtitle">{cfg.typography.subtitle}</p>}
            {cfg.customElements?.filter((element) => (isMobile ? element.visibleMobile : element.visibleDesktop) && visible(element.id)).map((element) => <CustomElement key={element.id} element={element} />)}
            {visible("actions") && (
              <div className="orion-hero-actions">
                <button type="button" onClick={handlePrimaryClick} className="orion-action orion-action-primary">{cfg.actions.primaryText || "Solicitar orçamento"}<ArrowRight size={17} aria-hidden="true" /></button>
                {cfg.actions.showSecondary && <Link to={cfg.actions.secondaryLink || "/projetos"} className="orion-action orion-action-secondary">{cfg.actions.secondaryText || "Ver projetos"}</Link>}
              </div>
            )}
            {visible("metrics") && (
              <div className="orion-hero-proof">
                {cfg.metrics.enabled && !mobile?.hideMetrics && (
                  <dl className="flex flex-wrap gap-6">
                    {[
                      [cfg.metrics.statProjects || statProjects, cfg.metrics.statProjectsLabel || "Projetos"],
                      [cfg.metrics.statClients || statClients, cfg.metrics.statClientsLabel || "Clientes"],
                      [cfg.metrics.statExperience || statExperience, cfg.metrics.statExperienceLabel || "Experiência"],
                    ].filter(([value]) => value).map(([value, label]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-xl font-medium">{value}</dd></div>)}
                  </dl>
                )}
                {cfg.social.enabled && !mobile?.hideSocial && socialLinks.length > 0 && <div className="flex gap-2">{socialLinks.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="orion-social">{item.icon}</a>)}</div>}
              </div>
            )}
          </motion.div>

          {hasMedia && (
            <div className="orion-hero-portrait" style={{ "--portrait-aspect": imageAspect } as CSSProperties}>
              <img src={resolveHeroImage(cfg.media)} alt="Lucas Evangelista, à frente do Studio Orion" className="orion-hero-portrait-image" {...{ fetchpriority: "high" }} decoding="async" />
              <div className="orion-hero-portrait-fade" aria-hidden="true" />
              {cfg.media.badgeEnabled && cfg.media.badgeText && <span className="orion-hero-badge" data-status={cfg.media.badgeStatus}>{cfg.media.badgeText}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
