import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  parseCaseStudy,
  formatCategoryLabel,
  normalizeServiceCategory,
  UNIFIED_SERVICE_CATEGORIES,
} from "@/lib/caseStudy";

export interface ProcessStep {
  etapa: string;
  titulo: string;
  descricao: string;
  prazo: string;
}

export interface PaymentMethod {
  titulo: string;
  detalhe: string;
  destaque: boolean;
  escolhido_pelo_cliente?: boolean;
}

export const SERVICE_TEMPLATES: Record<
  string,
  {
    label: string;
    categoryFilter: string;
    titulo: string;
    prazo: string;
    introducao: string;
    entregaveis: string[];
    processo: ProcessStep[];
  }
> = {
  brand: {
    label: "Identidade visual",
    categoryFilter: "Identidade visual",
    titulo: "Identidade Visual & Sistema de Marca",
    prazo: "25 a 35 dias corridos",
    introducao:
      "Proposta desenvolvida para construir uma identidade visual consistente, clara e preparada para posicionar sua marca em todos os pontos de contato.",
    entregaveis: [
      "Logotipo principal, versões secundárias e símbolo / monograma",
      "Paleta cromática institucional (CMYK, RGB, HEX e Pantone)",
      "Sistema tipográfico completo (títulos, apoio e leitura)",
      "Elementos gráficos de suporte, grafismos e padrões da marca",
      "Guia de uso e manual de identidade visual em PDF de alta resolução",
      "Pacote completo de arquivos finais abertos e vetoriais (AI, EPS, SVG, PDF e PNG)",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Entendo o momento da marca, objetivos comerciais, público e referências do setor.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Defino conceito, paleta cromática, tipografia e o caminho visual do projeto.",
        prazo: "Semana 2",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desenvolvo logotipo, sistema visual, aplicações e refinamentos alinhados ao escopo.",
        prazo: "Semanas 3 e 4",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Organizo o guia de uso da marca e os arquivos finais abertos e prontos para aplicação.",
        prazo: "Semana 5",
      },
    ],
  },
  social: {
    label: "Design para redes sociais",
    categoryFilter: "Design para redes sociais",
    titulo: "Direção Visual & Design para Redes Sociais",
    prazo: "Ciclo mensal / 15 dias setup",
    introducao:
      "Proposta de direção visual e criação de peças para redes sociais, mantendo sua comunicação reconhecível e bem estruturada em cada publicação.",
    entregaveis: [
      "Direção de arte e linha editorial visual para feed, carrosséis e stories",
      "Pacote de peças estratégicas finalizadas em alta resolução prontas para publicação",
      "Sistema de capas de destaque e padronização visual do perfil",
      "Matrizes e templates editáveis organizados (Figma / Canva Pro) para autonomia da equipe",
      "Guia rápido de boas práticas tipográficas e cromáticas para postagens",
      "Até 2 rodadas de ajustes inclusas por lote de criativos",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Análise do perfil atual, objetivos de comunicação e temas prioritários da marca.",
        prazo: "Dias 1 a 4",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Definição do sistema visual para feed, stories, carrosséis e matrizes editáveis.",
        prazo: "Dias 5 a 10",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desenvolvimento das peças, campanhas e rodadas de revisão previstas no ciclo.",
        prazo: "Contínuo / Semanal",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Envio das artes exportadas em alta resolução e templates organizados.",
        prazo: "Final do ciclo",
      },
    ],
  },
  web: {
    label: "Sites e interfaces",
    categoryFilter: "Sites e interfaces",
    titulo: "Design de Site & Interface Digital",
    prazo: "20 a 30 dias corridos",
    introducao:
      "Desenvolvimento de página digital clara, responsiva e bem estruturada para apresentar sua marca e facilitar novos contatos comerciais.",
    entregaveis: [
      "Arquitetura da informação, estrutura narrativa e wireframe das seções",
      "Design de interface (UI) exclusivo para Desktop e Mobile no Figma",
      "Sistema de componentes visuais, botões, tipografia e estados interativos",
      "Desenvolvimento / implementação responsiva com performance e SEO técnico básico",
      "Integração de formulários de orçamento e botões diretos para WhatsApp",
      "Handoff técnico organizado e treinamento rápido para atualização de conteúdo",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Mapeamento da estrutura de conteúdo, páginas e objetivos de navegação.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Arquitetura da informação, wireframes e definição da linguagem da interface.",
        prazo: "Semana 2",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Design completo desktop e mobile no Figma e implementação responsiva.",
        prazo: "Semanas 3 e 4",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Publicação da página ou handoff técnico organizado para a equipe.",
        prazo: "Entrega final",
      },
    ],
  },
  full: {
    label: "Escopo completo (Marca + Redes + Site)",
    categoryFilter: "Todos",
    titulo: "Reposicionamento Visual: Identidade, Redes Sociais & Site",
    prazo: "35 a 45 dias corridos",
    introducao:
      "Projeto integrado unindo identidade visual, direção para redes sociais e presença digital para marcas em fase de lançamento ou reposicionamento.",
    entregaveis: [
      "Sistema completo de Identidade Visual (Logotipo, Símbolo, Cores, Tipografia e Manual PDF)",
      "Pacote de arquivos vetoriais abertos e prontos para impressão e digital",
      "Direção visual para Redes Sociais + Kit de peças e templates editáveis",
      "Design e implementação de Site Institucional ou Landing Page de alta conversão",
      "Padronização de todos os pontos de contato físicos e digitais da marca",
      "Acompanhamento direto durante toda a transição e lançamento da nova marca",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Alinhamento estratégico sobre posicionamento, público e metas do projeto.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Construção do sistema de identidade visual, tipografia, cores e guia da marca.",
        prazo: "Semanas 2 e 3",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desdobramento para peças de redes sociais e design da página digital.",
        prazo: "Semanas 4 e 5",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Entrega completa dos arquivos da marca, templates e publicação do site.",
        prazo: "Semana 6",
      },
    ],
  },
};

