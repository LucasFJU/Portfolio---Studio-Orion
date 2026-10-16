import SectionTransition from "@/components/SectionTransition";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import ProjectCard from "@/components/ProjectCard";
import PageMeta from "@/components/PageMeta";
import { normalizeCategoryFilter } from "@/lib/caseStudy";

const FILTER_OPTIONS = [
  { key: "todos", label: "Todos" },
  { key: "identidade-visual", label: "Identidade visual", queryValue: "Identidade visual" },
  {
    key: "redes-sociais",
    label: "Design para redes sociais",
    queryValue: "Design para redes sociais",
  },
  { key: "sites-interfaces", label: "Sites e interfaces", queryValue: "Sites e interfaces" },
] as const;

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategoryParam = searchParams.get("categoria");
  const activeFilter = normalizeCategoryFilter(rawCategoryParam);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, titulo, descricao, categoria, imagem_capa, tags, data_publicacao")
        .neq("status", "Rascunho")
        .order("data_publicacao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (activeFilter === "todos") return projects;
    return projects.filter((p) => normalizeCategoryFilter(p.categoria) === activeFilter);
  }, [projects, activeFilter]);

  const categoryCounts = useMemo(() => {
    if (!projects) return { todos: 0, "identidade-visual": 0, "redes-sociais": 0, "sites-interfaces": 0 };
    const counts: Record<string, number> = {
      todos: projects.length,
      "identidade-visual": 0,
      "redes-sociais": 0,
      "sites-interfaces": 0,
    };
    projects.forEach((p) => {
      const catKey = normalizeCategoryFilter(p.categoria);
      if (catKey in counts) {
        counts[catKey]++;
      }
    });
    return counts;
  }, [projects]);

  const handleSelectFilter = (option: (typeof FILTER_OPTIONS)[number]) => {
    if (option.key === "todos") {
      searchParams.delete("categoria");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ categoria: option.queryValue }, { replace: true });
    }
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Projetos — Lucas Evangelista"
        description="Seleção de projetos e estudos de caso em identidade visual, design para redes sociais e criação de sites."
      />
      <Navbar />

      <main className="pt-[108px] md:pt-[124px]">
        <section className="container-editorial">
          {/* Header */}
          <div data-orion-reveal className="pb-10 md:pb-12">
            <div className="section-label mb-3">
              <span className="label-num">01.</span> Portfólio completo
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <h1
                className="font-display text-foreground font-medium"
                style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.04 }}
              >
                Projetos selecionados.
              </h1>

              <p className="text-muted-foreground text-[16px] leading-[1.6] max-w-[44ch]">
                Estudos de caso em identidade visual, direção criativa para redes sociais e sites
                desenvolvidos para marcas e negócios.
              </p>
            </div>

            {/* Category Filters */}
            <div
              role="group"
              aria-label="Filtrar projetos por especialidade"
              className="flex flex-wrap items-center gap-2.5 mt-9"
            >
              {FILTER_OPTIONS.map((option) => {
                const isSelected = activeFilter === option.key;
                const count = categoryCounts[option.key] ?? 0;
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelectFilter(option)}
                    className={`rounded-lg px-4 py-2 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/60 text-muted-foreground border border-border hover:text-foreground hover:border-foreground/25"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span
                      className={`font-mono text-xs tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                          : "text-muted-foreground/80 bg-background/50"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </section>
        <SectionTransition sourceColor="#090A0C" destinationColor="#FFFAFA" />
        <section className="orion-surface-light sec-pad">
          <div className="container-editorial">
          {/* Projects Vertical Stream (Uma em baixo da outra com staggered reveal) */}
          {isLoading ? (
            <div className="flex flex-col gap-8 md:gap-12">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-border bg-card/40 overflow-hidden animate-pulse"
                >
                  <div className="lg:col-span-7 aspect-[16/10] bg-secondary/70" />
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="h-4 w-32 bg-secondary rounded" />
                      <div className="h-8 w-3/4 bg-secondary rounded" />
                      <div className="h-4 w-full bg-secondary rounded" />
                      <div className="h-4 w-5/6 bg-secondary rounded" />
                    </div>
                    <div className="h-9 w-44 bg-secondary rounded pt-4 border-t border-border" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="flex flex-col gap-8 md:gap-12">
              {filteredProjects.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: shouldReduceMotion ? 0 : Math.min((index % 3) * 0.12, 0.36),
                  }}
                >
                  <ProjectCard {...p} index={index} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-border rounded-2xl bg-card/30">
              <p className="font-display text-xl font-medium text-foreground mb-2">
                Nenhum projeto encontrado nesta categoria
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Selecione outra especialidade ou visualize todos os estudos de caso.
              </p>
              <button
                type="button"
                onClick={() => handleSelectFilter(FILTER_OPTIONS[0])}
                className="btn-ghost"
              >
                Mostrar todos os projetos
              </button>
            </div>
          )}
          </div>
        </section>
        <SectionTransition sourceColor="#FFFAFA" destinationColor="#090A0C" direction="rise-left" />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
