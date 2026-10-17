import SectionGlow from "@/components/SectionGlow";
import SectionTransition from "@/components/SectionTransition";
import { useRef, useState, useEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Layers,
  Compass,
  Sparkles,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import PageMeta from "@/components/PageMeta";
import { useContactDrawer } from "@/components/ContactDrawer";

import AboutPortrait from "@/components/AboutPortrait";
import CapabilitiesSection from "@/components/CapabilitiesSection";

const DEFAULT_BIO = [
  "Sou designer e diretor criativo com mais de 13 anos de experiência ajudando empresas e profissionais a estruturarem sua presença visual com clareza, critério e consistência.",
  "Ao longo da minha trajetória, concluí mais de 2.500 projetos para mais de 500 marcas no Brasil e no exterior — passando por sistemas de identidade visual, direção criativa contínua para redes sociais e criação de sites e interfaces digitais.",
  "Meu trabalho parte sempre do entendimento real do negócio: quem é o cliente, qual valor precisa ser percebido e como o design pode tornar a marca mais forte, confiável e preparada para crescer.",
];

const TRAJECTORY_ITEMS = [
  {
    period: "2013 — 2016",
    phase: "Fundamentos & Prática Visual",
    role: "Design Gráfico & Direção de Arte",
    description:
      "Início da atuação profissional desenvolvendo peças gráficas, materiais promocionais, composição tipográfica e identidade para negócios locais, consolidando domínio técnico de produção visual.",
    highlights: ["Composição Tipográfica", "Produção Gráfica", "Identidade Local"],
    metric: "Primeiros 300+ projetos",
  },
  {
    period: "2017 — 2020",
    phase: "Expansão & Posicionamento de Marcas",
    role: "Especialista em Identidade Visual & Social Media",
    description:
      "Ampliação do atendimento para empresas de diferentes regiões do país, estruturando marcas do zero e liderando a direção visual estratégica de perfis comerciais em crescimento.",
    highlights: ["Sistemas de Marca", "Direção para Social Media", "Atendimento Nacional"],
    metric: "Mais de 200 marcas",
  },
  {
    period: "2021 — Presente",
    phase: "Direção Criativa & Ecossistemas Digitais",
    role: "Designer Sênior & Diretor Criativo Independente",
    description:
      "Mais de 2.500 projetos entregues para mais de 500 clientes no Brasil e no exterior — integrando identidade visual, conteúdo estratégico para redes sociais e interfaces web de alta conversão.",
    highlights: ["Marcas Globais", "UI/UX & Sites", "Direção Criativa Integrada"],
    metric: "2.500+ entregas acumuladas",
  },
];

const WORK_METHOD_ITEMS = [
  {
    num: "01",
    tag: "Alinhamento",
    title: "Contato direto, sem intermediários",
    description:
      "Você conversa e alinha cada etapa diretamente comigo, do diagnóstico inicial à entrega final. Isso elimina ruídos, acelera decisões e garante fidelidade ao que sua empresa precisa.",
    detail: "Reuniões objetivas e comunicação ágil via WhatsApp ou e-mail.",
  },
  {
    num: "02",
    tag: "Estratégia",
    title: "Critério visual com foco comercial",
    description:
      "Cada escolha tipográfica, cromática ou de layout responde a um objetivo claro: transmitir profissionalismo imediato, facilitar a leitura e ajudar o cliente a decidir.",
    detail: "Design pensado para gerar percepção de valor e conversão.",
  },
  {
    num: "03",
    tag: "Previsibilidade",
    title: "Processo enxuto e previsível",
    description:
      "Etapas organizadas com cronograma definido, apresentação aplicada em cenários reais de uso e rodadas estruturadas de refinamento para aprovação com segurança.",
    detail: "Prazos claros desde o primeiro dia da proposta comercial.",
  },
  {
    num: "04",
    tag: "Autonomia",
    title: "Entrega pronta para o dia a dia",
    description:
      "Você recebe todos os arquivos finais abertos e fechados, guias práticos de aplicação, matrizes editáveis e páginas publicadas prontas para operar.",
    detail: "Organização técnica para que sua equipe use tudo sem dificuldade.",
  },
];

const CAPABILITY_ROWS = [
  {
    num: "01",
    icon: Compass,
    category: "Identidade & Marca",
    summary: "Posicionamento, criação e redesign de sistemas visuais completos.",
    skills: [
      "Logotipo & Símbolo",
      "Rebranding",
      "Tipografia & Cores",
      "Manual de Marca",
      "Papelaria & Embalagens",
    ],
  },
  {
    num: "02",
    icon: Sparkles,
    category: "Direção para Redes Sociais",
    summary: "Comunicação visual estratégica para fortalecer autoridade e vendas.",
    skills: [
      "Direção de Arte para Feed",
      "Carrosséis Estratégicos",
      "Key Visuals de Campanha",
      "Templates Editáveis",
      "Padronização de Perfil",
    ],
  },
  {
    num: "03",
    icon: Layers,
    category: "Sites & Interfaces (UI/UX)",
    summary: "Ambientes digitais rápidos, responsivos e desenhados para conversão.",
    skills: [
      "Sites Institucionais",
      "Landing Pages",
      "Wireframes & Arquitetura",
      "UI Design no Figma",
      "Implementação Responsiva",
    ],
  },
  {
    num: "04",
    icon: Wrench,
    category: "Ferramentas & Tecnologias",
    summary: "Domínio técnico do conceito criativo à entrega final documentada.",
    skills: [
      "Adobe Illustrator",
      "Adobe Photoshop",
      "Adobe InDesign",
      "Figma & Design Systems",
      "React & Tailwind CSS",
    ],
  },
];

// Animated Counter Component triggered on scroll into view
const AnimatedStatCounter = ({
  rawValue,
  label,
}: {
  rawValue: string;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(rawValue);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setDisplayValue(rawValue);
      return;
    }

    const match = rawValue.match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplayValue(rawValue);
      return;
    }

    const numericString = match[1].replace(/\./g, "");
    const suffix = match[2] || "";
    const hasThousandDot = match[1].includes(".");
    const targetNum = parseInt(numericString, 10);

    if (isNaN(targetNum) || targetNum <= 0) {
      setDisplayValue(rawValue);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * targetNum);

      const formatted = hasThousandDot
        ? current.toLocaleString("pt-BR")
        : String(current);
      setDisplayValue(`${formatted}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(rawValue);
      }
    };

    const raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [isInView, rawValue, shouldReduceMotion]);

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-border/80 bg-[#141518]/75 p-5 sm:p-6 transition-all duration-300 hover:border-primary/45 hover:-translate-y-0.5"
    >
      <div className="font-display text-[28px] sm:text-[38px] font-semibold text-foreground leading-none mb-2 tabular-nums group-hover:text-primary transition-colors">
        {displayValue}
      </div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
    </div>
  );
};

// Interactive Spotlight Card for "03. Forma de Trabalhar"
const SpotlightMethodCard = ({
  item,
  index,
  isActive,
  onActivate,
}: {
  item: (typeof WORK_METHOD_ITEMS)[0];
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        onActivate();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
      className={`group relative cursor-pointer rounded-2xl border p-7 sm:p-9 overflow-hidden transition-all duration-300 ${
        isActive
          ? "border-primary/55 bg-background shadow-[0_20px_50px_-24px_rgba(255,64,1,0.3)] -translate-y-1"
          : "border-border bg-background/60 hover:border-primary/35"
      }`}
    >
      {/* Interactive Cursor Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered || isActive ? 1 : 0,
          background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 64, 1, 0.14), transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <span
              className={`font-mono text-sm font-semibold px-3 py-1 rounded-full border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 text-primary border-primary/25"
              }`}
            >
              {item.num}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {item.tag}
            </span>
          </div>

          <h3 className="font-display text-[22px] sm:text-[25px] font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.68]">
            {item.description}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between gap-2 text-xs font-mono text-foreground/80">
          <span>{item.detail}</span>
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isActive ? "bg-primary animate-pulse" : "bg-white/20"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const About = () => {
  const shouldReduceMotion = useReducedMotion();
  const { openContactDrawer } = useContactDrawer();
  const [activeTrajectoryIdx, setActiveTrajectoryIdx] = useState(2);
  const [activeMethodIdx, setActiveMethodIdx] = useState(0);

  // Scroll-linked timeline progress
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const timelineHeight = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback = "") =>
    settings?.find((s: any) => s.key === key)?.value || fallback;

  const customTitle = getSetting(
    "about_title",
    "Design com direção clara, critério visual e foco no negócio."
  );
  const photoUrl = getSetting("about_photo_url");
  const rawParagraphs = getSetting("about_paragraphs");
  const customDescription = getSetting("about_description");

  const bioParagraphs: string[] = (() => {
    if (customDescription && customDescription.trim()) {
      return customDescription
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
    if (!rawParagraphs) return DEFAULT_BIO;
    try {
      const parsed = JSON.parse(rawParagraphs);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BIO;
    } catch {
      return DEFAULT_BIO;
    }
  })();

  const stats = [
    { value: getSetting("stat_projects", "2.500+"), label: "Projetos entregues" },
    { value: getSetting("stat_clients", "500+"), label: "Marcas atendidas" },
    { value: getSetting("stat_experience", "13+ anos"), label: "Anos de atuação" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Sobre — Lucas Evangelista"
        description="Conheça a trajetória profissional, forma de trabalhar, ferramentas e capacidades de Lucas Evangelista."
      />
      <Navbar />

      <main className="pt-[108px] md:pt-[124px]">
        {/* Top Page Header (matching /projetos and /servicos structure) */}
        <section className="container-editorial pb-12 md:pb-16 border-b border-border">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="section-label mb-3">
              <span className="label-num">01.</span> Sobre &amp; Posicionamento
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <h1
                className="font-display text-foreground font-medium max-w-2xl"
                style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.04 }}
              >
                {customTitle}
              </h1>

              <p className="text-muted-foreground text-[16px] md:text-[17px] leading-[1.6] max-w-[44ch]">
                Mais de uma década criando identidades visuais, direção criativa para redes sociais e
                interfaces digitais para marcas que buscam crescer com consistência.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Biography + Centered Orbital Portrait Section */}
        <section className="container-editorial pt-16 pb-0 md:pt-24 md:pb-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-end">
            {/* Left (6 Columns): Portrait Centered Precisely Inside the Orbital Circle */}
            <div
                className="order-2 lg:order-1 lg:col-span-6 relative flex flex-col items-center justify-end select-none"
            >
              <AboutPortrait src={photoUrl || undefined} className="orion-about-page-portrait max-w-[520px] h-[520px] sm:h-[680px] lg:h-[760px]" />
            </div>

            {/* Right (6 Columns): First-Person Biography & Interactive Counter Metrics */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
              >
                <div className="inline-flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-wider mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Biografia &amp; Visão</span>
                </div>

                <h2 data-orion-reveal
                  className="font-display text-foreground font-medium mb-6"
                  style={{ fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.06 }}
                >
                  Prazer, sou o Lucas.
                </h2>

                <div className="space-y-5 text-muted-foreground text-[16px] md:text-[18px] leading-[1.72] max-w-[60ch]">
                  {bioParagraphs.map((paragraph, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Interactive Animated Counter Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
                  {stats.map((st) => (
                    <AnimatedStatCounter
                      key={st.label}
                      rawValue={st.value}
                      label={st.label}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openContactDrawer()}
                    className="btn-primary group"
                  >
                    <span>Conversar sobre um projeto</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>

                  <Link to="/projetos" className="btn-ghost group">
                    <span>Ver projetos selecionados</span>
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionTransition sourceColor="#090A0C" destinationColor="#FFFAFA" />

        {/* 02. Trajetória Profissional — Interactive Scroll-Linked Timeline */}
        <section className="orion-surface-light sec-pad">
          <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-[116px]">
              <div className="section-label mb-3">
                <span className="label-num">02.</span> Trajetória profissional
              </div>
              <h2 data-orion-reveal
                className="font-display text-foreground font-medium mb-4"
                style={{ fontSize: "clamp(28px, 3.8vw, 44px)", lineHeight: 1.08 }}
              >
                Mais de 13 anos de evolução contínua na prática do design.
              </h2>
              <p className="text-muted-foreground text-[16px] leading-[1.65] max-w-[40ch] mb-8">
                Uma caminhada construída projeto a projeto, unindo bagagem estética, domínio técnico
                e visão comercial para empresas de diferentes portes.
              </p>

              {/* Quick Interactive Era Selector */}
              <div className="hidden lg:flex flex-col gap-2 border-l border-border pl-4">
                {TRAJECTORY_ITEMS.map((item, idx) => {
                  const active = activeTrajectoryIdx === idx;
                  return (
                    <button
                      key={item.period}
                      type="button"
                      onClick={() => setActiveTrajectoryIdx(idx)}
                      className={`text-left py-1.5 transition-colors flex items-center gap-3 ${
                        active
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-all ${
                          active ? "bg-primary scale-125" : "bg-border"
                        }`}
                      />
                      <span className="font-mono text-xs tabular-nums">{item.period}</span>
                      <span className="text-xs truncate">— {item.phase}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Timeline Runway */}
            <div ref={timelineRef} className="lg:col-span-7 relative pl-6 sm:pl-10">
              {/* Vertical Background Track + Scroll-Animated Orange Beam */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-3 bottom-3 w-[2px] bg-border overflow-hidden rounded-full"
              >
                <motion.div
                  style={{ height: shouldReduceMotion ? "100%" : timelineHeight }}
                  className="w-full bg-gradient-to-b from-primary via-primary to-orange-400"
                />
              </div>

              <div className="space-y-6">
                {TRAJECTORY_ITEMS.map((item, idx) => {
                  const isActive = activeTrajectoryIdx === idx;
                  return (
                    <motion.div
                      key={item.period}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      onMouseEnter={() => setActiveTrajectoryIdx(idx)}
                      onClick={() => setActiveTrajectoryIdx(idx)}
                      className={`group relative cursor-pointer rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                        isActive
                          ? "border-primary/50 bg-card shadow-[0_18px_45px_-22px_rgba(255,64,1,0.28)]"
                          : "border-border bg-card/50 hover:border-foreground/25 hover:bg-card"
                      }`}
                    >
                      {/* Timeline Node Dot */}
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[29px] sm:-left-[45px] top-8 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-primary border-primary shadow-[0_0_14px_#FF4001] scale-125"
                            : "bg-background border-muted-foreground/50 group-hover:border-primary"
                        }`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span
                          className={`font-mono text-[13px] font-semibold rounded-full px-3.5 py-1 border transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "text-primary bg-primary/10 border-primary/20"
                          }`}
                        >
                          {item.period}
                        </span>
                        <span className="text-[12px] font-mono text-muted-foreground">
                          {item.metric}
                        </span>
                      </div>

                      <h3 className="font-display text-[22px] sm:text-[26px] font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {item.phase}
                      </h3>
                      <p className="text-xs font-mono text-primary/90 mb-3">{item.role}</p>

                      <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.68] mb-5">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-border/70">
                        {item.highlights.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono text-foreground/85 bg-background/80 border border-border rounded-lg px-2.5 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        </section>

        <SectionTransition sourceColor="#FFFAFA" destinationColor="#141518" />
        {/* 03. Forma de Trabalhar — Interactive Cursor Spotlight Cards */}
        <section className="orion-surface-soft sec-pad">
          <div className="container-editorial">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 md:mb-14">
              <div>
                <div className="section-label mb-3">
                  <span className="label-num">03.</span> Forma de trabalhar
                </div>
                <h2 data-orion-reveal
                  className="font-display text-foreground font-medium"
                  style={{ fontSize: "clamp(28px, 3.8vw, 44px)", lineHeight: 1.08 }}
                >
                  Estrutura enxuta, direta e focada em resultado.
                </h2>
              </div>

              <p className="text-muted-foreground text-[16px] leading-[1.6] max-w-[44ch]">
                Sem burocracia de grandes agências: um fluxo de trabalho claro para decisões seguras
                e entregas de alto nível.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {WORK_METHOD_ITEMS.map((item, idx) => (
                <SpotlightMethodCard
                  key={item.num}
                  item={item}
                  index={idx}
                  isActive={activeMethodIdx === idx}
                  onActivate={() => setActiveMethodIdx(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        <SectionTransition sourceColor="#141518" destinationColor="#090A0C" direction="rise-left" />
        <SectionGlow />
        <CapabilitiesSection items={CAPABILITY_ROWS} />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default About;