export function parseProposalProcessData(rawProcesso: any, fallbackTitle = ""): {
  steps: ProcessStep[];
  deliverables: string[];
} {
  const detectDefaultDeliverables = (title: string) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("rede") || lower.includes("social")) {
      return SERVICE_TEMPLATES.social.entregaveis;
    }
    if (lower.includes("site") || lower.includes("interface") || lower.includes("landing")) {
      return SERVICE_TEMPLATES.web.entregaveis;
    }
    if (lower.includes("reposicionamento") || lower.includes("completo")) {
      return SERVICE_TEMPLATES.full.entregaveis;
    }
    return SERVICE_TEMPLATES.brand.entregaveis;
  };

  if (Array.isArray(rawProcesso)) {
    return {
      steps: rawProcesso,
      deliverables: detectDefaultDeliverables(fallbackTitle),
    };
  }

  if (rawProcesso && typeof rawProcesso === "object") {
    const steps = Array.isArray(rawProcesso.steps)
      ? rawProcesso.steps
      : SERVICE_TEMPLATES.brand.processo;
    const deliverables =
      Array.isArray(rawProcesso.entregaveis) && rawProcesso.entregaveis.length > 0
        ? rawProcesso.entregaveis
        : detectDefaultDeliverables(fallbackTitle);
    return { steps, deliverables };
  }

  return {
    steps: SERVICE_TEMPLATES.brand.processo,
    deliverables: detectDefaultDeliverables(fallbackTitle),
  };
}

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminProposalForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmpresa, setClienteEmpresa] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [titulo, setTitulo] = useState(SERVICE_TEMPLATES.brand.titulo);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("Enviada");
  const [introducao, setIntroducao] = useState(SERVICE_TEMPLATES.brand.introducao);
  const [prazoEntrega, setPrazoEntrega] = useState(SERVICE_TEMPLATES.brand.prazo);
  const [validadeDias, setValidadeDias] = useState(10);
  const [valorTotal, setValorTotal] = useState<string>("6500");
  const [observacoes, setObservacoes] = useState(
    "Inclui até 2 rodadas de ajustes por etapa, entrega de todos os arquivos finais organizados e acompanhamento direto comigo durante todo o projeto."
  );

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("Todos");

  const [processo, setProcesso] = useState<ProcessStep[]>(SERVICE_TEMPLATES.brand.processo);
  const [entregaveis, setEntregaveis] = useState<string[]>(SERVICE_TEMPLATES.brand.entregaveis);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [leadPrefilledBanner, setLeadPrefilledBanner] = useState<string | null>(null);

  const [formasPagamento, setFormasPagamento] = useState<PaymentMethod[]>([
    {
      titulo: "À vista com 7% de desconto (PIX)",
      detalhe: "Pagamento único na aprovação da proposta com condição especial.",
      destaque: true,
    },
    {
      titulo: "50% na entrada + 50% na entrega final",
      detalhe: "Via PIX ou transferência bancária conforme cronograma.",
      destaque: false,
    },
    {
      titulo: "Parcelamento em até 6x no cartão",
      detalhe: "Link de pagamento seguro para maior flexibilidade.",
      destaque: false,
    },
  ]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: allProjects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("data_publicacao", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Pre-fill from Lead URL parameters if creating a new proposal from AdminLeads
  useEffect(() => {
    if (isEditing) return;
    const leadName = searchParams.get("leadName");
    const leadEmail = searchParams.get("leadEmail");
    const leadService = searchParams.get("leadService");
    const leadMessage = searchParams.get("leadMessage");

    if (leadName) setClienteNome(leadName);
    if (leadEmail) setClienteEmail(leadEmail);

    if (leadService) {
      const normalized = leadService.toLowerCase();
      let presetKey = "brand";
      if (normalized.includes("rede") || normalized.includes("social")) {
        presetKey = "social";
      } else if (normalized.includes("site") || normalized.includes("interface")) {
        presetKey = "web";
      } else if (normalized.includes("completo")) {
        presetKey = "full";
      }
      const preset = SERVICE_TEMPLATES[presetKey];
      if (preset) {
        setTitulo(preset.titulo);
        setIntroducao(preset.introducao);
        setPrazoEntrega(preset.prazo);
        setProcesso(preset.processo);
        setEntregaveis(preset.entregaveis);
        setProjectFilter(preset.categoryFilter);
      }
    }

    if (leadName || leadEmail) {
      setLeadPrefilledBanner(
        `${leadName || leadEmail}${leadMessage ? ` — "${leadMessage.slice(0, 120)}${leadMessage.length > 120 ? "..." : ""}"` : ""}`
      );
    }
  }, [isEditing, searchParams]);

  useEffect(() => {
    if (!isEditing && !slugTouched) {
      const base = clienteEmpresa || clienteNome || titulo;
      if (base) {
        setSlug(slugify(`${clienteEmpresa || clienteNome}-${titulo.split(" ")[0]}`));
      }
    }
  }, [clienteNome, clienteEmpresa, titulo, isEditing, slugTouched]);

  useEffect(() => {
    if (!isEditing && allProjects && allProjects.length > 0 && selectedProjectIds.length === 0) {
      const matching =
        projectFilter === "Todos"
          ? allProjects.slice(0, 3)
          : allProjects
              .filter((p) => normalizeServiceCategory(p.categoria) === projectFilter)
              .slice(0, 3);
      const initial = matching.length > 0 ? matching : allProjects.slice(0, 3);
      setSelectedProjectIds(initial.map((p) => p.id));
    }
  }, [isEditing, allProjects, selectedProjectIds.length, projectFilter]);

  const { data: existingProposal } = useQuery({
    queryKey: ["admin-proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as any;
    },
    enabled: isEditing && !!user,
  });

  useEffect(() => {
    if (existingProposal) {
      setClienteNome(existingProposal.cliente_nome || "");
      setClienteEmpresa(existingProposal.cliente_empresa || "");
      setClienteEmail(existingProposal.cliente_email || "");
      setTitulo(existingProposal.titulo || "");
      setSlug(existingProposal.slug || "");
      setSlugTouched(true);
      setStatus(existingProposal.status || "Enviada");
      setIntroducao(existingProposal.introducao || "");
      setPrazoEntrega(existingProposal.prazo_entrega || "");
      setValidadeDias(existingProposal.validade_dias || 10);
      setValorTotal(
        existingProposal.valor_total !== null && existingProposal.valor_total !== undefined
          ? String(existingProposal.valor_total)
          : ""
      );
      setObservacoes(existingProposal.observacoes || "");
      setSelectedProjectIds(
        Array.isArray(existingProposal.projeto_ids) ? existingProposal.projeto_ids : []
      );
      const parsedProcess = parseProposalProcessData(
        existingProposal.processo,
        existingProposal.titulo
      );
      setProcesso(parsedProcess.steps);
      setEntregaveis(parsedProcess.deliverables);

      if (
        Array.isArray(existingProposal.formas_pagamento) &&
        existingProposal.formas_pagamento.length > 0
      ) {
        setFormasPagamento(existingProposal.formas_pagamento);
      }
    }
  }, [existingProposal]);

  const applyServicePreset = (key: string) => {
    const preset = SERVICE_TEMPLATES[key];
    if (!preset) return;
    setTitulo(preset.titulo);
    setIntroducao(preset.introducao);
    setPrazoEntrega(preset.prazo);
    setProcesso(preset.processo);
    setEntregaveis(preset.entregaveis);
    setProjectFilter(preset.categoryFilter);

    if (allProjects) {
      const matching =
        preset.categoryFilter === "Todos"
          ? allProjects.slice(0, 3)
          : allProjects.filter(
              (p) => normalizeServiceCategory(p.categoria) === preset.categoryFilter
            );
      if (matching.length > 0) {
        setSelectedProjectIds(matching.slice(0, 3).map((p) => p.id));
      }
    }
    toast.success(`Modelo "${preset.label}" aplicado com entregáveis e etapas.`);
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const moveProject = (index: number, direction: -1 | 1) => {
    setSelectedProjectIds((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleAddDeliverable = () => {
    const trimmed = newDeliverable.trim();
    if (!trimmed) return;
    setEntregaveis((prev) => [...prev, trimmed]);
    setNewDeliverable("");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const finalSlug = slugify(slug || `${clienteEmpresa || clienteNome}-${Date.now()}`);
      const cleanedDeliverables = entregaveis.map((d) => d.trim()).filter(Boolean);
      const payload = {
        cliente_nome: clienteNome.trim(),
        cliente_empresa: clienteEmpresa.trim() || null,
        cliente_email: clienteEmail.trim() || null,
        titulo: titulo.trim(),
        slug: finalSlug,
        status,
        introducao: introducao.trim() || null,
        projeto_ids: selectedProjectIds,
        processo: {
          steps: processo,
          entregaveis: cleanedDeliverables,
        } as any,
        formas_pagamento: formasPagamento as any,
        prazo_entrega: prazoEntrega.trim() || null,
        validade_dias: Number(validadeDias) || 10,
        valor_total: valorTotal ? Number(valorTotal) : null,
        observacoes: observacoes.trim() || null,
      };

      if (isEditing) {
        const { error } = await supabase.from("proposals").update(payload).eq("id", id!);
        if (error) throw error;
        return finalSlug;
      } else {
        const { error } = await supabase.from("proposals").insert(payload);
        if (error) throw error;
        return finalSlug;
      }
    },
    onSuccess: (finalSlug) => {
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", finalSlug] });
      toast.success(isEditing ? "Proposta atualizada!" : "Proposta comercial criada!");
      navigate("/admin/propostas");
    },
    onError: (err) => toast.error("Erro ao salvar proposta: " + (err as Error).message),
  });

  if (authLoading || !user) return null;

  const filteredProjects = (allProjects || []).filter(
    (p) =>
      projectFilter === "Todos" ||
      normalizeServiceCategory(p.categoria) === projectFilter ||
      p.categoria === projectFilter
  );

  const selectedProjectsOrdered = selectedProjectIds
    .map((pid) => allProjects?.find((p) => p.id === pid))
    .filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial max-w-[1040px] pt-[104px] md:pt-[116px] pb-24">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-border">
          <div>
            <Link
              to="/admin/propostas"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Voltar para Propostas</span>
            </Link>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(26px, 3.4vw, 40px)", lineHeight: 1.08 }}
            >
              {isEditing ? "Editar proposta comercial." : "Nova proposta comercial."}
            </h1>
            <p className="text-[15px] text-muted-foreground mt-1.5">
              Configure o escopo, matriz de entregáveis, cronograma em 4 etapas e estudos de caso.
            </p>
          </div>

          {slug && (
            <Link
              to={`/proposta/${slug}`}
              target="_blank"
              className="btn-ghost px-4 py-2.5 text-[13px] inline-flex items-center gap-2 shrink-0"
            >
              <Eye size={15} />
              <span>Pré-visualizar</span>
            </Link>
          )}
        </div>

        {leadPrefilledBanner && (
          <div className="mb-8 rounded-2xl border border-primary/35 bg-primary/10 px-5 py-4 flex items-start gap-3">
            <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground font-medium block">
                Proposta pré-preenchida a partir da Caixa de Entrada de Orçamentos
              </strong>
              <span className="text-muted-foreground text-xs">{leadPrefilledBanner}</span>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-8"
        >
          {/* Quick Service Presets aligned with the 3 unified fronts */}
          <div className="bg-[#141518] border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="text-[14px] font-medium text-foreground">
                Modelos rápidos por frente de serviço
              </div>
              <span className="text-[12px] text-muted-foreground">
                Preenche automaticamente introdução, matriz de entregáveis, 4 etapas e filtra os cases
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(SERVICE_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyServicePreset(key)}
                  className="text-left p-4 rounded-xl border border-border bg-background/60 hover:border-primary transition-colors"
                >
                  <div className="font-display text-[15px] font-medium text-foreground">
                    {tpl.label}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1 line-clamp-1">
                    {tpl.prazo}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Dados do Cliente e Identificação */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <h2 className="font-display text-[18px] font-medium text-foreground mb-6 pb-4 border-b border-border flex items-center gap-2.5">
              <span className="font-mono text-primary text-[13px] tabular-nums">01.</span>
              <span>Cliente e identificação da proposta</span>
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Nome do cliente <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                    placeholder="Ex: Mariana Costa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Empresa / Marca
                  </label>
                  <input
                    type="text"
                    value={clienteEmpresa}
                    onChange={(e) => setClienteEmpresa(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                    placeholder="Ex: Aurora Wellness"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    E-mail do cliente
                  </label>
                  <input
                    type="email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                    placeholder="cliente@empresa.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Título da proposta <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                    placeholder="Ex: Identidade Visual & Sistema de Marca"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                  >
                    {["Enviada", "Em análise", "Aprovada", "Rascunho", "Recusada"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Link personalizado da proposta (slug) <span className="text-primary">*</span>
                </label>
                <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:border-primary">
                  <span className="px-3.5 py-3 text-xs text-muted-foreground bg-secondary border-r border-border font-mono">
                    /proposta/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="flex-1 bg-transparent px-3.5 py-3 text-[15px] text-foreground font-mono focus:outline-none"
                    placeholder="nome-do-cliente-servico"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Introdução para o cliente
                </label>
                <textarea
                  value={introducao}
                  onChange={(e) => setIntroducao(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none resize-y"
                  placeholder="Apresente o objetivo desta proposta para o cliente..."
                />
              </div>
            </div>
          </div>

          {/* 2. Seletor Visual de Projetos */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
                  <span className="font-mono text-primary text-[13px] tabular-nums">02.</span>
                  <span>Seleção de projetos para a proposta</span>
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Escolha quais estudos de caso do portfólio serão apresentados nesta proposta.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-primary font-medium shrink-0">
                {selectedProjectIds.length}{" "}
                {selectedProjectIds.length === 1 ? "case selecionado" : "cases selecionados"}
              </span>
            </div>

            {/* Unified Category filter bar */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["Todos", ...UNIFIED_SERVICE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProjectFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    projectFilter === cat
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Visual Project Picker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const isSelected = selectedProjectIds.includes(project.id);
                const orderIndex = selectedProjectIds.indexOf(project.id);
                const caseData = parseCaseStudy(project);

                return (
                  <div
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={`group cursor-pointer rounded-xl border overflow-hidden transition-all relative flex flex-col ${
                      isSelected
                        ? "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary))]"
                        : "border-border bg-background/60 hover:border-foreground/30"
                    }`}
                  >
                    <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
                      {project.imagem_capa && (
                        <img
                          src={project.imagem_capa}
                          alt={project.titulo}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2.5 left-2.5 bg-background/90 border border-border rounded-md px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {formatCategoryLabel(project.categoria)}
                      </div>

                      <div
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/85 text-muted-foreground border border-border"
                        }`}
                      >
                        {isSelected ? orderIndex + 1 : <Check size={13} />}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display text-[15px] font-medium text-foreground line-clamp-1">
                          {project.titulo}
                        </h4>
                        <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2">
                          {caseData.resumo}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Order Manager */}
            {selectedProjectsOrdered.length > 1 && (
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-[13px] font-medium text-muted-foreground mb-3">
                  Ordem de exibição dos cases na proposta
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectsOrdered.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs"
                    >
                      <span className="text-primary font-mono font-semibold">0{idx + 1}</span>
                      <span className="text-foreground font-medium truncate max-w-[180px]">
                        {proj.titulo}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveProject(idx, -1)}
                        disabled={idx === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Mover para trás"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProject(idx, 1)}
                        disabled={idx === selectedProjectsOrdered.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Mover para frente"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Matriz de Entregáveis & Etapas do Processo */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9 space-y-8">
            {/* 3A. Matriz de Entregáveis Inclusos */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-border">
                <div>
                  <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
                    <span className="font-mono text-primary text-[13px] tabular-nums">03.</span>
                    <span>Matriz de entregáveis e etapas do processo</span>
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Itens tangíveis que o cliente receberá ao contratar o projeto.
                  </p>
                </div>
                <span className="font-mono text-xs text-primary tabular-nums">
                  {entregaveis.length} entregáveis
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {entregaveis.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-background border border-border rounded-xl px-3.5 py-2.5"
                  >
                    <span className="font-mono text-xs text-primary tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...entregaveis];
                        next[idx] = e.target.value;
                        setEntregaveis(next);
                      }}
                      className="flex-1 bg-transparent text-[14px] text-foreground focus:outline-none"
                      placeholder="Descreva o entregável..."
                    />
                    <button
                      type="button"
                      onClick={() => setEntregaveis((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remover entregável"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  placeholder="Adicionar novo entregável ao escopo (ex: Manual da marca em PDF)..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="btn-outline px-4 py-2.5 text-xs inline-flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={14} />
                  <span>Incluir item</span>
                </button>
              </div>
            </div>

            {/* 3B. Cronograma de Etapas */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-[16px] font-medium text-foreground">
                    Cronograma de execução (4 fases)
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    Etapas apresentadas na seção 01 da proposta pública.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProcesso((prev) => [
                      ...prev,
                      {
                        etapa: String(prev.length + 1).padStart(2, "0"),
                        titulo: "",
                        descricao: "",
                        prazo: "",
                      },
                    ])
                  }
                  className="btn-ghost px-3.5 py-2 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Adicionar etapa</span>
                </button>
              </div>

              <div className="space-y-4">
                {processo.map((step, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-background border border-border items-start"
                  >
                    <div className="md:col-span-1">
                      <label className="text-[11px] text-muted-foreground block mb-1">Nº</label>
                      <input
                        type="text"
                        value={step.etapa}
                        onChange={(e) => {
                          const next = [...processo];
                          next[idx] = { ...step, etapa: e.target.value };
                          setProcesso(next);
                        }}
                        className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs text-primary font-mono font-semibold text-center"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Título da etapa
                      </label>
                      <input
                        type="text"
                        value={step.titulo}
                        onChange={(e) => {
                          const next = [...processo];
                          next[idx] = { ...step, titulo: e.target.value };
                          setProcesso(next);
                        }}
                        placeholder="Ex: Direção visual"
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] text-foreground"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Descrição da fase
                      </label>
                      <input
                        type="text"
                        value={step.descricao}
                        onChange={(e) => {
                          const next = [...processo];
                          next[idx] = { ...step, descricao: e.target.value };
                          setProcesso(next);
                        }}
                        placeholder="O que acontece nesta etapa..."
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] text-foreground"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[11px] text-muted-foreground block mb-1">Prazo</label>
                      <input
                        type="text"
                        value={step.prazo}
                        onChange={(e) => {
                          const next = [...processo];
                          next[idx] = { ...step, prazo: e.target.value };
                          setProcesso(next);
                        }}
                        placeholder="Semana 1"
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] text-foreground"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end md:pt-5">
                      <button
                        type="button"
                        onClick={() => setProcesso((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remover etapa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Investimento, Prazo & Condições de Pagamento */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <h2 className="font-display text-[18px] font-medium text-foreground mb-6 pb-4 border-b border-border flex items-center gap-2.5">
              <span className="font-mono text-primary text-[13px] tabular-nums">04.</span>
              <span>Investimento, prazo e condições</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Investimento total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                  placeholder="Ex: 6500"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Prazo estimado de entrega
                </label>
                <input
                  type="text"
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                  placeholder="Ex: 30 dias corridos"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Validade da proposta (dias)
                </label>
                <input
                  type="number"
                  value={validadeDias}
                  onChange={(e) => setValidadeDias(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[14px] font-medium text-foreground">
                  Modalidades de pagamento (selecionáveis pelo cliente na proposta)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormasPagamento((prev) => [
                      ...prev,
                      { titulo: "", detalhe: "", destaque: false },
                    ])
                  }
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Adicionar condição</span>
                </button>
              </div>

              <div className="space-y-3">
                {formasPagamento.map((fp, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl bg-background border border-border items-center"
                  >
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        value={fp.titulo}
                        onChange={(e) => {
                          const next = [...formasPagamento];
                          next[idx] = { ...fp, titulo: e.target.value };
                          setFormasPagamento(next);
                        }}
                        placeholder="Ex: À vista com 7% de desconto (PIX)"
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] text-foreground"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        value={fp.detalhe}
                        onChange={(e) => {
                          const next = [...formasPagamento];
                          next[idx] = { ...fp, detalhe: e.target.value };
                          setFormasPagamento(next);
                        }}
                        placeholder="Detalhes da condição..."
                        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-[13px] text-foreground"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={fp.destaque}
                        onChange={(e) => {
                          const next = [...formasPagamento];
                          next[idx] = { ...fp, destaque: e.target.checked };
                          setFormasPagamento(next);
                        }}
                        className="accent-primary"
                      />
                      <span className="text-xs text-muted-foreground">Recomendada</span>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setFormasPagamento((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-2">
                Observações e condições inclusas
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-2">
            <Link to="/admin/propostas" className="btn-ghost px-6 py-3.5 text-[14px]">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary px-8 py-3.5 text-[15px] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              <span>{isEditing ? "Salvar alterações" : "Gerar proposta comercial"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminProposalForm;
