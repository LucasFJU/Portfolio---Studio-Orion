import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Plus,
  Star,
  Eye,
  Copy,
  Trash2,
  Pencil,
  FileSpreadsheet,
  Search,
  ArrowUp,
  ArrowDown,
  Inbox,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  parseCaseStudy,
  formatCategoryLabel,
  normalizeServiceCategory,
  UNIFIED_SERVICE_CATEGORIES,
} from "@/lib/caseStudy";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_OPTIONS = ["Concluído", "Em andamento", "Em breve", "Rascunho"] as const;
const MAX_HOME_FEATURED = 4;

type ProjectRow = {
  id: string;
  titulo: string;
  categoria: string;
  imagem_capa: string | null;
  destaque: boolean | null;
  status: string | null;
  descricao: string | null;
  tags: string[] | null;
  link_projeto: string | null;
  galeria: string[] | null;
  data_publicacao: string | null;
};

const statusBadgeClass = (status: string | null) => {
  switch (status) {
    case "Concluído":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "Em andamento":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "Rascunho":
      return "bg-secondary text-muted-foreground border border-border";
    case "Em breve":
      return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    default:
      return "bg-secondary text-muted-foreground border border-border";
  }
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "destaques" | "rascunhos" | string>("all");
  const [toDelete, setToDelete] = useState<ProjectRow | null>(null);
  const [featuredOrderIds, setFeaturedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectRow[];
    },
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  const { data: proposals } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, status")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: leadsCount } = useQuery({
    queryKey: ["admin-leads-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const rawOrder = settings?.find((s: any) => s.key === "featured_projects_order")?.value;
    if (rawOrder) {
      try {
        const parsed = JSON.parse(rawOrder);
        if (Array.isArray(parsed)) {
          setFeaturedOrderIds(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, [settings]);

  const saveOrderMutation = useMutation({
    mutationFn: async (nextOrderIds: string[]) => {
      const value = JSON.stringify(nextOrderIds);
      const { data: existing } = await supabase
        .from("site_settings" as any)
        .select("id")
        .eq("key", "featured_projects_order")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_settings" as any)
          .update({ value })
          .eq("key", "featured_projects_order");
      } else {
        await supabase
          .from("site_settings" as any)
          .insert({ key: "featured_projects_order", value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects-home"] });
      toast.success("Ordem dos destaques da Home atualizada!");
    },
  });

  const filtered = projects?.filter((p) => {
    const unifiedCat = normalizeServiceCategory(p.categoria);
    const matchesSearch =
      !search ||
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase()) ||
      unifiedCat.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "destaques") return !!p.destaque;
    if (filter === "rascunhos") return p.status === "Rascunho";
    return unifiedCat === filter || p.categoria === filter;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects-home"] });
      toast.success("Projeto excluído");
      setToDelete(null);
    },
    onError: () => toast.error("Erro ao excluir projeto"),
  });

  const updateField = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProjectRow> }) => {
      const { error } = await supabase.from("projects").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-projects"] });
      const prev = queryClient.getQueryData<ProjectRow[]>(["admin-projects"]);
      queryClient.setQueryData<ProjectRow[]>(["admin-projects"], (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...patch } : p)) || old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin-projects"], ctx.prev);
      toast.error("Erro ao atualizar");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects-home"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (project: ProjectRow) => {
      const { id, ...rest } = project;
      const { error } = await supabase.from("projects").insert({
        ...rest,
        titulo: `${project.titulo} (cópia)`,
        destaque: false,
        status: "Rascunho",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Case duplicado como Rascunho");
    },
    onError: () => toast.error("Erro ao duplicar case"),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pt-[104px]">
        <div className="container-editorial space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-card rounded-lg" />
          <div className="h-32 w-full bg-card rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  const featuredProjectsRaw = (projects || []).filter((p) => p.destaque);
  const featuredProjectsOrdered = [...featuredProjectsRaw].sort((a, b) => {
    const idxA = featuredOrderIds.indexOf(a.id);
    const idxB = featuredOrderIds.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return -1;
    if (idxB === -1) return 1;
    return idxA - idxB;
  });

  const handleToggleFeatured = (project: ProjectRow) => {
    if (!project.destaque && featuredProjectsRaw.length >= MAX_HOME_FEATURED) {
      toast.error(
        `A vitrine da Home comporta até ${MAX_HOME_FEATURED} projetos. Remova um destaque antes de adicionar outro.`
      );
      return;
    }
    const nextDestaque = !project.destaque;
    updateField.mutate({ id: project.id, patch: { destaque: nextDestaque } });

    const currentIds = featuredProjectsOrdered.map((p) => p.id);
    const nextOrder = nextDestaque
      ? [...currentIds.filter((id) => id !== project.id), project.id]
      : currentIds.filter((id) => id !== project.id);
    setFeaturedOrderIds(nextOrder);
    saveOrderMutation.mutate(nextOrder);
  };

  const handleMoveFeatured = (index: number, direction: -1 | 1) => {
    const currentIds = featuredProjectsOrdered.map((p) => p.id);
    const target = index + direction;
    if (target < 0 || target >= currentIds.length) return;
    const next = [...currentIds];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setFeaturedOrderIds(next);
    saveOrderMutation.mutate(next);
  };

  const totalProjects = projects?.length || 0;
  const published = projects?.filter((p) => p.status === "Concluído").length || 0;
  const featured = featuredProjectsRaw.length;
  const totalProposals = proposals?.length || 0;

  const filterChips: { key: string; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "destaques", label: `Projetos selecionados (${featured}/${MAX_HOME_FEATURED})` },
    { key: "rascunhos", label: "Rascunhos" },
    ...UNIFIED_SERVICE_CATEGORIES.map((c) => ({ key: c, label: c })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial pt-[104px] md:pt-[116px] pb-20">
        {/* Editorial Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-border">
          <div>
            <div className="section-label mb-3">
              <span className="label-num">01.</span> Painel de gestão
            </div>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(28px, 3.8vw, 44px)", lineHeight: 1.08 }}
            >
              Projetos e estudos de caso.
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-[56ch]">
              Gerencie o catálogo público, defina a ordem dos até 4 projetos selecionados da Home e acompanhe propostas e orçamentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/orcamentos"
              className="btn-ghost px-4 py-2.5 text-[14px] inline-flex items-center gap-2"
            >
              <Inbox size={15} />
              <span>Orçamentos ({leadsCount || 0})</span>
            </Link>
            <Link
              to="/admin/propostas"
              className="btn-ghost px-4 py-2.5 text-[14px] inline-flex items-center gap-2"
            >
              <FileSpreadsheet size={15} />
              <span>Propostas ({totalProposals})</span>
            </Link>
            <Link
              to="/admin/editor-hero"
              className="btn-outline px-4 py-2.5 text-[14px] inline-flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Sparkles size={15} />
              <span>Editor Hero</span>
            </Link>
            <Link
              to="/admin/projetos/novo?import=behance"
              className="btn-outline px-4 py-2.5 text-[14px] inline-flex items-center gap-2"
            >
              <span>Importar do Behance</span>
            </Link>
            <Link
              to="/admin/projetos/novo"
              className="btn-primary px-5 py-2.5 text-[14px] inline-flex"
            >
              <Plus size={15} />
              <span>Novo case</span>
            </Link>
          </div>
        </div>

        {/* Editorial Metrics Strip */}
        <div data-orion-summary className="rounded-2xl border border-border bg-[#141518] p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-6">
            {[
              { n: totalProjects, l: "Total de cases", sub: "Cadastrados no banco" },
              { n: published, l: "Publicados", sub: "Visíveis em /projetos" },
              {
                n: `${featured}/${MAX_HOME_FEATURED}`,
                l: "Destaques na Home",
                sub: "Pilha interativa (01 a 04)",
              },
              {
                n: leadsCount || 0,
                l: "Orçamentos",
                sub: "Caixa de entrada",
                link: "/admin/orcamentos",
              },
              {
                n: totalProposals,
                l: "Propostas",
                sub: "Links comerciais",
                link: "/admin/propostas",
              },
            ].map((s, idx) => (
              <div
                key={s.l}
                onClick={() => s.link && navigate(s.link)}
                className={`${
                  idx > 0 ? "lg:border-l lg:border-border lg:pl-6" : ""
                } ${s.link ? "cursor-pointer group" : ""}`}
              >
                <div className="font-display text-[30px] md:text-[36px] font-semibold text-foreground leading-none tabular-nums group-hover:text-primary transition-colors">
                  {s.n}
                </div>
                <div className="text-[14px] font-medium text-foreground mt-2">{s.l}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Home Showcase Order Manager (Vitrine da Home 01 a 04) */}
        <div className="rounded-2xl border border-border bg-[#141518] p-6 sm:p-7 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-[17px] font-medium text-foreground flex items-center gap-2">
                <Star size={15} className="text-primary fill-primary" />
                <span>Curadoria e Ordem da Vitrine da Home (01. Projetos selecionados)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Defina a sequência exata em que os cards empilhados aparecem na página inicial (máximo de {MAX_HOME_FEATURED} projetos).
              </p>
            </div>
            <span className="font-mono text-xs text-primary tabular-nums shrink-0">
              {featured} de {MAX_HOME_FEATURED} selecionados
            </span>
          </div>

          {featuredProjectsOrdered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum projeto marcado com estrela. Clique na estrela ao lado de até {MAX_HOME_FEATURED} projetos na tabela abaixo para destacá-los na Home.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {featuredProjectsOrdered.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="rounded-xl border border-border bg-background/80 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-11 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                      {proj.imagem_capa && (
                        <img
                          src={proj.imagem_capa}
                          alt={proj.titulo}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-primary font-semibold block">
                        CARD 0{idx + 1}
                      </span>
                      <h3 className="font-display text-sm font-medium text-foreground truncate">
                        {proj.titulo}
                      </h3>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {formatCategoryLabel(proj.categoria)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border/70">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveFeatured(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-md bg-secondary/70 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        title="Mover para trás"
                      >
                        <ArrowUp size={13} className="-rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveFeatured(idx, 1)}
                        disabled={idx === featuredProjectsOrdered.length - 1}
                        className="p-1.5 rounded-md bg-secondary/70 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        title="Mover para frente"
                      >
                        <ArrowDown size={13} className="-rotate-90" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(proj)}
                      className="text-[11px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remover da Home
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Table Container */}
        <div className="rounded-2xl border border-border bg-[#141518] overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-4">
            <div>
              <h2 className="font-display text-[18px] font-medium text-foreground">
                Catálogo de projetos
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Clique na estrela para marcar ou remover um projeto da vitrine principal da Home (até {MAX_HOME_FEATURED} projetos).
              </p>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar projeto ou frente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-3.5 border-b border-border flex flex-wrap gap-2 bg-background/40">
            {filterChips.map((c) => {
              const active = filter === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFilter(c.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap border ${
                    active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-background/50 text-left">
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border">
                      Projeto / Cliente
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border hidden md:table-cell">
                      Frente de serviço
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border hidden lg:table-cell">
                      Conteúdo do estudo
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-[12px] text-muted-foreground font-medium border-b border-border">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((project) => {
                    const caseData = parseCaseStudy(project);
                    const hasFullCase = !!(caseData.desafio && caseData.estrategia);
                    const unifiedLabel = formatCategoryLabel(project.categoria);

                    return (
                      <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-11 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border">
                              {project.imagem_capa ? (
                                <img
                                  src={project.imagem_capa}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-display">
                                  {project.titulo[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-[15px] font-medium text-foreground flex items-center gap-2">
                                <span className="truncate">{project.titulo}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatured(project)}
                                  title={
                                    project.destaque
                                      ? "Remover de Projetos selecionados na Home"
                                      : "Destacar em Projetos selecionados na Home"
                                  }
                                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                >
                                  <Star
                                    size={14}
                                    className={project.destaque ? "text-primary fill-primary" : ""}
                                  />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mt-0.5">
                                <span>{caseData.cliente}</span>
                                {caseData.metrica && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-primary font-medium tabular-nums">
                                      {caseData.metrica}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-[13px] font-medium text-foreground block">
                            {unifiedLabel}
                          </span>
                          {project.categoria !== unifiedLabel && (
                            <span className="text-[11px] text-muted-foreground">
                              Original: {project.categoria}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-[12px]">
                          {hasFullCase ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Completo (Desafio &amp; Atuação)
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Resumo básico</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <select
                            value={project.status || "Concluído"}
                            onChange={(e) =>
                              updateField.mutate({
                                id: project.id,
                                patch: { status: e.target.value },
                              })
                            }
                            className={`appearance-none cursor-pointer inline-flex px-3 py-1 rounded-md text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary ${statusBadgeClass(
                              project.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-card text-foreground">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <Link
                              to={`/projetos/${project.id}`}
                              title="Ver página pública do case"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/admin/projetos/${project.id}/editar`}
                              title="Editar estudo de caso"
                              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => duplicateMutation.mutate(project)}
                              title="Duplicar case"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setToDelete(project)}
                              title="Excluir case"
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <p className="font-display text-xl font-medium text-foreground mb-2">
                Nenhum projeto encontrado
              </p>
              <p className="text-sm text-muted-foreground mb-7">
                Tente outro filtro ou adicione um novo estudo de caso ao portfólio.
              </p>
              <Link to="/admin/projetos/novo" className="btn-primary inline-flex">
                <Plus size={16} />
                <span>Novo case</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir{" "}
              <strong className="text-foreground">{toDelete?.titulo}</strong>. Esta ação removerá o
              estudo de caso do portfólio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
