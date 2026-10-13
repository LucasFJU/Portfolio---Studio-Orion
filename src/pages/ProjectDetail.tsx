import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { parseCaseStudy, formatCategoryLabel, normalizeCategoryFilter } from "@/lib/caseStudy";
import { useContactDrawer } from "@/components/ContactDrawer";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { openContactDrawer } = useContactDrawer();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Carrossel horizontal refs & state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: allProjects } = useQuery({
    queryKey: ["projects-nav"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, titulo, categoria, imagem_capa")
        .neq("status", "Rascunho")
        .order("data_publicacao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { prevProject, nextProject } = useMemo(() => {
    if (!allProjects || allProjects.length <= 1 || !id) {
      return { prevProject: null, nextProject: null };
    }
    const currentIndex = allProjects.findIndex((p) => p.id === id);
    if (currentIndex === -1) {
      return { prevProject: null, nextProject: allProjects[0] };
    }
    const prevIdx = (currentIndex - 1 + allProjects.length) % allProjects.length;
    const nextIdx = (currentIndex + 1) % allProjects.length;
    return {
      prevProject: allProjects.length > 2 ? allProjects[prevIdx] : null,
      nextProject: allProjects[nextIdx],
    };
  }, [allProjects, id]);

  const rawGallery = project?.galeria || (project as any)?.galeria_imagens;
  const galleryImages: string[] = useMemo(() => {
    return Array.isArray(rawGallery) ? rawGallery.filter(Boolean) : [];
  }, [rawGallery]);

  const allInspectableImages: string[] = useMemo(() => {
    return [
      ...(project?.imagem_capa ? [project.imagem_capa] : []),
      ...galleryImages.filter((url) => url !== project?.imagem_capa),
    ];
  }, [project?.imagem_capa, galleryImages]);

  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleCarouselScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setLightboxIndex(null);
  }, [id]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight" && allInspectableImages.length > 1) {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % allInspectableImages.length : null
        );
      }
      if (e.key === "ArrowLeft" && allInspectableImages.length > 1) {
        setLightboxIndex((prev) =>
          prev !== null
            ? (prev - 1 + allInspectableImages.length) % allInspectableImages.length
            : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, allInspectableImages.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[116px] pb-24 container-editorial animate-pulse">
          <div className="h-5 w-36 bg-card rounded mb-8" />
          <div className="h-10 w-2/3 bg-card rounded mb-4" />
          <div className="h-20 w-full bg-card/60 rounded-xl mb-12" />
          <div className="aspect-[16/9] bg-card rounded-2xl mb-12" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <PageMeta title="Projeto não encontrado — Lucas Evangelista" />
        <Navbar />
        <main className="pt-[130px] pb-24 container-editorial text-center">
          <h1 className="font-display text-3xl font-medium text-foreground mb-4">
            Projeto não encontrado
          </h1>
          <p className="text-muted-foreground mb-8">
            O estudo de caso que você procura não está disponível ou foi removido.
          </p>
          <Link to="/projetos" className="btn-primary">
            <ArrowLeft size={16} />
            <span>Voltar para Projetos</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const caseData = parseCaseStudy(project);
  const cleanTitle = project.titulo.split("—")[0].trim();
  const categoryLabel = formatCategoryLabel(project.categoria);
  const externalUrl = project.link_projeto || (project as any).link_externo;

  const isSocialMedia =
    normalizeCategoryFilter(project.categoria) === "redes-sociais" ||
    categoryLabel.toLowerCase().includes("social") ||
    categoryLabel.toLowerCase().includes("rede");

  const openLightboxForUrl = (url: string) => {
    const idx = allInspectableImages.indexOf(url);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  // Separação das lâminas da galeria:
  // Lâmina 1: Solo ampla (16:10)
  // Lâminas 2 e 3: Par lado a lado (2 colunas)
  // Lâminas 4 a 7: Carrossel horizontal adaptativo
  // Lâminas 8+: Restante em pares ou solos
  const galleryBlocks = (() => {
    const total = galleryImages.length;
    if (total === 0) return { solo1: null, pair1: [], carousel: [], remaining: [] };
    if (total === 1) return { solo1: galleryImages[0], pair1: [], carousel: [], remaining: [] };
    if (total === 2) return { solo1: null, pair1: galleryImages, carousel: [], remaining: [] };
    if (total === 3)
      return { solo1: galleryImages[0], pair1: galleryImages.slice(1, 3), carousel: [], remaining: [] };

    // 4 ou mais imagens: solo1 + pair1 + carousel + remaining
    const solo1 = galleryImages[0];
    const pair1 = galleryImages.slice(1, 3);
    const carouselCount = Math.min(total - 3, 5);
    const carousel = galleryImages.slice(3, 3 + carouselCount);
    const remaining = galleryImages.slice(3 + carouselCount);

    return { solo1, pair1, carousel, remaining };
  })();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`${cleanTitle} — Estudo de Caso | Lucas Evangelista`}
        description={caseData.resumo}
        image={project.imagem_capa || undefined}
      />
      <Navbar />

      <main className="pt-[104px] md:pt-[120px]">
        <article className="container-editorial pb-20 md:pb-28">
          {/* Navegação Voltar */}
          <div className="mb-6 md:mb-8">
            <Link
              to="/projetos"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-200 group-hover:-translate-x-1 text-primary"
              />
              <span>Voltar para Projetos</span>
            </Link>
          </div>

          {/* 1. CABEÇALHO DO ESTUDO DE CASO (Idêntico ao layout de referência) */}
          <header className="mb-10 md:mb-14">
            {/* Linha de Badges e Metadados Editoriais */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-foreground font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {categoryLabel}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary/40 border border-border/60 text-muted-foreground">
                {caseData.cliente}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary/40 border border-border/60 font-mono tabular-nums text-muted-foreground">
                {caseData.ano}
              </span>
              {caseData.metrica && (
                <span className="px-2.5 py-1 rounded-full bg-secondary/40 border border-border/60 text-primary font-medium">
                  {caseData.metrica}
                </span>
              )}
            </div>

            {/* Título Principal Expressivo */}
            <h1
              className="font-display text-foreground font-medium mb-8 text-balance"
              style={{ fontSize: "clamp(32px, 5.2vw, 58px)", lineHeight: 1.05 }}
            >
              {project.titulo}
            </h1>

            {/* Ficha Técnica Superior em 4 Colunas com Divisores Sutis */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-border/80">
              <div>
                <span className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Cliente
                </span>
                <span className="text-[14px] sm:text-[15px] font-medium text-foreground block truncate">
                  {caseData.cliente}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Categoria
                </span>
                <span className="text-[14px] sm:text-[15px] font-medium text-foreground block truncate">
                  {categoryLabel}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Ano
                </span>
                <span className="text-[14px] sm:text-[15px] font-medium text-foreground font-mono tabular-nums">
                  {caseData.ano}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Entregas Principais
                </span>
                <span className="text-[13px] text-foreground block truncate">
                  {caseData.entregaveis.join(" • ") || "Sistema de Identidade Visual • Brandbook & Diretrizes"}
                </span>
              </div>
            </div>
          </header>

          {/* 2. HERO PANORÂMICO (Capa Principal em Alta Definição com Zoom) */}
          {project.imagem_capa && (
            <figure className="mb-14 md:mb-20">
              <div
                onClick={() => openLightboxForUrl(project.imagem_capa!)}
                className="group relative rounded-2xl overflow-hidden border border-border/80 bg-card cursor-zoom-in shadow-2xl shadow-black/30"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightboxForUrl(project.imagem_capa!);
                  }
                }}
                aria-label={`Ampliar apresentação de ${cleanTitle}`}
              >
                <div className="aspect-[16/10] sm:aspect-[16/9] w-full relative overflow-hidden bg-secondary/40">
                  <img
                    src={project.imagem_capa}
                    alt={`Apresentação principal do projeto ${cleanTitle}`}
                    width={1400}
                    height={840}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 right-4 rounded-full bg-background/85 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-mono text-foreground inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={13} className="text-primary" />
                    <span>Ampliar imagem</span>
                  </div>
                </div>
              </div>
            </figure>
          )}

          {/* 3. MASTER TWO-COLUMN LAYOUT: NARRATIVA E GALERIA À ESQUERDA, SIDEBAR FIXO À DIREITA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* COLUNA PRINCIPAL (Narrativa Estruturada + Galeria de Desdobramentos) */}
            <div className="lg:col-span-8 space-y-10 md:space-y-14 min-w-0">
              {/* Contexto do Projeto */}
              <section>
                <div className="section-label mb-3 text-xs uppercase tracking-wider font-mono">
                  <span className="label-num text-[#EF4444]">01.</span> Contexto do Projeto
                </div>
                <p className="text-foreground text-[18px] sm:text-[20px] md:text-[22px] font-medium leading-[1.55]">
                  {caseData.resumo}
                </p>
              </section>

              {/* Card 02: O Desafio */}
              <section className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-md">
                <div className="text-[13px] font-mono text-[#EF4444] font-medium mb-3 flex items-center gap-2">
                  <span>02.</span>
                  <span>O Desafio</span>
                </div>
                <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.7]">
                  {caseData.desafio}
                </p>
              </section>

              {/* Card 03: Direção Criativa & Solução */}
              <section className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-md">
                <div className="text-[13px] font-mono text-[#EF4444] font-medium mb-3 flex items-center gap-2">
                  <span>03.</span>
                  <span>Direção Criativa & Solução</span>
                </div>
                <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.7]">
                  {caseData.solucao}
                </p>
              </section>

              {/* Card 04: Resultados Comprovados */}
              <section className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-md">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-[13px] font-mono text-[#EF4444] font-medium flex items-center gap-2">
                    <span>04.</span>
                    <span>Resultados Comprovados</span>
                  </div>
                  <span className="text-xs font-mono text-primary font-medium">
                    {categoryLabel}
                  </span>
                </div>
                <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.7]">
                  {caseData.resultado}
                </p>
              </section>

              {/* 4. GALERIA DE DESDOBRAMENTOS VISUAIS (Integrada na Coluna Principal) */}
              {galleryImages.length > 0 && (
                <section className="pt-8 border-t border-border/80 space-y-8">
                  {/* Cabeçalho da Galeria */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <div className="section-label mb-2 text-xs uppercase tracking-wider font-mono">
                        <span className="label-num text-[#EF4444]">Galeria.</span> Desdobramentos Visuais
                      </div>
                      <h2 className="font-display text-[24px] sm:text-[28px] font-medium text-foreground">
                        Aplicações da marca.
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Clique nas imagens para ampliar
                    </span>
                  </div>

                  {/* Lâmina 1: Solo Ampla (16:10) */}
                  {galleryBlocks.solo1 && (
                    <figure
                      onClick={() => openLightboxForUrl(galleryBlocks.solo1!)}
                      className="group relative rounded-2xl overflow-hidden border border-border/80 bg-card cursor-zoom-in aspect-[16/10] shadow-lg"
                    >
                      <img
                        src={galleryBlocks.solo1}
                        alt={`${cleanTitle} — Aplicação principal`}
                        width={1240}
                        height={775}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                      <div className="absolute bottom-3.5 right-3.5 rounded-full bg-background/85 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-mono text-foreground inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={12} className="text-primary" />
                        <span>Ampliar</span>
                      </div>
                    </figure>
                  )}

                  {/* Lâminas 2 e 3: Par de Imagens Lado a Lado (2 Colunas) */}
                  {galleryBlocks.pair1.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {galleryBlocks.pair1.map((imgUrl, idx) => (
                        <figure
                          key={idx}
                          onClick={() => openLightboxForUrl(imgUrl)}
                          className="group relative rounded-2xl overflow-hidden border border-border/80 bg-card cursor-zoom-in aspect-[16/10] shadow-md"
                        >
                          <img
                            src={imgUrl}
                            alt={`${cleanTitle} — Aplicação complementar ${idx + 1}`}
                            width={800}
                            height={500}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                          <div className="absolute bottom-3 right-3 rounded-full bg-background/85 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono text-foreground inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn size={12} className="text-primary" />
                            <span>Ampliar</span>
                          </div>
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* Carrossel Horizontal Adaptativo (Especialmente para séries de social media ou branding) */}
                  {galleryBlocks.carousel.length > 0 && (
                    <div className="rounded-2xl border border-border/80 bg-card/30 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
                            {isSocialMedia ? "Série de Redes Sociais" : "Desdobramentos em Série"}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {galleryBlocks.carousel.length} peças
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCarouselScroll("left")}
                            disabled={!canScrollLeft}
                            aria-label="Rolar para esquerda"
                            className="p-2 rounded-lg border border-border bg-card text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCarouselScroll("right")}
                            disabled={!canScrollRight}
                            aria-label="Rolar para direita"
                            className="p-2 rounded-lg border border-border bg-card text-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      <div
                        ref={carouselRef}
                        onScroll={updateScrollButtons}
                        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {galleryBlocks.carousel.map((imgUrl, idx) => (
                          <figure
                            key={idx}
                            onClick={() => openLightboxForUrl(imgUrl)}
                            className={`group relative shrink-0 ${
                              isSocialMedia
                                ? "w-[72vw] sm:w-[260px] aspect-[4/5]"
                                : "w-[82vw] sm:w-[380px] aspect-[16/10]"
                            } rounded-xl overflow-hidden border border-border/80 bg-card cursor-zoom-in snap-start shadow-md`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${cleanTitle} — Lâmina de série ${idx + 1}`}
                              width={600}
                              height={isSocialMedia ? 750 : 375}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.025]"
                            />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                            <div className="absolute bottom-2.5 right-2.5 rounded-full bg-background/85 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-mono text-foreground inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn size={11} className="text-primary" />
                              <span>Ampliar</span>
                            </div>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lâminas Restantes: Alternância Contínua de Pares e Solos */}
                  {galleryBlocks.remaining.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {galleryBlocks.remaining.map((imgUrl, idx) => {
                        const isFullWidth =
                          galleryBlocks.remaining.length % 2 !== 0 &&
                          idx === galleryBlocks.remaining.length - 1;
                        return (
                          <figure
                            key={idx}
                            onClick={() => openLightboxForUrl(imgUrl)}
                            className={`group relative rounded-2xl overflow-hidden border border-border/80 bg-card cursor-zoom-in aspect-[16/10] shadow-md ${
                              isFullWidth ? "sm:col-span-2" : ""
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${cleanTitle} — Aplicação ${idx + 1}`}
                              width={800}
                              height={500}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                            <div className="absolute bottom-3 right-3 rounded-full bg-background/85 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono text-foreground inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn size={12} className="text-primary" />
                              <span>Ampliar</span>
                            </div>
                          </figure>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* SIDEBAR FIXO NA LATERAL (Permanece sticky durante toda a rolagem da página) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6 self-start">
              {/* Card 1: Entregas do Projeto */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-sm shadow-md">
                <h3 className="font-display text-[16px] sm:text-[17px] font-medium text-foreground mb-4">
                  Entregas do Projeto
                </h3>
                <ul className="space-y-3">
                  {caseData.entregaveis.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[14px] text-foreground/90">
                      <span className="text-primary mt-0.5 text-xs font-bold select-none">✔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2: Ficha Técnica */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-sm shadow-md">
                <h3 className="font-display text-[16px] sm:text-[17px] font-medium text-foreground mb-4">
                  Ficha Técnica
                </h3>
                <dl className="divide-y divide-border/60 text-[13px]">
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground font-mono">Cliente</dt>
                    <dd className="font-medium text-foreground truncate max-w-[170px]">
                      {caseData.cliente}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground font-mono">Especialidade</dt>
                    <dd className="font-medium text-foreground truncate max-w-[170px]">
                      {categoryLabel}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground font-mono">Ano</dt>
                    <dd className="font-medium text-foreground font-mono tabular-nums">
                      {caseData.ano}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground font-mono">Direção Criativa</dt>
                    <dd className="font-medium text-foreground">Lucas Evangelista</dd>
                  </div>
                </dl>
              </div>

              {/* Card 3: CTA Destacado com Gradiente e Botão Chamativo */}
              <div className="rounded-2xl border border-[#F97316]/40 bg-gradient-to-b from-[#F97316]/15 via-card/80 to-card p-6 sm:p-7 shadow-xl shadow-black/20 relative overflow-hidden">
                <h3 className="font-display text-[17px] sm:text-[18px] font-medium text-foreground leading-[1.25] mb-2.5">
                  Busca um trabalho semelhante para sua marca?
                </h3>
                <p className="text-[13.5px] text-muted-foreground leading-[1.6] mb-5">
                  Vamos conversar sobre como aplicar essa mesma direção estratégica ao seu negócio.
                </p>

                <button
                  type="button"
                  onClick={() => openContactDrawer(categoryLabel)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#F97316]/20 group"
                >
                  <span>Solicitar projeto semelhante</span>
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openContactDrawer(categoryLabel)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 block"
                >
                  Ou abrir mensagem de contato
                </button>
              </div>

              {/* Link Externo Opcional no Sidebar */}
              {externalUrl && (
                <div>
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full justify-center group text-xs"
                  >
                    <span>Visitar projeto publicado</span>
                    <ExternalLink
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              )}
            </aside>
          </div>

          {/* 5. NAVEGAÇÃO ENTRE ESTUDOS DE CASO (Anterior / Próximo) */}
          {nextProject && nextProject.id !== project.id && (
            <section className="pt-16 mt-16 md:mt-24 border-t border-border">
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="section-label text-xs uppercase tracking-wider font-mono">
                  <span className="label-num text-primary">05.</span> Continue explorando o portfólio
                </span>
                <Link
                  to="/projetos"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Ver todos os projetos →
                </Link>
              </div>

              <div
                className={`grid grid-cols-1 ${
                  prevProject && prevProject.id !== nextProject.id
                    ? "md:grid-cols-2"
                    : "md:grid-cols-1"
                } gap-6`}
              >
                {prevProject && prevProject.id !== nextProject.id && (
                  <Link
                    to={`/projetos/${prevProject.id}`}
                    className="group rounded-2xl border border-border bg-[#141518] p-4 sm:p-5 flex items-center gap-4 sm:gap-5 hover:border-primary/40 transition-all"
                  >
                    <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                      {prevProject.imagem_capa && (
                        <img
                          src={prevProject.imagem_capa}
                          alt={prevProject.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-1">
                        <ArrowLeft size={12} className="text-primary" />
                        Estudo anterior
                      </span>
                      <span className="text-xs text-primary font-medium block truncate">
                        {formatCategoryLabel(prevProject.categoria)}
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
                        {prevProject.titulo.split("—")[0].trim()}
                      </h3>
                    </div>
                  </Link>
                )}

                <Link
                  to={`/projetos/${nextProject.id}`}
                  className="group rounded-2xl border border-border bg-[#141518] p-4 sm:p-5 flex items-center justify-between gap-4 sm:gap-5 hover:border-primary/40 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-1">
                      Próximo estudo de caso
                      <ArrowUpRight size={13} className="text-primary" />
                    </span>
                    <span className="text-xs text-primary font-medium block truncate">
                      {formatCategoryLabel(nextProject.categoria)}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-medium text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
                      {nextProject.titulo.split("—")[0].trim()}
                    </h3>
                  </div>
                  <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                    {nextProject.imagem_capa && (
                      <img
                        src={nextProject.imagem_capa}
                        alt={nextProject.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && allInspectableImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-10">
              <span className="font-mono text-xs text-muted-foreground tabular-nums bg-card/90 border border-border px-3 py-1.5 rounded-full">
                {cleanTitle} · {lightboxIndex + 1} / {allInspectableImages.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 rounded-full bg-card border border-border text-foreground hover:border-primary transition-colors"
                aria-label="Fechar visualização ampliada"
              >
                <X size={18} />
              </button>
            </div>

            {allInspectableImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + allInspectableImages.length) %
                        allInspectableImages.length
                    );
                  }}
                  className="absolute left-4 md:left-8 p-3 rounded-full bg-card/90 border border-border text-foreground hover:border-primary transition-colors z-10"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % allInspectableImages.length);
                  }}
                  className="absolute right-4 md:right-8 p-3 rounded-full bg-card/90 border border-border text-foreground hover:border-primary transition-colors z-10"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <motion.img
              key={allInspectableImages[lightboxIndex]}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              src={allInspectableImages[lightboxIndex]}
              alt={`${cleanTitle} — Visualização ampliada`}
              className="max-h-[85vh] max-w-[92vw] object-contain rounded-xl border border-border shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
