import ResponsiveImage from "@/components/ResponsiveImage";
import { useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { STACK_DESKTOP_MIN_WIDTH } from "@/lib/gsap";
import { parseCaseStudy, formatCategoryLabel } from "@/lib/caseStudy";
import { ScrollRevealTitle } from "./ScrollRevealTitle";

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const StackedProjects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardSlidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardOverlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= STACK_DESKTOP_MIN_WIDTH : true
  );

  const { data: projects, isLoading } = useQuery({
    queryKey: ["featured-projects-home"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const [{ data: featuredData, error: featuredError }, { data: orderSetting }] =
        await Promise.all([
          supabase
            .from("projects")
            .select("id, titulo, descricao, categoria, imagem_capa, tags, data_publicacao, destaque")
            .eq("destaque", true)
            .neq("status", "Rascunho")
            .order("data_publicacao", { ascending: false }),
          supabase
            .from("site_settings" as any)
            .select("value")
            .eq("key", "featured_projects_order")
            .maybeSingle(),
        ]);

      if (featuredError) throw featuredError;

      let orderIds: string[] = [];
      if ((orderSetting as any)?.value) {
        try {
          const parsed = JSON.parse((orderSetting as any).value);
          if (Array.isArray(parsed)) orderIds = parsed;
        } catch {
          // ignore
        }
      }

      const sortByCustomOrder = (list: any[]) => {
        if (!orderIds.length) return list;
        return [...list].sort((a, b) => {
          const idxA = orderIds.indexOf(a.id);
          const idxB = orderIds.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          // Any newly added featured project not yet in orderIds goes FIRST so it is immediately visible on Home
          if (idxA === -1) return -1;
          if (idxB === -1) return 1;
          return idxA - idxB;
        });
      };

      const featuredList = sortByCustomOrder(featuredData || []);
      if (featuredList.length >= 3) {
        return featuredList.slice(0, 4);
      }

      const { data: allData, error: allError } = await supabase
        .from("projects")
        .select("id, titulo, descricao, categoria, imagem_capa, tags, data_publicacao, destaque")
        .neq("status", "Rascunho")
        .order("data_publicacao", { ascending: false })
        .limit(6);

      if (allError) return featuredList;

      const combined = [...featuredList];
      for (const item of allData || []) {
        if (!combined.some((p) => p.id === item.id) && combined.length < 4) {
          combined.push(item);
        }
      }
      return combined;
    },
  });

  const displayedProjects = (projects || []).slice(0, 4);
  const totalCards = displayedProjects.length;

  const applyStackTransforms = useCallback(
    (progress: number, desktopMode: boolean) => {
      const cards = cardSlidesRef.current;
      const overlays = cardOverlaysRef.current;

      if (!desktopMode || totalCards <= 1) {
        for (let i = 0; i < totalCards; i++) {
          const card = cards[i];
          const overlay = overlays[i];
          if (card) {
            card.style.transform = "none";
            card.style.opacity = "1";
            card.style.pointerEvents = "auto";
          }
          if (overlay) {
            overlay.style.opacity = "0";
          }
        }
        return;
      }

      const segments = totalCards - 1;
      const stagePos = clamp(progress, 0, 1) * segments;
      const currentActive = clamp(Math.round(stagePos), 0, totalCards - 1);
      setActiveCardIndex((prev) => (prev !== currentActive ? currentActive : prev));

      for (let i = 0; i < totalCards; i++) {
        const card = cards[i];
        const overlay = overlays[i];
        if (!card) continue;

        if (i === 0) {
          // Base card stays flush at y=0, scale=1 so the incoming card covers it 100% cleanly
          const buriedDepth = clamp(stagePos, 0, totalCards - 1);
          const dimOpacity = clamp(buriedDepth * 0.75, 0, 0.9);

          card.style.transform = "translate3d(0px, 0px, 0px) scale(1)";
          // Completely hide once covered by next card to prevent any ghost borders/tips
          card.style.opacity = stagePos >= 1.05 ? "0" : "1";
          card.style.pointerEvents = stagePos < 0.5 ? "auto" : "none";
          if (overlay) overlay.style.opacity = dimOpacity.toFixed(3);
        } else {
          const entranceRaw = stagePos - (i - 1);

          if (entranceRaw <= 0) {
            // Waiting below stage
            card.style.transform = "translate3d(0px, 105%, 0px) scale(1)";
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
            if (overlay) overlay.style.opacity = "0";
          } else if (entranceRaw < 1) {
            // Sliding up smoothly into exact y=0
            const eased = easeInOutCubic(clamp(entranceRaw, 0, 1));
            const yPercent = (1 - eased) * 105;
            const fadeOpacity = clamp(entranceRaw * 3.5, 0, 1);

            card.style.transform = `translate3d(0px, ${yPercent.toFixed(2)}%, 0px) scale(1)`;
            card.style.opacity = fadeOpacity.toFixed(3);
            card.style.pointerEvents = entranceRaw >= 0.5 ? "auto" : "none";
            if (overlay) overlay.style.opacity = "0";
          } else {
            // Landed flush at y=0, scale=1 (NEVER translates up to negative Y)
            const buriedDepth = clamp(stagePos - i, 0, totalCards - 1);
            const dimOpacity = clamp(buriedDepth * 0.75, 0, 0.9);

            card.style.transform = "translate3d(0px, 0px, 0px) scale(1)";
            card.style.opacity = buriedDepth >= 1.05 ? "0" : "1";
            card.style.pointerEvents = buriedDepth < 0.5 ? "auto" : "none";
            if (overlay) overlay.style.opacity = dimOpacity.toFixed(3);
          }
        }
      }
    },
    [totalCards]
  );

  useEffect(() => {
    if (isLoading || totalCards === 0) return;

    let rafId: number | null = null;
    let targetProgress = 0;
    let currentProgress = 0;
    let isRunning = false;

    const desktopMode = window.innerWidth >= STACK_DESKTOP_MIN_WIDTH;
    setIsDesktop(desktopMode);

    const tick = () => {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0004) {
        currentProgress += diff * 0.14;
        applyStackTransforms(currentProgress, window.innerWidth >= STACK_DESKTOP_MIN_WIDTH);
        rafId = window.requestAnimationFrame(tick);
      } else {
        currentProgress = targetProgress;
        applyStackTransforms(currentProgress, window.innerWidth >= STACK_DESKTOP_MIN_WIDTH);
        isRunning = false;
        rafId = null;
      }
    };

    const updateFromScroll = () => {
      const isDesk = window.innerWidth >= STACK_DESKTOP_MIN_WIDTH;
      setIsDesktop((prev) => (prev !== isDesk ? isDesk : prev));

      const section = sectionRef.current;
      if (!section || !isDesk || totalCards <= 1) {
        applyStackTransforms(0, false);
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 1) {
        targetProgress = 0;
        currentProgress = 0;
        applyStackTransforms(0, isDesk);
        return;
      }

      const rawProgress = -rect.top / scrollableDistance;
      targetProgress = clamp(rawProgress, 0, 1);

      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    updateFromScroll();

    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [isLoading, totalCards, applyStackTransforms]);

  const scrollToCard = (targetIndex: number) => {
    const section = sectionRef.current;
    if (!section || totalCards <= 1) return;

    const clampedIndex = clamp(targetIndex, 0, totalCards - 1);
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableDistance = section.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const targetProgress = clampedIndex / (totalCards - 1);
    const targetScrollY = sectionTop + targetProgress * scrollableDistance;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  };

  const desktopRunwayHeight =
    isDesktop && totalCards > 1 ? `${100 + (totalCards - 1) * 60}vh` : undefined;

  return (
    <section
      ref={sectionRef}
      className="bg-background relative"
      style={{ height: desktopRunwayHeight }}
    >
      {/* Sticky viewport stage with safe top padding so fixed Navbar never overlaps */}
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center py-12 lg:pt-[88px] lg:pb-6 overflow-hidden">
        <div className="container-editorial w-full">
          {/* Shared editorial heading: label, title and supporting copy stay in one column. */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 lg:mb-7">
            <div className="min-w-0">
              <p className="mb-5 text-xs tracking-wide text-muted-foreground">
                <span className="mr-3 font-mono text-primary">01.</span>Portfólio em destaque
              </p>

              <ScrollRevealTitle
                as="h2"
                text="Projetos selecionados."
                className="text-[36px] font-medium leading-[1.1] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]"
              />
              <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-muted-foreground">Role para navegar pelos cases em destaque.</p>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 shrink-0">

              {totalCards > 1 && (
                <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-[#141518] p-1.5 pl-3.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {displayedProjects.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => scrollToCard(idx)}
                        aria-label={`Ir para projeto ${idx + 1}`}
                        className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-current={activeCardIndex === idx ? "true" : undefined}
                      >
                        <span aria-hidden="true" className={`block h-2 rounded-full transition-all duration-300 ${
                          activeCardIndex === idx
                            ? "w-6 bg-primary"
                            : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                        />
                      </button>
                    ))}
                  </div>

                  <span className="mx-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                    0{activeCardIndex + 1} / 0{totalCards}
                  </span>

                  <div className="flex items-center gap-0.5 border-l border-border pl-1">
                    <button
                      type="button"
                      onClick={() => scrollToCard(activeCardIndex - 1)}
                      disabled={activeCardIndex === 0}
                      aria-label="Projeto anterior"
                      className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToCard(activeCardIndex + 1)}
                      disabled={activeCardIndex === totalCards - 1}
                      aria-label="Próximo projeto"
                      className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              <Link
                to="/projetos"
                className="btn-ghost px-4 py-2 text-[13px] sm:text-[14px] group shrink-0 whitespace-nowrap"
              >
                <span>Ver todos</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Stage Area — Adaptive height via clamp() so 13" laptops and 27" monitors both fit 100% cleanly */}
          {isLoading ? (
            <div className="h-[380px] lg:h-[clamp(300px,calc(100vh-330px),440px)] bg-card rounded-2xl border border-border animate-pulse" />
          ) : totalCards > 0 ? (
            <div className="relative pt-5 lg:h-[clamp(320px,calc(100vh-310px),465px)] space-y-8 lg:space-y-0">
              {displayedProjects.map((project, index) => {
                const caseData = parseCaseStudy(project);
                const categoryLabel = formatCategoryLabel(project.categoria);
                const cleanTitle = project.titulo.split("—")[0].trim();

                return (
                  <div
                    key={project.id}
                    ref={(el) => {
                      cardSlidesRef.current[index] = el;
                    }}
                    className="lg:absolute lg:inset-x-0 lg:top-5 origin-top will-change-transform"
                    style={{ zIndex: index + 1 }}
                  >
                    <article className="relative rounded-2xl border border-white/[0.12] bg-[#141518] overflow-hidden shadow-[0_-12px_48px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-primary/40">
                      {/* GPU-composited depth dimming overlay */}
                      <div
                        ref={(el) => {
                          cardOverlaysRef.current[index] = el;
                        }}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20 bg-[#090A0C] opacity-0"
                      />

                      <Link
                        to={`/projetos/${project.id}`}
                        className="group grid grid-cols-1 lg:grid-cols-12 items-stretch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:h-[clamp(300px,calc(100vh-335px),440px)] bg-secondary relative overflow-hidden">
                          {project.imagem_capa ? (
                            <ResponsiveImage
                              src={project.imagem_capa}
                              alt={project.titulo}
                              width={900}
                              height={560}
                              loading="lazy" sizes="(min-width: 1360px) 700px, (min-width: 1024px) 58vw, 100vw"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground font-display text-lg">
                              {cleanTitle}
                            </div>
                          )}

                          {caseData.metrica && (
                            <div className="absolute top-4 left-4 rounded-full bg-[#090A0C]/85 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-[12px] font-medium text-foreground">
                              {caseData.metrica}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-6 xl:p-8 flex flex-col justify-between bg-[#141518] lg:h-[clamp(300px,calc(100vh-335px),440px)]">
                          <div>
                            <div className="flex items-center justify-between gap-3 text-[12px] sm:text-[13px] text-muted-foreground mb-3">
                              <span className="text-primary font-medium">{categoryLabel}</span>
                              <span className="font-mono tabular-nums text-xs text-muted-foreground">
                                PROJETO 0{index + 1} / 0{totalCards}
                              </span>
                            </div>

                            <h3 className="font-display text-[24px] sm:text-[28px] xl:text-[32px] font-medium text-foreground leading-[1.1] mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {cleanTitle}
                            </h3>

                            <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-[1.6] line-clamp-3">
                              {caseData.resumo}
                            </p>

                            {caseData.entregaveis && caseData.entregaveis.length > 0 && (
                              <div className="mt-4 xl:mt-5 flex flex-wrap gap-1.5">
                                {caseData.entregaveis.slice(0, 3).map((item) => (
                                  <span
                                    key={item}
                                    className="text-[11px] sm:text-[12px] text-foreground/80 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-medium text-foreground group-hover:text-primary transition-colors">
                              <span>Ver estudo de caso completo</span>
                              <ArrowUpRight
                                size={17}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-border rounded-2xl bg-card/40">
              <p className="font-display text-lg font-medium text-foreground mb-1">
                Nenhum projeto em destaque no momento
              </p>
              <p className="text-sm text-muted-foreground">
                Explore o catálogo completo na página de projetos.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StackedProjects;
