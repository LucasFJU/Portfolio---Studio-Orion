import AboutPortrait from "@/components/AboutPortrait";
import LogosSection from "@/components/LogosSection";
import GradientBlinds from "@/components/ui/GradientBlinds";
import { HeroBackgroundStage } from "@/components/hero/HeroBackgroundStage";
import { useState, useEffect, useLayoutEffect, useRef, type FocusEvent, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ArrowUpRight,
  X,
  Menu,
  Printer,
  Share2,
  Check,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { parseCaseStudy, isValidWhatsappNumber } from "@/lib/caseStudy";
import { parseProposalProcessData } from "./AdminProposalForm";
import { getStoredHeroConfig, resolveHeroImage } from "@/config/heroConfig";

function ProposalStack({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [stackEnabled, setStackEnabled] = useState(false);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!enabled || reducedMotion) {
      setStackEnabled(false);
      return;
    }

    let disposed = false;
    const measure = () => {
      if (disposed || !stackRef.current) return;
      const panels = Array.from(stackRef.current.querySelectorAll<HTMLElement>("[data-proposal-stack-panel]"));
      const heights = panels.map((panel) => panel.querySelector<HTMLElement>(".orion-proposal-stack-content")?.getBoundingClientRect().height || 0);
      const offset = window.innerWidth >= 1024 ? 112 : 96;
      const available = window.innerHeight - offset - 16;
      panels.forEach((panel, index) => {
        panel.style.setProperty("--proposal-panel-top", `${Math.min(offset, available + offset - heights[index])}px`);
        panel.style.setProperty("--proposal-panel-offset", `${offset}px`);
      });
      setStackEnabled(panels.length > 1 && available >= 360 && heights.every((height) => height > 0));
    };

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    stackRef.current.querySelectorAll<HTMLElement>(".orion-proposal-stack-content").forEach((content) => observer?.observe(content));
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener("loadingdone", measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [enabled, reducedMotion]);

  const revealFocusedPanel = (event: FocusEvent<HTMLElement>) => {
    if (!stackEnabled || !(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
    const offset = window.innerWidth >= 1024 ? 112 : 96;
    const top = event.currentTarget.getBoundingClientRect().top;
    if (Math.abs(top - offset) > 2) window.scrollTo({ top: window.scrollY + top - offset, behavior: "instant" });
  };

  return (
    <div ref={stackRef} className="orion-proposal-stack" data-scroll-mode={stackEnabled ? "stack" : "flow"} onFocusCapture={revealFocusedPanel}>
      {children}
    </div>
  );
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(val));
};

const ProposalView = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [selectedCaseModal, setSelectedCaseModal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPaymentIdx, setSelectedPaymentIdx] = useState<number>(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const navLastScrollY = useRef(0);
  const [coverHeroConfig] = useState(getStoredHeroConfig);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - navLastScrollY.current;
      setNavScrolled(currentY > 36);
      if (currentY <= 90) setNavHidden(false);
      else if (delta > 8 && !mobileNavOpen) setNavHidden(true);
      else if (delta < -5) setNavHidden(false);
      navLastScrollY.current = currentY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileNavOpen]);

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposal", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, slug, cliente_nome, cliente_empresa, titulo, introducao, status, projeto_ids, processo, formas_pagamento, prazo_entrega, validade_dias, valor_total, observacoes, created_at")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  // Record proposal view
  useEffect(() => {
    if (proposal?.id) {
      supabase
        .from("proposal_views")
        .insert({
          proposal_id: proposal.id,
          user_agent: navigator.userAgent,
        })
        .then(() => {});
    }
  }, [proposal?.id]);

  // Initialize selected payment index to client's previously chosen option or recommended option
  useEffect(() => {
    if (proposal && Array.isArray(proposal.formas_pagamento)) {
      const chosenIdx = proposal.formas_pagamento.findIndex(
        (pm: any) => pm.escolhido_pelo_cliente
      );
      if (chosenIdx >= 0) {
        setSelectedPaymentIdx(chosenIdx);
        return;
      }
      const recommendedIdx = proposal.formas_pagamento.findIndex((pm: any) => pm.destaque);
      if (recommendedIdx >= 0) {
        setSelectedPaymentIdx(recommendedIdx);
      }
    }
  }, [proposal]);

  const { data: allProjects } = useQuery({
    queryKey: ["proposal-projects", proposal?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: !!proposal,
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback = "") =>
    settings?.find((s: any) => s.key === key)?.value || fallback;

  const rawWhatsapp = getSetting("whatsapp_number");
  const hasValidWhatsapp = isValidWhatsappNumber(rawWhatsapp);
  const whatsappNumber = hasValidWhatsapp ? rawWhatsapp.replace(/\D/g, "") : "";

  const statProjects = getSetting("stat_projects", "2.500+");
  const statClients = getSetting("stat_clients", "500+");
  const statExperience = getSetting("stat_experience", "13+ anos");

  const paymentMethods: any[] = Array.isArray(proposal?.formas_pagamento)
    ? proposal.formas_pagamento
    : [];

  const activePaymentOption = paymentMethods[selectedPaymentIdx] || paymentMethods[0] || null;

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!proposal?.id) return;
      const updatedPayments = paymentMethods.map((pm, idx) => ({
        ...pm,
        escolhido_pelo_cliente: idx === selectedPaymentIdx,
      }));
      const { error } = await supabase
        .from("proposals")
        .update({
          status: "Aprovada",
          formas_pagamento: updatedPayments as any,
        })
        .eq("id", proposal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      toast.success("Proposta aprovada com sucesso! Vamos iniciar o seu projeto.");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-[1200px] space-y-6 animate-pulse">
          <div className="h-5 w-48 bg-card rounded" />
          <div className="h-14 w-2/3 bg-card rounded-xl" />
          <div className="h-64 w-full bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-sm text-primary tabular-nums mb-3">Erro 404</span>
        <h1 className="font-display text-3xl font-medium text-foreground mb-2">
          Proposta comercial não encontrada
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mb-8">
          Verifique se o endereço da proposta está correto ou solicite um novo link atualizado.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          Ir para o Portfólio Principal →
        </Link>
      </div>
    );
  }

  // Match and preserve the exact order of selected projects
  const selectedIds: string[] = Array.isArray(proposal.projeto_ids) ? proposal.projeto_ids : [];
  const selectedProjects = selectedIds
    .map((pid) => allProjects?.find((p) => p.id === pid))
    .filter(Boolean) as any[];

  const { steps, deliverables } = parseProposalProcessData(proposal.processo, proposal.titulo);
  const hasObjective = Boolean(proposal.introducao?.trim());
  const hasScope = steps.length > 0 || deliverables.length > 0;
  let nextSectionNumber = 0;
  const objectiveNumber = hasObjective ? String(++nextSectionNumber).padStart(2, "0") : null;
  const authorityNumber = String(++nextSectionNumber).padStart(2, "0");
  const scopeNumber = hasScope ? String(++nextSectionNumber).padStart(2, "0") : null;
  const casesNumber = selectedProjects.length > 0 ? String(++nextSectionNumber).padStart(2, "0") : null;
  const investmentNumber = String(++nextSectionNumber).padStart(2, "0");

  const createdDate = proposal.created_at ? new Date(proposal.created_at) : new Date();
  const validUntil = new Date(createdDate);
  validUntil.setDate(validUntil.getDate() + (Number(proposal.validade_dias) || 10));

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link da proposta copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clientDisplayName = proposal.cliente_empresa || proposal.cliente_nome;

  const whatsappText = `Olá Lucas! Analisei a proposta "${proposal.titulo}" (${clientDisplayName})${
    activePaymentOption ? ` na condição "${activePaymentOption.titulo}"` : ""
  } e quero avançar com o projeto!`;

  const whatsappApprovalUrl = hasValidWhatsapp
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`
    : "/contato";

  return (
    <div className="orion-proposal-page min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Proposta Comercial: {clientDisplayName} — Lucas Evangelista</title>
        <meta
          name="description"
          content={`Proposta comercial exclusiva preparada para ${clientDisplayName} por Lucas Evangelista.`}
        />
      </Helmet>

      {/* Proposal navigation follows the compact, scroll-aware Studio Orion header. */}
      <header
        onFocusCapture={() => setNavHidden(false)}
        className={`fixed top-3 md:top-4 left-0 right-0 z-40 px-4 sm:px-6 print:hidden transition-all duration-300 ease-out ${navHidden && !mobileNavOpen ? "-translate-y-[130%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      >
        <nav
          aria-label="Navegação da proposta"
          className={`mx-auto flex items-center justify-between rounded-full border transition-all duration-300 ${navScrolled ? "max-w-[1080px] h-[52px] px-4 md:px-5 bg-[#090A0C]/95 backdrop-blur-xl border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.7)]" : "max-w-[1280px] h-[58px] md:h-[72px] px-5 md:px-7 bg-[#0B0C0E]/90 backdrop-blur-md border-white/[0.08]"}`}
        >
          {/* Brand */}
          <Link
            to="/"
            className="font-display text-[16px] md:text-[17px] font-bold tracking-tight text-foreground whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className={navScrolled ? "hidden sm:inline" : "inline"}>Studio <span className="text-primary">Orion</span></span>
            <span className={navScrolled ? "inline sm:hidden font-mono text-sm" : "hidden"}>Orion</span>
          </Link>

          {/* Desktop section links */}
          <div className={`hidden xl:flex items-center transition-all ${navScrolled ? "gap-3" : "gap-5"}`}>
            {hasObjective && (
              <a href="#objetivo" onClick={() => setMobileNavOpen(false)} className="nav-link-animated">
                {objectiveNumber}. Objetivo
              </a>
            )}
            <a href="#autoridade" onClick={() => setMobileNavOpen(false)} className="nav-link-animated">
              {authorityNumber}. Lucas
            </a>
            {hasScope && (
              <a href="#escopo" onClick={() => setMobileNavOpen(false)} className="nav-link-animated">
                {scopeNumber}. Escopo
              </a>
            )}
            {selectedProjects.length > 0 && (
              <a href="#cases" onClick={() => setMobileNavOpen(false)} className="nav-link-animated">
                {casesNumber}. Cases
              </a>
            )}
            <a href="#investimento" onClick={() => setMobileNavOpen(false)} className="nav-link-animated">
              {investmentNumber}. Investimento
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyShareLink}
              className="hidden sm:inline-flex p-2.5 rounded-full border border-border bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
              title="Copiar link da proposta"
              aria-label="Copiar link da proposta"
            >
              {copied ? <Check size={15} className="text-primary" /> : <Share2 size={15} />}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex p-2.5 rounded-full border border-border bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
              title="Imprimir / Salvar PDF"
              aria-label="Imprimir ou salvar proposta em PDF"
            >
              <Printer size={15} />
            </button>
            <a
              href="#investimento"
              onClick={() => setMobileNavOpen(false)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:border-primary xl:bg-primary xl:px-5 xl:py-2 xl:text-[13px] xl:font-semibold xl:text-primary-foreground xl:hover:bg-[#ff551a] ${navScrolled ? "xl:px-4 xl:text-[13px]" : ""}`}
            >
              <span className="xl:hidden inline-flex items-center gap-1 whitespace-nowrap">Investimento <ArrowUpRight size={14} /></span>
              <span className="hidden xl:inline">{proposal.status === "Aprovada" ? "Proposta Aprovada" : "Aprovar Proposta →"}</span>
            </a>
            <button
              type="button"
              className="xl:hidden text-foreground p-2 -mr-1 rounded-full hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-controls="proposal-mobile-nav"
              aria-label={mobileNavOpen ? "Fechar navegação da proposta" : "Abrir navegação da proposta"}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.nav
              id="proposal-mobile-nav"
              aria-label="Seções da proposta"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden max-w-[1280px] mx-auto mt-2 rounded-3xl bg-[#0E1014]/95 backdrop-blur-xl border border-white/[0.1] overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 flex flex-col gap-1">
                {[
                  ...(hasObjective ? [{ href: "#objetivo", label: `${objectiveNumber}. Objetivo` }] : []),
                  { href: "#autoridade", label: `${authorityNumber}. Lucas` },
                  ...(hasScope ? [{ href: "#escopo", label: `${scopeNumber}. Escopo` }] : []),
                  ...(selectedProjects.length ? [{ href: "#cases", label: `${casesNumber}. Cases` }] : []),
                  { href: "#investimento", label: `${investmentNumber}. Investimento` },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className="flex items-center justify-between py-2.5 text-[16px] font-display font-medium border-b border-white/[0.06] text-foreground hover:text-primary transition-colors">
                    {item.label}<ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Cover with the same orange GradientBlinds effect used in the home hero */}
      <section
        className="orion-proposal-cover relative isolate overflow-hidden"
      >
        <div className="orion-proposal-cover-effect" aria-hidden="true">
          <HeroBackgroundStage
            backgroundConfig={coverHeroConfig.background}
            colors={["#FF4001", "#000000", "#141518", "#090A0C"]}
            bg="#000000"
          />
          <div className="orion-hero-atmosphere" />
          <GradientBlinds
            gradientColors={["#f97316", "#ef4444"]}
            angle={20}
            blindCount={16}
            blindMinWidth={60}
            spotlightRadius={0.5}
            shine={0.4}
            relief={0.5}
            glow={0.4}
            sway={0.35}
            hoverTilt={0.6}
            clickEffect="ripple"
            noise={0.3}
          />
          {coverHeroConfig.media.glowEffect && <div className="orion-hero-light" />}
        </div>
        <div className="orion-hero-panels" aria-hidden="true" />
        <img
          className="orion-proposal-cover-photo"
          src={resolveHeroImage(coverHeroConfig.media)}
          alt="Lucas Evangelista, à frente do Studio Orion"
          {...{ fetchpriority: "high" }}
          decoding="async"
        />
        <div className="orion-shell orion-proposal-cover-content">
            <div className="orion-proposal-cover-kicker flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-primary font-medium">{clientDisplayName}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1
              className="orion-proposal-cover-title font-display text-foreground font-medium text-balance"
            >
              <span>Proposta</span>
              <span className="text-primary">Comercial</span>
            </h1>
          </motion.div>

          <p className="orion-proposal-cover-client">{proposal.titulo}</p>
          <div className="orion-proposal-cover-meta" aria-label={`Status ${proposal.status}; válida até ${validUntil.toLocaleDateString("pt-BR")}`}>
            <span>{proposal.status}</span>
            <span aria-hidden="true" className="orion-proposal-cover-meta-dot" />
            <span>Válida até {validUntil.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </section>

      <LogosSection />

      {hasObjective && (
        <section id="objetivo" className="orion-surface-light border-t border-border">
          <div className="orion-shell orion-proposal-objective">
            <div className="section-label mb-4">
              <span className="label-num">{objectiveNumber}.</span> Objetivo do Projeto
            </div>
            <h2 data-orion-reveal className="font-display text-foreground text-balance">
              O que vamos construir para <span className="text-primary">{clientDisplayName}</span>?
            </h2>
            <p data-orion-reveal>{proposal.introducao}</p>
          </div>
        </section>
      )}

      {/* Presentation and trust indicators */}
      <section id="autoridade" className="orion-surface-soft border-t border-border">
        <div className="orion-shell orion-proposal-authority">
          <div className="section-label mb-8">
            <span className="label-num">{authorityNumber}.</span> Experiência &amp; Solidez de Entrega
          </div>
          <div className="orion-proposal-author">
            <AboutPortrait loading="eager" className="orion-proposal-portrait" />
            <div className="orion-proposal-author-copy" data-orion-reveal>
              <h2>Prazer, sou o Lucas.</h2>
              <p>Sou designer e diretor criativo com mais de 13 anos de experiência ajudando empresas e profissionais a estruturarem sua presença visual com clareza, critério e consistência.</p>
              <p className="mt-5">Cada projeto é conduzido diretamente por mim, do diagnóstico inicial à entrega final.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
            {[
              {
                num: statProjects,
                label: "Projetos entregues",
                text: "Sistemas visuais, marcas e interfaces desenvolvidos com foco em posicionamento e resultado comercial.",
              },
              {
                num: statClients,
                label: "Clientes atendidos",
                text: "Empresas, especialistas e marcas atendidas no Brasil e no exterior em múltiplos segmentos.",
              },
              {
                num: statExperience,
                label: "De atuação prática",
                text: "Mais de uma década unindo direção criativa, clareza estratégica e arquivos prontos para escala.",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`p-6 md:p-10 ${
                  i < 2 ? "md:border-r border-b md:border-b-0 border-border" : ""
                }`}
              >
                <span className="font-display text-[40px] md:text-[52px] font-medium text-foreground tabular-nums leading-none block mb-2">
                  {item.num}
                </span>
                <span className="text-[13px] font-medium text-primary block mb-2">
                  {item.label}
                </span>
                <p className="text-muted-foreground text-[15px] leading-[1.6]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope, deliverables and schedule */}
      <ProposalStack enabled={hasScope && selectedProjects.length > 0}>
      {hasScope && (
        <section id="escopo" data-proposal-stack-panel className="orion-proposal-stack-panel orion-surface-light border-t border-border" style={{ zIndex: 1 }}>
          <div className="orion-shell orion-proposal-stack-content py-[72px] md:py-[110px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-8">
                <div className="section-label mb-3">
                  <span className="label-num">{scopeNumber}.</span> Escopo, Entregáveis &amp; Cronograma
                </div>
                <h2 data-orion-reveal
                  className="font-display text-foreground text-balance"
                  style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 500, lineHeight: 1.1 }}
                >
                  Etapas estruturadas e entregáveis claros para garantir{" "}
                  <span className="text-primary">resultado</span>.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <p className="text-muted-foreground text-[15px] leading-[1.6]">
                  Cada fase conta com alinhamento direto e validação antes do avanço para a etapa seguinte.
                </p>
              </div>
            </div>

            {/* Process Steps Grid */}
            {steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card/50 border border-border rounded-2xl p-7 md:p-8 flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/70">
                        <span className="font-mono text-xs text-primary tabular-nums font-semibold">
                          Etapa {step.etapa || String(i + 1).padStart(2, "0")}
                        </span>
                        {step.prazo && (
                          <span className="text-xs font-mono tabular-nums text-muted-foreground">
                            {step.prazo}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl text-foreground font-medium mb-2.5">
                        {step.titulo}
                      </h3>
                      <p className="text-muted-foreground text-[15px] leading-[1.65]">
                        {step.descricao}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Matriz de Entregáveis Inclusos */}
            {deliverables.length > 0 && (
              <div className="orion-surface-soft orion-legacy-dark rounded-2xl border border-border p-7 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                      <Layers size={17} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg md:text-xl font-medium text-foreground">
                        O que está incluso na entrega deste projeto
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Materiais e ativos finalizados prontos para aplicação imediata
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-primary tabular-nums">
                    {deliverables.length} itens no escopo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-xl bg-background/70 border border-border/80 p-4"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/35 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Check size={12} />
                      </span>
                      <span className="text-[14px] md:text-[15px] text-foreground/90 leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Curated case studies */}
      {selectedProjects.length > 0 && (
        <section id="cases" data-proposal-stack-panel className="orion-proposal-stack-panel orion-surface-dark border-t border-border" style={{ zIndex: 2 }}>
          <div className="orion-shell orion-proposal-stack-content py-[72px] md:py-[110px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-8">
                <div className="section-label mb-3">
                  <span className="label-num">{casesNumber}.</span> Cases de Referência Selecionados
                </div>
                <h2 data-orion-reveal
                  className="font-display text-foreground text-balance"
                  style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 500, lineHeight: 1.1 }}
                >
                  Projetos escolhidos para ilustrar o nível de entrega para{" "}
                  <span className="text-primary">{clientDisplayName}</span>.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:text-right">
                <p className="text-muted-foreground text-[14px] md:text-[15px] leading-[1.6]">
                  Clique em qualquer projeto para inspecionar o estudo de caso completo (contexto, desafio, direção criativa e galeria) sem sair desta proposta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {selectedProjects.map((project, i) => {
                const caseData = parseCaseStudy(project);
                const year = project.data_publicacao
                  ? new Date(project.data_publicacao).getFullYear()
                  : new Date().getFullYear();
                const deliverablesList = (
                  caseData.entregaveis?.length ? caseData.entregaveis : project.tags || []
                ).slice(0, 3);
                const span =
                  selectedProjects.length === 1
                    ? "md:col-span-12"
                    : i % 4 === 0 || i % 4 === 3
                    ? "md:col-span-7"
                    : "md:col-span-5";

                return (
                  <motion.article
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir estudo de caso ${project.titulo}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedCaseModal(project)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCaseModal(project);
                      }
                    }}
                    className={`${span} group cursor-pointer rounded-2xl border border-border bg-card/40 overflow-hidden hover:border-foreground/30 transition-colors duration-300 flex flex-col`}
                  >
                    {/* Cover Frame */}
                    <div className="h-[270px] md:h-[380px] bg-secondary relative overflow-hidden">
                      {project.imagem_capa && (
                        <img
                          src={project.imagem_capa}
                          alt={project.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/85 backdrop-blur-md border border-white/15 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>

                    {/* Clean Unboxed Metadata Footer */}
                    <div className="p-6 md:p-7 flex-1 flex flex-col justify-between bg-background/60">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-medium">{project.categoria}</span>
                            {caseData.cliente && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{caseData.cliente}</span>
                              </>
                            )}
                            {caseData.resultados && caseData.metrica && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-foreground font-medium">
                                  {caseData.metrica}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="font-mono tabular-nums">{year}</span>
                        </div>

                        <h3 className="font-display text-[21px] md:text-[24px] text-foreground font-medium mb-2 group-hover:text-primary transition-colors">
                          {project.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-[1.6] line-clamp-2">
                          {caseData.resumo}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-border/60 text-[12px] text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-y-1">
                          {deliverablesList.map((tag: string, idx: number) => (
                            <span key={tag} className="inline-flex items-center">
                              <span>{tag}</span>
                              {idx < deliverablesList.length - 1 && (
                                <span aria-hidden="true" className="mx-2 text-border">
                                  /
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-foreground font-medium group-hover:text-primary transition-colors whitespace-nowrap shrink-0">
                          Ler Case →
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      </ProposalStack>

      {/* 04. Investimento & Condições Comerciais */}
      <section id="investimento" className="orion-surface-light border-t border-border py-[72px] md:py-[120px]">
        <div className="orion-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
            <div className="lg:col-span-8">
              <div className="section-label mb-3">
                <span className="label-num">{investmentNumber}.</span> Investimento &amp; Condições Comerciais
              </div>
              <h2 data-orion-reveal
                className="font-display text-foreground text-balance"
                style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 500, lineHeight: 1.1 }}
              >
                Transparência, previsibilidade e{" "}
                <span className="text-primary">compromisso com o seu negócio</span>.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left — Main Investment Card */}
            <div
              className="lg:col-span-5 rounded-2xl border border-primary/35 p-8 md:p-10"
              style={{
                background:
                  "linear-gradient(145deg, hsl(15 100% 50% / 0.12) 0%, hsl(var(--card)) 65%)",
              }}
            >
              <span className="text-xs font-mono text-primary block mb-2">
                Investimento Total do Projeto
              </span>
              <div className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-tight my-3 tabular-nums">
                {formatCurrency(proposal.valor_total)}
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Prazo estimado de entrega:{" "}
                <strong className="text-foreground font-medium">
                  {proposal.prazo_entrega || "A combinar"}
                </strong>
              </p>

              {activePaymentOption && (
                <div className="rounded-xl bg-background/70 border border-primary/30 p-3.5 mb-6">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary block mb-1">
                    Modalidade selecionada
                  </span>
                  <strong className="font-display text-sm text-foreground font-medium block">
                    {activePaymentOption.titulo}
                  </strong>
                </div>
              )}

              {proposal.observacoes && (
                <div className="border-t border-border/80 pt-5 mb-7">
                  <span className="text-xs font-medium text-foreground block mb-2">
                    Garantias &amp; Inclusos no Escopo
                  </span>
                  <p className="text-xs md:text-sm text-muted-foreground leading-[1.65] whitespace-pre-line">
                    {proposal.observacoes}
                  </p>
                </div>
              )}

              <div className="space-y-3 print:hidden">
                {proposal.status !== "Aprovada" ? (
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="w-full btn-primary justify-center py-3.5 text-[15px] inline-flex"
                  >
                    <CheckCircle2 size={17} /> Aprovar Proposta Agora
                  </button>
                ) : (
                  <div className="w-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full py-3.5 px-6 text-center text-sm font-medium">
                    Proposta Aprovada · Projeto Confirmado
                  </div>
                )}

                <a
                  href={whatsappApprovalUrl}
                  target={hasValidWhatsapp ? "_blank" : undefined}
                  rel={hasValidWhatsapp ? "noopener noreferrer" : undefined}
                  className="w-full btn-ghost justify-center py-3.5 text-sm inline-flex"
                >
                  Alinhar Início no WhatsApp ↗
                </a>
              </div>
            </div>

            {/* Right — Interactive Selectable Payment Methods */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Escolha a Modalidade de Pagamento
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clique na opção desejada para vinculá-la à sua aprovação
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {paymentMethods.length} opções
                </span>
              </div>

              {paymentMethods.map((pm, idx) => {
                const isSelected = selectedPaymentIdx === idx;
                return (
                  <button
                    key={idx}
                    data-proposal-payment
                    aria-pressed={isSelected}
                    type="button"
                    onClick={() => setSelectedPaymentIdx(idx)}
                    className={`w-full text-left rounded-2xl border p-6 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/[0.08] shadow-[0_12px_34px_-18px_rgba(255,64,1,0.35)]"
                        : "border-border bg-card/50 hover:border-foreground/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </span>
                        <h4 className="font-display text-base md:text-lg font-medium text-foreground flex items-center gap-2">
                          <span className="font-mono text-xs text-primary tabular-nums">
                            0{idx + 1}.
                          </span>
                          <span>{pm.titulo}</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[11px] font-mono text-primary">
                            Selecionada
                          </span>
                        )}
                        {!isSelected && pm.destaque && (
                          <span className="text-xs font-mono text-primary font-medium">
                            Recomendada
                          </span>
                        )}
                      </div>
                    </div>
                    {pm.detalhe && (
                      <p className="text-sm text-muted-foreground pl-8 leading-[1.6]">
                        {pm.detalhe}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-border py-10 text-xs text-muted-foreground">
        <div className="orion-shell flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-display text-sm font-medium text-foreground">
            Lucas Evangelista — Direção Criativa &amp; Design Estratégico
          </Link>
          <div className="tabular-nums">
            Proposta exclusiva para {clientDisplayName} · {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Case Study Interactive Modal inside Proposal — Standardized with ProjectDetail */}
      <AnimatePresence>
        {selectedCaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog" aria-modal="true" aria-label="Estudo de caso da proposta"
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md overflow-y-auto p-4 md:p-10 flex items-start justify-center"
            onClick={() => setSelectedCaseModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-[960px] w-full overflow-hidden my-6"
            >
              <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                    <span className="text-primary font-medium">{selectedCaseModal.categoria}</span>
                    {parseCaseStudy(selectedCaseModal).cliente && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{parseCaseStudy(selectedCaseModal).cliente}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-medium text-foreground">
                    {selectedCaseModal.titulo}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaseModal(null)}
                  aria-label="Fechar estudo de caso"
                  className="p-2 rounded-full bg-secondary border border-border text-foreground hover:border-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {selectedCaseModal.imagem_capa && (
                  <div className="rounded-xl overflow-hidden border border-border bg-secondary">
                    <img
                      src={selectedCaseModal.imagem_capa}
                      alt={selectedCaseModal.titulo}
                      className="w-full max-h-[460px] object-cover"
                    />
                  </div>
                )}

                {(() => {
                  const cd = parseCaseStudy(selectedCaseModal);
                  const hasResults = Boolean(cd.resultados?.trim());
                  return (
                    <div className="space-y-6">
                      {cd.resumo && (
                        <div>
                          <span className="section-label mb-2">
                            <span className="label-num">01.</span> Contexto do Projeto
                          </span>
                          <p className="text-base text-foreground/90 leading-[1.7]">{cd.resumo}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cd.desafio && (
                          <div className="bg-background border border-border rounded-xl p-5">
                            <span className="section-label mb-2 text-xs">
                              <span className="label-num">02.</span> O Desafio
                            </span>
                            <p className="text-xs md:text-sm text-muted-foreground leading-[1.65]">
                              {cd.desafio}
                            </p>
                          </div>
                        )}
                        {cd.estrategia && (
                          <div className="bg-background border border-border rounded-xl p-5">
                            <span className="section-label mb-2 text-xs">
                              <span className="label-num">03.</span> Direção Criativa
                            </span>
                            <p className="text-xs md:text-sm text-muted-foreground leading-[1.65]">
                              {cd.estrategia}
                            </p>
                          </div>
                        )}
                        {hasResults && (
                          <div className="bg-primary/[0.08] border border-primary/30 rounded-xl p-5">
                            <span className="section-label mb-2 text-xs">
                              <span className="label-num">04.</span> Resultados
                            </span>
                            <p className="text-xs md:text-sm text-foreground/90 leading-[1.65]">
                              {cd.resultados}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {selectedCaseModal.galeria && selectedCaseModal.galeria.length > 0 && (
                  <div>
                    <span className="section-label mb-4">
                      <span className="label-num">Galeria.</span> Desdobramentos Visuais
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCaseModal.galeria.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${selectedCaseModal.titulo} — Imagem ${idx + 1}`}
                          className="w-full rounded-xl border border-border object-cover aspect-[4/3]"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalView;
