import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Search,
  Sparkles,
  Trash2,
  Mail,
  Calendar,
  ArrowUpRight,
  Inbox,
  CheckCircle2,
  FileSignature,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatCategoryLabel } from "@/lib/caseStudy";

interface LeadRow {
  id: string;
  nome: string;
  email: string;
  tipo_projeto: string | null;
  assunto: string | null;
  mensagem: string | null;
  created_at: string;
}

const READ_LEADS_STORAGE_KEY = "le_admin_read_leads";

const AdminLeads = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "converted">("all");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(READ_LEADS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LeadRow[];
    },
    enabled: !!user,
  });

  const { data: proposals } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, slug, cliente_nome, cliente_email, titulo, status");
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    try {
      localStorage.setItem(READ_LEADS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const toggleReadStatus = (id: string) => {
    const next = readIds.includes(id)
      ? readIds.filter((item) => item !== id)
      : [...readIds, id];
    setReadIds(next);
    try {
      localStorage.setItem(READ_LEADS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Solicitação removida da caixa de entrada");
    },
    onError: () => toast.error("Não foi possível excluir a solicitação"),
  });

  const findMatchingProposal = (lead: LeadRow) => {
    if (!proposals?.length) return null;
    const cleanEmail = (lead.email || "").trim().toLowerCase();
    const cleanName = (lead.nome || "").trim().toLowerCase();
    return proposals.find(
      (p) =>
        (cleanEmail && (p.cliente_email || "").trim().toLowerCase() === cleanEmail) ||
        (cleanName && (p.cliente_nome || "").trim().toLowerCase() === cleanName)
    );
  };

  const handleGenerateProposal = (lead: LeadRow) => {
    markAsRead(lead.id);
    const params = new URLSearchParams();
    if (lead.nome) params.set("leadName", lead.nome);
    if (lead.email) params.set("leadEmail", lead.email);
    if (lead.tipo_projeto) params.set("leadService", formatCategoryLabel(lead.tipo_projeto));
    if (lead.mensagem) params.set("leadMessage", lead.mensagem);
    navigate(`/admin/propostas/novo?${params.toString()}`);
  };

  const copyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    toast.success("E-mail copiado!");
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  if (authLoading || !user) return null;

  const totalLeads = leads?.length || 0;
  const unreadCount = (leads || []).filter((l) => !readIds.includes(l.id)).length;
  const convertedCount = (leads || []).filter((l) => !!findMatchingProposal(l)).length;

  const filteredLeads = (leads || []).filter((lead) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      lead.nome?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      (lead.mensagem || "").toLowerCase().includes(q) ||
      (lead.tipo_projeto || "").toLowerCase().includes(q);

    const normalizedCategory = lead.tipo_projeto
      ? formatCategoryLabel(lead.tipo_projeto)
      : "Não especificado";
    const matchesCategory =
      categoryFilter === "all" || normalizedCategory === categoryFilter;

    const isUnread = !readIds.includes(lead.id);
    const hasProposal = !!findMatchingProposal(lead);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && isUnread) ||
      (statusFilter === "converted" && hasProposal);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial pt-[104px] md:pt-[116px] pb-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-border">
          <div>
            <div className="section-label mb-3">
              <span className="label-num">02.</span> Caixa de Entrada Comercial
            </div>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(26px, 3.6vw, 42px)", lineHeight: 1.08 }}
            >
              Solicitações de orçamento.
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-[60ch]">
              Acompanhe todos os contatos enviados pelo site e transforme qualquer pedido em uma proposta comercial personalizada em 1 clique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/propostas/novo"
              className="btn-outline px-5 py-3 text-[14px] inline-flex items-center gap-2"
            >
              <FileSignature size={16} />
              <span>Proposta em branco</span>
            </Link>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`text-left bg-[#141518] border rounded-2xl p-6 transition-colors ${
              statusFilter === "all"
                ? "border-primary/50"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
              Total recebido
            </span>
            <p className="font-mono text-3xl font-semibold text-foreground tabular-nums">
              {totalLeads}
            </p>
            <span className="text-xs text-muted-foreground mt-1 block">
              Pedidos registrados pelo formulário
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "unread" ? "all" : "unread")}
            className={`text-left bg-[#141518] border rounded-2xl p-6 transition-colors ${
              statusFilter === "unread"
                ? "border-primary/50"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
              Novos / Não lidos
            </span>
            <p className="font-mono text-3xl font-semibold text-primary tabular-nums">
              {unreadCount}
            </p>
            <span className="text-xs text-muted-foreground mt-1 block">
              Aguardando análise ou resposta
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "converted" ? "all" : "converted")}
            className={`text-left bg-[#141518] border rounded-2xl p-6 transition-colors ${
              statusFilter === "converted"
                ? "border-primary/50"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
              Com proposta gerada
            </span>
            <p className="font-mono text-3xl font-semibold text-emerald-400 tabular-nums">
              {convertedCount}
            </p>
            <span className="text-xs text-muted-foreground mt-1 block">
              Convertidos em proposta comercial
            </span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou necessidade..."
              className="w-full bg-[#141518] border border-border rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Todas as frentes" },
              { id: "Identidade visual", label: "Identidade visual" },
              { id: "Design para redes sociais", label: "Design para redes sociais" },
              { id: "Sites e interfaces", label: "Sites e interfaces" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  categoryFilter === cat.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-[#141518] text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-40 rounded-2xl bg-[#141518] border border-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-[#141518] border border-border rounded-2xl p-12 text-center">
            <Inbox size={32} className="mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-lg font-medium text-foreground mb-1">
              Nenhuma solicitação encontrada
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Quando um visitante enviar o formulário da página de Contato ou da gaveta lateral de orçamento, o pedido aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => {
              const isUnread = !readIds.includes(lead.id);
              const matchedProposal = findMatchingProposal(lead);
              const serviceLabel = lead.tipo_projeto
                ? formatCategoryLabel(lead.tipo_projeto)
                : "Frente geral";
              const formattedDate = new Date(lead.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={lead.id}
                  onClick={() => markAsRead(lead.id)}
                  className={`bg-[#141518] border rounded-2xl p-6 md:p-7 transition-all duration-200 ${
                    isUnread
                      ? "border-primary/45 shadow-[0_12px_36px_-18px_rgba(255,64,1,0.22)]"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left Info */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {isUnread && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary font-mono text-[11px] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Novo pedido
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-md bg-background border border-border font-mono text-[11px] text-foreground/85">
                          {serviceLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
                          <Calendar size={12} />
                          {formattedDate}
                        </span>
                        {matchedProposal && (
                          <Link
                            to={`/proposta/${matchedProposal.slug}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] hover:bg-emerald-500/15 transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            <span>Proposta: {matchedProposal.status}</span>
                            <ArrowUpRight size={11} />
                          </Link>
                        )}
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-medium text-foreground">
                          {lead.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail size={13} />
                            <span>{lead.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyEmail(lead.id, lead.email);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedEmailId === lead.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copiar e-mail</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {lead.mensagem && (
                        <div className="bg-background/70 border border-border/80 rounded-xl p-4 mt-3">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
                            Contexto enviado pelo cliente
                          </span>
                          <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-line">
                            {lead.mensagem}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div
                      className="flex flex-wrap lg:flex-col items-stretch sm:items-end justify-end gap-2.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleGenerateProposal(lead)}
                        className="btn-primary px-5 py-3 text-[13px] inline-flex items-center justify-center gap-2"
                      >
                        <Sparkles size={15} />
                        <span>
                          {matchedProposal ? "Gerar nova proposta" : "Gerar Proposta em 1 Clique"}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReadStatus(lead.id)}
                          className="px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isUnread ? "Marcar como lido" : "Marcar como não lido"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remover a solicitação de "${lead.nome}" da caixa de entrada?`
                              )
                            ) {
                              deleteMutation.mutate(lead.id);
                            }
                          }}
                          className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                          title="Excluir solicitação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLeads;
