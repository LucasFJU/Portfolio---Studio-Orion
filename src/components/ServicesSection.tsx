import ResponsiveImage from "@/components/ResponsiveImage";
import { useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useContactDrawer } from "./ContactDrawer";
import demoBrandIdentity from "@/assets/demo-brand-identity.jpg";
import demoSocialMedia from "@/assets/demo-social-media.jpg";
import demoWebDesign from "@/assets/demo-web-design.jpg";
import "./home-surfaces.css";
import "./service-panels.css";

export interface ServiceItem {
  num: string;
  label: string;
  tagline: string;
  description: string;
  subservices: string[];
  previewImage: string;
  caption: string;
}

export const HOME_SERVICES: ServiceItem[] = [
  {
    num: "01", label: "Identidade visual", tagline: "Uma marca reconhecida antes mesmo de dizer uma palavra.",
    description: "Traduzimos a essência do seu negócio em uma identidade consistente, pensada para diferenciar sua marca em cada ponto de contato.",
    subservices: ["Logotipo e sistema visual", "Cores, tipografia e aplicações", "Manual de identidade visual"],
    previewImage: demoBrandIdentity, caption: "Exemplo visual de identidade de marca",
  },
  {
    num: "02", label: "Design para redes sociais", tagline: "Sua marca presente. Seu conteúdo com personalidade.",
    description: "Criamos uma linguagem visual para suas redes e campanhas, com peças que comunicam com clareza e fortalecem a presença da sua marca.",
    subservices: ["Direção de arte para feed e stories", "Carrosséis e peças de campanha", "Templates para comunicação contínua"],
    previewImage: demoSocialMedia, caption: "Exemplo visual de conteúdo para redes sociais",
  },
  {
    num: "03", label: "Sites e interfaces", tagline: "Da primeira impressão ao próximo passo.",
    description: "Desenhamos sites e experiências digitais que apresentam seu negócio, organizam a informação e facilitam o contato com novos clientes.",
    subservices: ["Sites institucionais e landing pages", "Design responsivo e navegação", "Interfaces e protótipos no Figma"],
    previewImage: demoWebDesign, caption: "Exemplo visual de site e interface digital",
  },
];


export default function ServicesSection({ theme = "dark", sectionNumber = "02.", detailed = false }: { theme?: "dark" | "light"; sectionNumber?: string; detailed?: boolean }) {
  const { openContactDrawer } = useContactDrawer();
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [stackEnabled, setStackEnabled] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const contents = useRef<(HTMLDivElement | null)[]>([]);
  const stops = useRef<(HTMLDivElement | null)[]>([]);
  const offset = desktop ? 112 : 96;
  const stacked = stackEnabled && !reducedMotion;

  useLayoutEffect(() => {
    if (reducedMotion) { setStackEnabled(false); return; }
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const available = (viewport.current?.getBoundingClientRect().height || window.innerHeight) - offset - 16;
      const heights = contents.current.map((content) => content?.getBoundingClientRect().height || 0);
      // Larger desktop images may make a panel taller than the viewport. Let it
      // scroll to its bottom before it sticks, so every action remains reachable.
      contents.current.forEach((content, index) => {
        content?.parentElement?.style.setProperty("--service-panel-top", `${Math.min(offset, available + offset - heights[index])}px`);
      });
      const fits = heights.every((height) => height > 0 && height <= available);
      const scrollableDesktop = window.innerWidth >= 768 && available >= 360 && heights.every((height) => height > 0);
      setStackEnabled(heights.length === HOME_SERVICES.length && (fits || scrollableDesktop));
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    contents.current.forEach((content) => { if (content) observer?.observe(content); });
    if (viewport.current) observer?.observe(viewport.current);
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener("loadingdone", measure);
    document.fonts?.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [reducedMotion, offset, desktop]);

  const revealFocusedPanel = (event: FocusEvent<HTMLElement>, index: number) => {
    if (!stacked || !(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
    const stop = stops.current[index];
    if (!stop) return;
    const top = stop.getBoundingClientRect().top;
    if (Math.abs(top - offset) > 2) window.scrollTo({ top: window.scrollY + top - offset, behavior: "instant" });
  };

  return (
    <section id="servicos" aria-labelledby="home-services-title" data-theme={theme} data-variant={detailed ? "detailed" : "home"} data-scroll-mode={stacked ? "stack" : "flow"}
      className={`orion-services service-panels-section bg-[#090A0C] py-16 md:py-24 ${theme === "light" ? "home-surface-light" : ""}`}>
      <div ref={viewport} className="service-viewport-probe" aria-hidden="true" />
      <div className="orion-content-container">
        <div className={detailed ? "sr-only" : "mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"}>
          <div>
            <p className="mb-5 text-xs tracking-wide text-muted-foreground"><span className="mr-3 font-mono text-primary">{sectionNumber}</span>Serviços &amp; especialidades</p>
            <h2 id="home-services-title" className="max-w-[18ch] text-[36px] font-medium leading-[1.1] sm:text-[48px] lg:text-[56px]">Design para cada etapa da sua marca.</h2>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">Da identidade à presença digital, três frentes que conectam estratégia e expressão visual.</p>
        </div>
        <div className="service-panel-stack">
          {HOME_SERVICES.map((service, index) => (
            <div key={service.num} className="contents">
              <div ref={(node) => { stops.current[index] = node; }} className="service-scroll-stop" aria-hidden="true" />
              <article onFocusCapture={(event) => revealFocusedPanel(event, index)}
                aria-labelledby={`service-${service.num}`} className={`service-panel ${index === HOME_SERVICES.length - 1 ? "service-panel-dark" : ""}`} style={{ zIndex: index + 1 }}>
                <div ref={(node) => { contents.current[index] = node; }} className="service-panel-inner">
                  <div className="service-panel-header">
                    <span>{["Marca", "Conteúdo", "Digital"][index]}</span><span className="service-panel-number">/{service.num}</span>
                  </div>
                  <div className="service-panel-body" style={{ opacity: 1, filter: "none" }}>
                    <h3 id={`service-${service.num}`} className="service-panel-title">{service.label}</h3>
                    <div className="service-panel-details">
                      <div className="service-panel-media">
                        <figure>
                          <div className="service-panel-image">
                            <ResponsiveImage src={service.previewImage} sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw" alt={service.caption} loading="lazy" decoding="async"
                              width={480} height={270} data-parallax="disabled" style={{ transform: "none" }} />
                            <span className="service-image-label">EXEMPLO VISUAL</span>
                          </div>
                          <figcaption>{service.caption}</figcaption>
                        </figure>
                        {detailed && <p className="service-panel-benefit">{service.tagline}</p>}
                      </div>
                      <div className="service-panel-offer">
                        {detailed && <p className="service-panel-description">{service.description}</p>}
                        <ul className="service-panel-deliverables">
                          {service.subservices.map((item) => <li key={item}><span aria-hidden="true">+</span>{item}</li>)}
                        </ul>
                        <div className="service-panel-actions">
                          <button type="button" onClick={() => openContactDrawer(service.label)} aria-label={`Solicitar orçamento: ${service.label}`} className="orion-action orion-action-primary">Solicitar orçamento<ArrowUpRight size={16} aria-hidden="true" /></button>
                          <Link to={`/projetos?categoria=${encodeURIComponent(service.label)}`} className="service-project-link">Ver projetos<ArrowRight size={15} aria-hidden="true" /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
