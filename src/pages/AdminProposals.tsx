import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Plus,
  Eye,
  Copy,
  Trash2,
  Pencil,
  Link2,
  Check,
  Search,
} from "lucide-react";
import { toast } from "sonner";
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

const PROPOSAL_STATUSES = ["Enviada", "Em análise", "Aprovada", "Rascunho", "Recusada"] as const;

const statusBadgeClass = (status: string | null) => {
  switch (status) {
    case "Aprovada":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "Enviada":
      return "bg-primary/10 text-primary border border-primary/20";
    case "Em análise":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "Recusada":
      return "bg-destructive/10 text-destructive border border-destructive/20";
    default:
      return "bg-secondary text-muted-foreground border border-border";
  }
};

const formatCurrency = (val: number | null) => {
  if (val === null || val === undefined) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
};

const AdminProposals = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const { data: proposalViews } = useQuery({
    queryKey: ["admin-proposal-views"],
    queryFn: async () => {
      const { data } = await supabase.from("proposal_views").select("proposal_id, created_at");
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  const viewCountByProposal: Record<string, number> = {};
  (proposalViews || []).forEach((v) => {
    if (v.proposal_id) {
      viewCountByProposal[v.proposal_id] = (viewCountByProposal[v.proposal_id] || 0) + 1;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      toast.success("Status da proposta atualizado");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (prop: any) => {
      const { id, created_at, updated_at, ...rest } = prop;
      const newSlug = `${prop.slug}-copia-${Math.floor(100 + Math.random() * 900)}`;
      const { error } = await supabase.from("proposals").insert({
        ...rest,
        titulo: `${prop.titulo} (Cópia)`,
        slug: newSlug,
        status: "Rascunho",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      toast.success("Proposta duplicada como Rascunho");
    },
    onError: () => toast.error("Erro ao duplicar proposta"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("proposals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      toast.success("Proposta excluída");
      setToDelete(null);
    },
    onError: () => toast.error("Erro ao excluir proposta"),
  });

  const copyProposalLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/proposta/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link da proposta copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const filtered = proposals?.filter((p) => {
    const matchesSearch =
      !search ||
      p.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente_empresa?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  const totalProposals = proposals?.length || 0;
  const approvedCount = proposals?.filter((p) => p.status === "Aprovada").length || 0;
  const sentCount =
    proposals?.filter((p) => p.status === "Enviada" || p.status === "Em análise").length || 0;
  const totalValue =
    proposals
      ?.filter((p) => p.status !== "Recusada")
      .reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar primaryAction={{ label: "Nova proposta", to: "/admin/propostas/novo" }} />

      <main className="container-editorial pt-[104px] md:pt-[116px] pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-border">
          <div>
            <div className="section-label mb-3">
              <span className="label-num">02.</span> Propostas comerciais
            </div>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(28px, 3.8vw, 44px)", lineHeight: 1.08 }}
            >
              Propostas e seleção de cases.
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-[56ch]">
              Gere links personalizados com escopo, cronograma em 4 etapas e os projetos ideais para cada cliente.
            </p>
          </div>

          <Link
            to="/admin/propostas/novo"
            className="btn-primary px-5 py-2.5 text-[14px] inline-flex shrink-0"
          >
            <Plus size={15} />
            <span>Nova proposta</span>
          </Link>
        </div>

        {/* Summary Strip */}
        <div className="rounded-2xl border border-border bg-[#141518] p-6 sm:p-8 mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { n: totalProposals, l: "Total de propostas", sub: "Cadastradas no painel" },
              { n: sentCount, l: "Em negociação", sub: "Enviadas ou em análise" },
              { n: approvedCount, l: "Aprovadas", sub: "Projetos fechados" },
              {
                n: formatCurrency(totalValue),
                l: "Volume ativo",
                sub: "Soma de propostas ativas",
                isText: true,
              },
            ].map((s, idx) => (
              <div
                key={s.l}
                className={idx > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}
              >
                <div
                  className={`font-display font-semibold text-foreground leading-none tabular-nums ${
                    s.isText ? "text-[22px] md:text-[26px]" : "text-[32px] md:text-[38px]"
                  }`}
                >
                  {s.n}
                </div>
                <div className="text-[14px] font-medium text-foreground mt-2">{s.l}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposals Table */}
        <div className="rounded-2xl border border-border bg-[#141518] overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-4">
            <div>
              <h2 className="font-display text-[18px] font-medium text-foreground">
                Histórico de propostas
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Acompanhe o número de visualizações e copie o link exclusivo de cada cliente.
              </p>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar cliente, empresa ou título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-6 py-3.5 border-b border-border flex flex-wrap gap-2 bg-background/40">
            {[
              { key: "all", label: "Todas" },
              ...PROPOSAL_STATUSES.map((s) => ({ key: s, label: s })),
            ].map((c) => {
              const active = statusFilter === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setStatusFilter(c.key)}
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-background/50 text-left">
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border">
                      Cliente & Proposta
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border hidden md:table-cell">
                      Cases & Aberturas
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border hidden sm:table-cell">
                      Investimento
                    </th>
                    <th className="px-6 py-3.5 text-[12px] text-muted-foreground font-medium border-b border-border">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-[12px] text-muted-foreground font-medium border-b border-border">
                      Link & Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((prop) => {
                    const projectCount = Array.isArray(prop.projeto_ids) ? prop.projeto_ids.length : 0;
                    const viewsCount = viewCountByProposal[prop.id] || 0;
                    return (
                      <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[15px] font-medium text-foreground">
                                {prop.cliente_empresa || prop.cliente_nome}
                              </span>
                              {prop.cliente_empresa && (
                                <span className="text-xs text-muted-foreground">({prop.cliente_nome})</span>
                              )}
                            </div>
                            <div className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1">
                              {prop.titulo}
                            </div>
                            <div className="text-[11px] text-primary font-mono mt-1">
                              /proposta/{prop.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                            <span className="text-foreground font-medium">
                              {projectCount} {projectCount === 1 ? "case" : "cases"}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {viewsCount} {viewsCount === 1 ? "abertura" : "aberturas"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="font-display text-[14px] font-medium text-foreground tabular-nums">
                            {formatCurrency(prop.valor_total)}
                          </div>
                          {prop.prazo_entrega && (
                            <div className="text-[12px] text-muted-foreground">{prop.prazo_entrega}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={prop.status || "Enviada"}
                            onChange={(e) =>
                              updateStatus.mutate({ id: prop.id, status: e.target.value })
                            }
                            className={`appearance-none cursor-pointer inline-flex px-3 py-1 rounded-md text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary ${statusBadgeClass(
                              prop.status
                            )}`}
                          >
                            {PROPOSAL_STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-card text-foreground">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => copyProposalLink(prop.slug, prop.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
                              title="Copiar link para enviar ao cliente"
                            >
                              {copiedId === prop.id ? <Check size={13} /> : <Link2 size={13} />}
                              <span className="hidden lg:inline">
                                {copiedId === prop.id ? "Copiado" : "Copiar link"}
                              </span>
                            </button>
                            <Link
                              to={`/proposta/${prop.slug}`}
                              title="Abrir proposta como cliente"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/admin/propostas/editar/${prop.id}`}
                              title="Editar proposta e cases"
                              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => duplicateMutation.mutate(prop)}
                              title="Duplicar proposta"
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setToDelete(prop)}
                              title="Excluir proposta"
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
                Nenhuma proposta encontrada
              </p>
              <p className="text-sm text-muted-foreground mb-7 max-w-md mx-auto">
                Crie sua primeira proposta comercial personalizada escolhendo os projetos que cada cliente verá.
              </p>
              <Link to="/admin/propostas/novo" className="btn-primary inline-flex">
                <Plus size={16} />
                <span>Criar nova proposta</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir proposta comercial?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir a proposta de{" "}
              <strong className="text-foreground">
                {toDelete?.cliente_empresa || toDelete?.cliente_nome}
              </strong>
              . O link deixará de funcionar.
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

export default AdminProposals;
