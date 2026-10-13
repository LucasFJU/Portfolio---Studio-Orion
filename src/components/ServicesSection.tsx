import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Globe,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useContactDrawer } from "./ContactDrawer";
import { ScrollRevealTitle } from "./ScrollRevealTitle";

import demoBrandIdentity from "@/assets/demo-brand-identity.jpg";
import demoSocialMedia from "@/assets/demo-social-media.jpg";
import demoWebDesign from "@/assets/demo-web-design.jpg";
import { ServiceOrbitalRadar } from "./ServiceOrbitalRadar";

export interface ServiceItem {
  num: "01" | "02" | "03";
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  subservices: string[];
  previewImage: string;
  caption: string;
  metrics: string;
  badge: string;
  icon: typeof Sparkles;
  color: string;
}

export const HOME_SERVICES: ServiceItem[] = [
  {
    num: "01",
    label: "Identidade visual",
    shortLabel: "Branding",
    tagline: "Posicionamento, diferenciação e sistema visual proprietário",
    description:
      "Construo identidades visuais completas para marcas que precisam transmitir valor imediato, se destacar no mercado e manter consistência em qualquer ponto de contato.",
    subservices: [
      "Logotipo e sistema visual proprietário",
      "Paleta cromática e tipografia calibrada",
      "Manual de marca & Brand Book oficial",
      "Embalagens, papelaria e apresentações executivas",
    ],
    previewImage: demoBrandIdentity,
    caption: "Construção e reposicionamento de marca com diretrizes claras de aplicação.",
    metrics: "Mais de 250 marcas criadas",
    badge: "Branding Estratégico",
    icon: Sparkles,
    color: "#FF4001",
  },
  {
    num: "02",
    label: "Design para redes sociais",
    shortLabel: "Social Media",
    tagline: "Direção de arte contínua e campanhas que geram autoridade",
    description:
      "Desenvolvo a linha visual e as peças estratégicas do seu perfil para transformar seguidores em oportunidades reais de negócio todos os dias.",
    subservices: [
      "Direção de arte contínua para feed e stories",
      "Carrosséis narrativos de alta retenção",
      "Identidade visual para lançamentos e produtos",
      "Sistemas de templates editáveis no Figma",
    ],
    previewImage: demoSocialMedia,
    caption: "Desdobramento visual contínuo para fortalecer a presença digital da marca.",
    metrics: "+10M de impressões geradas",
    badge: "Social & Conteúdo",
    icon: Flame,
    color: "#FF7A00",
  },
  {
    num: "03",
    label: "Sites e interfaces",
    shortLabel: "Web & UX/UI",
    tagline: "Landing pages e sites institucionais focados em conversão",
    description:
      "Projeto experiências digitais rápidas, responsivas e persuasivas — desenhadas para conduzir o visitante do primeiro impacto ao pedido de orçamento.",
    subservices: [
      "Sites institucionais e portfólios sob medida",
      "Landing pages de alta conversão para tráfego pago",
      "UI/UX design moderno e prototipagem no Figma",
      "Implementação ultrarrápida com código limpo",
    ],
    previewImage: demoWebDesign,
    caption: "Páginas e interfaces responsivas com navegação intuitiva e leitura organizada.",
    metrics: "Taxas de conversão otimizadas",
    badge: "Web & UX/UI",
    icon: Globe,
    color: "#00E5FF",
  },
];

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { openContactDrawer } = useContactDrawer();

  const handleSelectServiceNum = useCallback((num: "01" | "02" | "03") => {
    const idx = HOME_SERVICES.findIndex((s) => s.num === num);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  }, []);

  const handleSelectIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? HOME_SERVICES.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HOME_SERVICES.length);
  }, []);

  const activeService = HOME_SERVICES[activeIndex] || HOME_SERVICES[0];

  return (
    <section
      ref={sectionRef}
      className="relative bg-background py-10 md:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Off-white editorial container with deep luxury presence */}
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6">
        <div className="relative rounded-[24px] md:rounded-[32px] bg-[#F0EEE8] text-[#090A0C] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.35)] border border-[#E2DFD5]">
          {/* Subtle top indicator line */}
          <div className="h-[3px] w-full bg-[#E2DFD5] overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out origin-left"
              style={{
                width: `${((activeIndex + 1) / HOME_SERVICES.length) * 100}%`,
              }}
            />
          </div>

          <div className="container-editorial py-12 md:py-18 lg:py-20">
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 md:pb-10 border-b border-[#D8D5CC] mb-8 md:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[13px] md:text-[14px] font-medium text-[#4A4D55] mb-3">
                  <span className="font-mono tabular-nums text-primary font-semibold">02.</span>
                  <span>Serviços &amp; Especialidades</span>
                </div>

                <ScrollRevealTitle
                  as="h2"
                  text="Como posso ajudar."
                  theme="light"
                  className="font-display font-medium"
                  style={{ fontSize: "clamp(30px, 4.4vw, 52px)", lineHeight: 1.06 }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-[#4A4D55] text-[15px] leading-[1.55] max-w-[40ch]">
                  Três frentes integradas. Clique nos ícones da órbita para abrir a frente desejada e
                  explorar detalhes e entregáveis.
                </p>

                <Link
                  to="/servicos"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#090A0C] text-[#F5F5F2] px-6 py-3.5 text-[14px] font-medium hover:bg-primary hover:text-white transition-colors duration-200 group shrink-0"
                >
                  <span>Ver todos os detalhes</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Quick Interactive Category Pill Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="inline-flex items-center p-1.5 rounded-full bg-[#E5E2D8] border border-[#D8D5CC] gap-1 shadow-inner">
                {HOME_SERVICES.map((srv, idx) => {
                  const isActive = activeIndex === idx;
                  const Icon = srv.icon;

                  return (
                    <button
                      key={srv.num}
                      type="button"
                      onClick={() => handleSelectIndex(idx)}
                      className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? "text-white font-semibold shadow-md"
                          : "text-[#5A5D65] hover:text-[#090A0C] hover:bg-white/40"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="service-active-pill"
                          className="absolute inset-0 rounded-full bg-[#090A0C]"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            isActive ? "text-primary" : "text-[#7A7D85]"
                          }`}
                        >
                          {srv.num}.
                        </span>
                        <span>{srv.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Step Navigation */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[12px] font-mono text-[#7A7D85] mr-2">
                  Frente 0{activeIndex + 1} de 0{HOME_SERVICES.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Frente anterior"
                  className="w-9 h-9 rounded-full border border-[#D0CCC2] hover:border-[#090A0C] bg-[#FAF8F3] hover:bg-white text-[#090A0C] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Próxima frente"
                  className="w-9 h-9 rounded-full border border-[#D0CCC2] hover:border-[#090A0C] bg-[#FAF8F3] hover:bg-white text-[#090A0C] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Main Interactive Stage: Orbital Controller (Left) + Dynamic Opened Showcase (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Column: O Núcleo Orbital Interativo */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Orbital Radar Stage */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <ServiceOrbitalRadar
                    activeNum={activeService.num}
                    onSelectService={handleSelectServiceNum}
                    isPaused={isPaused}
                  />
                </div>

                {/* Sub-console with quick interactive shortcuts and instruction hint */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F3] border border-[#D8D5CC] flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#5A5D65]">
                    <span className="flex items-center gap-1.5 font-semibold text-[#090A0C]">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      SELETOR ORBITAL INTERATIVO
                    </span>
                    <span>3 Frentes de Estúdio</span>
                  </div>

                  <p className="text-[12px] text-[#4A4D55] leading-relaxed">
                    Clique em qualquer nó ou no centro da órbita acima para alternar dinamicamente entre
                    as frentes e abrir os entregáveis.
                  </p>

                  {/* 3 Quick Selectors with live active state */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {HOME_SERVICES.map((srv, idx) => {
                      const isActive = activeIndex === idx;
                      const Icon = srv.icon;
                      return (
                        <button
                          key={srv.num}
                          type="button"
                          onClick={() => handleSelectIndex(idx)}
                          className={`p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-[#090A0C] text-white border-[#090A0C] shadow-md scale-[1.02]"
                              : "bg-white hover:bg-[#F2EFE8] text-[#090A0C] border-[#D8D5CC]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-mono text-[10px] font-bold ${
                                isActive ? "text-primary" : "text-[#7A7D85]"
                              }`}
                            >
                              0{idx + 1}
                            </span>
                            <Icon
                              size={13}
                              className={isActive ? "text-primary" : "text-[#7A7D85]"}
                            />
                          </div>
                          <div className="text-[11px] font-semibold truncate leading-tight">
                            {srv.shortLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: O Painel Dinâmico da Frente Aberta (Showcase) */}
              <div className="lg:col-span-7 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.num}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 16, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -12, filter: "blur(4px)" }
                    }
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 rounded-2xl bg-white border border-[#D8D5CC] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 lg:p-9 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges & Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                            FRENTE {activeService.num} / 0{HOME_SERVICES.length}
                          </span>
                          <span className="text-[12px] font-mono text-[#7A7D85]">
                            · {activeService.badge}
                          </span>
                        </div>

                        <span className="text-[12px] font-mono font-semibold text-[#090A0C] px-3 py-1 rounded-full bg-[#F0EEE8] border border-[#D8D5CC]">
                          {activeService.metrics}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3
                        className="font-display font-medium text-[#090A0C] tracking-tight mb-2"
                        style={{ fontSize: "clamp(26px, 3.2vw, 40px)", lineHeight: 1.1 }}
                      >
                        {activeService.label}
                      </h3>

                      <p className="text-primary font-medium text-[15px] sm:text-[16px] mb-4">
                        {activeService.tagline}
                      </p>

                      <p className="text-[#3A3D45] text-[15px] sm:text-[16px] leading-[1.65] max-w-[62ch] mb-6">
                        {activeService.description}
                      </p>

                      {/* Visual Mockup Stage with real project preview */}
                      <div className="relative aspect-[16/9] sm:aspect-[21/10] rounded-xl overflow-hidden bg-[#090A0C] mb-6 border border-[#E2DFD5] shadow-md group">
                        <img
                          src={activeService.previewImage}
                          alt={activeService.label}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Top floating overlay */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white flex items-center gap-1.5 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span>Case em Destaque</span>
                        </div>

                        {/* Bottom caption overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white text-[12px] sm:text-[13px] flex items-center justify-between">
                          <span>{activeService.caption}</span>
                          <Link
                            to={`/projetos?categoria=${encodeURIComponent(activeService.label)}`}
                            className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
                          >
                            <span>Ver portfólio</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>

                      {/* Deliverables Matrix */}
                      <div className="mb-8">
                        <div className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#7A7D85] mb-3">
                          O que está incluído nesta entrega:
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeService.subservices.map((sub) => (
                            <div
                              key={sub}
                              className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-[#141518] font-medium p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E8E5DD] hover:bg-white transition-colors"
                            >
                              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={2.5} />
                              </span>
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-6 border-t border-[#E8E5DD] flex flex-wrap items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => openContactDrawer(activeService.label)}
                        className="inline-flex items-center gap-2.5 rounded-full bg-primary text-white px-6 sm:px-7 py-3.5 text-[14px] font-semibold hover:bg-[#ff551a] hover:shadow-[0_0_28px_rgba(255,64,1,0.45)] transition-all duration-200 group cursor-pointer"
                      >
                        <span>Solicitar orçamento para {activeService.label.toLowerCase()}</span>
                        <ArrowUpRight
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </button>

                      <Link
                        to={`/projetos?categoria=${encodeURIComponent(activeService.label)}`}
                        className="text-[14px] font-semibold text-[#090A0C] hover:text-primary transition-colors flex items-center gap-1.5 group py-2"
                      >
                        <span>Ver projetos desta frente</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
