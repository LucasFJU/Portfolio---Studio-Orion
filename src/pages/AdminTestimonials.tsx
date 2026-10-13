import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Quote,
  MoveUp,
  MoveDown,
  Layers,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { TestimonialItem } from "@/components/TestimonialsSection";

interface FormState {
  id?: string;
  autor: string;
  cargo: string;
  empresa: string;
  depoimento: string;
  destaque_frase: string;
  nota: number;
  avatar_url: string;
  categoria: string;
  fileira: "top" | "bottom";
  ativo: boolean;
  ordem: number;
}

const EMPTY_FORM: FormState = {
  autor: "",
  cargo: "",
  empresa: "",
  depoimento: "",
  destaque_frase: "",
  nota: 5,
  avatar_url: "",
  categoria: "Identidade Visual",
  fileira: "top",
  ativo: true,
  ordem: 0,
};

const CATEGORIES = [
  "Identidade Visual",
  "Social Media",
  "Web Design",
  "UI/UX & Interfaces",
  "Branding & Embalagens",
  "Direção de Arte",
];

const AdminTestimonials = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterFileira, setFilterFileira] = useState<"all" | "top" | "bottom">("all");

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials" as any)
        .select("*")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data as TestimonialItem[]) || [];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      setSaving(true);
      const isEditing = !!payload.id;

      const record = {
        autor: payload.autor.trim(),
        cargo: payload.cargo.trim(),
        empresa: payload.empresa.trim(),
        depoimento: payload.depoimento.trim(),
        destaque_frase: payload.destaque_frase.trim() || null,
        nota: Number(payload.nota) || 5,
        avatar_url: payload.avatar_url.trim() || null,
        categoria: payload.categoria.trim() || null,
        fileira: payload.fileira,
        ativo: payload.ativo,
        ordem: payload.ordem || testimonials.length + 1,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from("testimonials" as any)
          .update(record)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("testimonials" as any)
          .insert({
            ...record,
            id: `test-${Date.now()}`,
            created_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(formData.id ? "Depoimento atualizado com sucesso!" : "Depoimento cadastrado!");
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      setSaving(false);
    },
    onError: (err: any) => {
      toast.error(`Erro ao salvar: ${err.message}`);
      setSaving(false);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("testimonials" as any)
        .update({ ativo, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => {
      toast.error(`Erro ao alterar status: ${err.message}`);
    },
  });

  const switchFileiraMutation = useMutation({
    mutationFn: async ({ id, fileira }: { id: string; fileira: "top" | "bottom" }) => {
      const { error } = await supabase
        .from("testimonials" as any)
        .update({ fileira, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Fileira do carrossel alterada!");
    },
    onError: (err: any) => {
      toast.error(`Erro ao alterar fileira: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("testimonials" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Depoimento excluído!");
    },
    onError: (err: any) => {
      toast.error(`Erro ao excluir: ${err.message}`);
    },
  });

  const handleOpenCreate = () => {
    setFormData({
      ...EMPTY_FORM,
      ordem: testimonials.length + 1,
      fileira: testimonials.filter((t) => t.fileira === "top").length <= testimonials.filter((t) => t.fileira === "bottom").length ? "top" : "bottom",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setFormData({
      id: item.id,
      autor: item.autor,
      cargo: item.cargo,
      empresa: item.empresa,
      depoimento: item.depoimento,
      destaque_frase: item.destaque_frase || "",
      nota: item.nota || 5,
      avatar_url: item.avatar_url || "",
      categoria: item.categoria || "Identidade Visual",
      fileira: (item.fileira as "top" | "bottom") || "top",
      ativo: item.ativo ?? true,
      ordem: item.ordem || 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.autor.trim() || !formData.depoimento.trim()) {
      toast.error("Preencha ao menos o nome do autor e o texto do depoimento.");
      return;
    }
    saveMutation.mutate(formData);
  };

  const topCount = testimonials.filter((t) => t.fileira === "top" && t.ativo !== false).length;
  const bottomCount = testimonials.filter((t) => t.fileira === "bottom" && t.ativo !== false).length;
  const totalActive = testimonials.filter((t) => t.ativo !== false).length;

  const filteredTestimonials = testimonials.filter((t) => {
    if (filterFileira === "top") return t.fileira === "top";
    if (filterFileira === "bottom") return t.fileira === "bottom";
    return true;
  });

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#07080A] text-foreground pb-24">
      <AdminNavbar />

      <main className="max-w-[1180px] mx-auto px-4 md:px-6 pt-28">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/[0.08] mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Painel Admin · Seção 05</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Gerenciar Depoimentos
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-[65ch]">
              Controle os depoimentos exibidos no carrossel duplo da Home. Ajuste textos, destaques, categorias e a fileira de rolagem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/#depoimentos"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-white px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors"
            >
              <Eye size={14} />
              <span>Ver na Home</span>
            </a>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-[#ff551a] text-white text-xs font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(255,64,1,0.25)]"
            >
              <Plus size={16} />
              <span>Novo Depoimento</span>
            </button>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-white/[0.06] bg-[#0E1013] p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-mono">TOTAL ATIVOS</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{totalActive}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Quote size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0E1013] p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-mono">FILEIRA SUPERIOR (←)</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{topCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-white/80 flex items-center justify-center text-xs font-mono">
              TOP
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0E1013] p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-mono">FILEIRA INFERIOR (→)</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{bottomCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-white/80 flex items-center justify-center text-xs font-mono">
              BOT
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs">
            <button
              onClick={() => setFilterFileira("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterFileira === "all"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Todos ({testimonials.length})
            </button>
            <button
              onClick={() => setFilterFileira("top")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterFileira === "top"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Fileira Superior ← ({testimonials.filter((t) => t.fileira === "top").length})
            </button>
            <button
              onClick={() => setFilterFileira("bottom")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterFileira === "bottom"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Fileira Inferior → ({testimonials.filter((t) => t.fileira === "bottom").length})
            </button>
          </div>
        </div>

        {/* Testimonials List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando depoimentos...</span>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0E1013]/50 p-12 text-center">
            <Quote className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-white font-medium text-base mb-1">Nenhum depoimento nesta fileira</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão abaixo para adicionar um novo relato de cliente.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
            >
              <Plus size={15} />
              <span>Cadastrar Depoimento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTestimonials.map((item) => {
              const isTop = item.fileira === "top";
              const isActive = item.ativo !== false;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? "bg-[#0E1013] border-white/[0.08] hover:border-white/20"
                      : "bg-[#0A0B0E]/60 border-white/[0.04] opacity-60"
                  }`}
                >
                  <div>
                    {/* Header meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                            isTop
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {isTop ? "Fileira Superior ←" : "Fileira Inferior →"}
                        </span>
                        {item.categoria && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                            {item.categoria}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: item.id, ativo: !isActive })
                          }
                          title={isActive ? "Clique para desativar" : "Clique para ativar"}
                          className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded ${
                            isActive
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-neutral-500 bg-neutral-800"
                          }`}
                        >
                          {isActive ? "Ativo" : "Inativo"}
                        </button>
                      </div>
                    </div>

                    {/* Quote text with highlight preview */}
                    <blockquote className="text-[14px] leading-relaxed text-neutral-300 mb-4 font-normal">
                      “
                      {item.destaque_frase && item.depoimento.includes(item.destaque_frase) ? (
                        <>
                          <span>{item.depoimento.split(item.destaque_frase)[0]}</span>
                          <span className="text-white font-medium bg-white/[0.08] px-1 py-0.5 rounded">
                            {item.destaque_frase}
                          </span>
                          <span>{item.depoimento.split(item.destaque_frase).slice(1).join(item.destaque_frase)}</span>
                        </>
                      ) : (
                        item.depoimento
                      )}
                      ”
                    </blockquote>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white truncate">
                        {item.autor}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {item.cargo} · {item.empresa}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          switchFileiraMutation.mutate({
                            id: item.id,
                            fileira: isTop ? "bottom" : "top",
                          })
                        }
                        title={`Mover para ${isTop ? "Fileira Inferior" : "Fileira Superior"}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Layers size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Editar depoimento"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir depoimento de ${item.autor}?`)) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        title="Excluir depoimento"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Dialog for Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0E1013] p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <h2 className="text-lg font-semibold text-white font-display">
                  {formData.id ? "Editar Depoimento" : "Novo Depoimento"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Preencha os dados do cliente e o relato para exibição no carrossel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.06]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Nome do Autor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    placeholder="Ex: Mariana Costa"
                    className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ex: Fundadora / Diretora"
                    className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Ex: Studio Vértice"
                    className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                  Texto do Depoimento *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.depoimento}
                  onChange={(e) => setFormData({ ...formData, depoimento: e.target.value })}
                  placeholder="Escreva o relato do cliente sobre os resultados e a experiência de projeto..."
                  className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-muted-foreground">
                    Frase de Destaque (opcional)
                  </label>
                  <span className="text-[11px] text-muted-foreground/70">
                    Trecho que ficará em negrito/destacado
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.destaque_frase}
                  onChange={(e) => setFormData({ ...formData, destaque_frase: e.target.value })}
                  placeholder="Copie aqui exatamente as palavras do texto que deseja destacar"
                  className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Fileira no Carrossel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fileira: "top" })}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        formData.fileira === "top"
                          ? "bg-primary/10 border-primary text-white"
                          : "bg-[#14161A] border-white/[0.08] text-muted-foreground hover:text-white"
                      }`}
                    >
                      Superior (←)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fileira: "bottom" })}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        formData.fileira === "bottom"
                          ? "bg-primary/10 border-primary text-white"
                          : "bg-[#14161A] border-white/[0.08] text-muted-foreground hover:text-white"
                      }`}
                    >
                      Inferior (→)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    URL da Foto ou Logo (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg bg-[#14161A] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativo-chk"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-white/20 bg-[#14161A] text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="ativo-chk" className="text-xs text-neutral-300 cursor-pointer">
                  Exibir imediatamente no carrossel da Home
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/[0.08] text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-[#ff551a] text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,64,1,0.3)]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{formData.id ? "Salvar Alterações" : "Cadastrar Depoimento"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
