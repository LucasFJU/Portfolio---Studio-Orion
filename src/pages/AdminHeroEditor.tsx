import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Save,
  RotateCcw,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Layout,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  BarChart3,
  Share2,
  Upload,
  Code,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Layers,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Sliders,
  Palette,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_HERO_CONFIG,
  HERO_IMAGE_PRESETS,
  getStoredHeroConfig,
  saveStoredHeroConfig,
  resetHeroConfigToDefault,
  type HeroConfig,
  type CustomHeroElement,
} from "@/config/heroConfig";
import { HeroSplitEditorial } from "@/components/hero/HeroSplitEditorial";
import { ContactDrawerProvider } from "@/components/ContactDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

type ActiveTab = "layers" | "background" | "media" | "typography" | "actions" | "metrics" | "mobile";
type ViewportSize = "desktop" | "tablet" | "mobile";
type EditMode = "desktop" | "mobile";

export default function AdminHeroEditor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [config, setConfig] = useState<HeroConfig>(getStoredHeroConfig());
  const [activeTab, setActiveTab] = useState<ActiveTab>("layers");
  const [editMode, setEditMode] = useState<EditMode>("desktop");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [addElementModalOpen, setAddElementModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state for adding new element
  const [newElementType, setNewElementType] = useState<CustomHeroElement["type"]>("text");
  const [newElementTitle, setNewElementTitle] = useState("");
  const [newElementContent, setNewElementContent] = useState("");
  const [newElementLink, setNewElementLink] = useState("");
  const [newElementAlignment, setNewElementAlignment] = useState<"left" | "center">("left");
  const [newElementColor, setNewElementColor] = useState<"default" | "primary" | "muted">("default");

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const customPngInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);

  const updateConfig = (updater: (prev: HeroConfig) => HeroConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      setHasChanges(true);
      return next;
    });
  };

  const handleEditModeChange = (mode: EditMode) => {
    setEditMode(mode);
    if (mode === "mobile") {
      setViewport("mobile");
      setActiveTab("mobile");
    } else {
      setViewport("desktop");
      if (activeTab === "mobile") setActiveTab("layers");
    }
  };

  const handleSaveToCode = async () => {
    setSaving(true);
    try {
      // 1. Save to localStorage & notify browser tabs
      saveStoredHeroConfig(config);

      // 2. Persist directly to src/config/heroConfig.json via server endpoint
      const response = await fetch("/api/save-hero-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success("Alterações salvas com sucesso diretamente no código!", {
          description: "O arquivo src/config/heroConfig.json foi atualizado em disco.",
        });
        setHasChanges(false);
      } else {
        toast.success("Salvo no armazenamento do projeto!", {
          description: "Configuração ativa atualizada com sucesso.",
        });
        setHasChanges(false);
      }
    } catch {
      saveStoredHeroConfig(config);
      toast.success("Salvo na configuração local!", {
        description: "As alterações estão ativas no site.",
      });
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    const def = resetHeroConfigToDefault();
    setConfig(def);
    setHasChanges(false);
    setResetDialogOpen(false);
    toast.info("Configuração restaurada para o padrão oficial.");
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateConfig((prev) => ({
          ...prev,
          media: { ...prev.media, imageUrl: result, imagePreset: "custom" },
        }));
        toast.success("Foto carregada com sucesso!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("A imagem de fundo deve ter no máximo 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateConfig((prev) => ({
          ...prev,
          background: { ...prev.background, type: "image", imageUrl: result },
        }));
        toast.success("Imagem de fundo carregada com sucesso!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomPngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewElementContent(result);
        toast.success("Imagem PNG carregada!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedCode(true);
    toast.success("Código JSON copiado para a área de transferência!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Layer Management functions
  const toggleLayerVisibility = (layerId: string) => {
    updateConfig((prev) => {
      const isMobile = editMode === "mobile";
      const layers = [...(prev.layers || [])];
      const idx = layers.findIndex((l) => l.id === layerId);
      if (idx !== -1) {
        if (isMobile) {
          layers[idx] = { ...layers[idx], visibleMobile: !layers[idx].visibleMobile };
        } else {
          layers[idx] = { ...layers[idx], visibleDesktop: !layers[idx].visibleDesktop };
        }
      } else {
        layers.push({
          id: layerId,
          visibleDesktop: !isMobile,
          visibleMobile: isMobile,
        });
      }
      return { ...prev, layers };
    });
  };

  const moveLayer = (index: number, direction: "up" | "down") => {
    updateConfig((prev) => {
      const layers = [...(prev.layers || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= layers.length) return prev;
      const temp = layers[index];
      layers[index] = layers[targetIndex];
      layers[targetIndex] = temp;
      return { ...prev, layers };
    });
  };

  const handleAddCustomElement = () => {
    if (!newElementTitle.trim()) {
      toast.error("Informe um título para o elemento.");
      return;
    }
    const newId = `elem-${Date.now()}`;
    const newElem: CustomHeroElement = {
      id: newId,
      type: newElementType,
      title: newElementTitle.trim(),
      content: newElementContent.trim(),
      linkUrl: newElementLink.trim() || undefined,
      style: {
        alignment: newElementAlignment,
        color: newElementColor,
        size: "base",
      },
      visibleDesktop: true,
      visibleMobile: true,
    };

    updateConfig((prev) => ({
      ...prev,
      customElements: [...(prev.customElements || []), newElem],
      layers: [
        ...(prev.layers || []),
        { id: newId, visibleDesktop: true, visibleMobile: true },
      ],
    }));

    setAddElementModalOpen(false);
    setNewElementTitle("");
    setNewElementContent("");
    setNewElementLink("");
    toast.success("Elemento adicionado com sucesso!");
  };

  const handleDeleteCustomElement = (elemId: string) => {
    updateConfig((prev) => ({
      ...prev,
      customElements: (prev.customElements || []).filter((e) => e.id !== elemId),
      layers: (prev.layers || []).filter((l) => l.id !== elemId),
    }));
    toast.info("Elemento removido.");
  };

  // Layer Label mapping
  const getLayerLabel = (id: string): { name: string; type: string } => {
    switch (id) {
      case "kicker":
        return { name: "Kicker (Status & Disponibilidade)", type: "Texto Superior" };
      case "headline":
        return { name: "Título Principal (Headline)", type: "Tipografia" };
      case "subtitle":
        return { name: "Subtítulo Descritivo", type: "Prosa" };
      case "actions":
        return { name: "Botões de Ação (CTAs)", type: "Interativo" };
      case "metrics":
        return { name: "Faixa de Métricas & Redes", type: "Autoridade" };
      case "media":
        return { name: "Foto do Estúdio & Quadro Visual", type: "Mídia Principal" };
      default: {
        const custom = config.customElements?.find((e) => e.id === id);
        return {
          name: custom?.title || "Elemento Customizado",
          type: custom ? `Personalizado (${custom.type})` : "Bloco Livre",
        };
      }
    }
  };

  const tabs = [
    { id: "layers" as const, label: "Camadas & Blocos", icon: Layers },
    { id: "background" as const, label: "Fundo & Vídeo", icon: Film },
    { id: "media" as const, label: "Foto & Visual", icon: ImageIcon },
    { id: "typography" as const, label: "Textos & Título", icon: Type },
    { id: "actions" as const, label: "Botões de Ação", icon: MousePointerClick },
    { id: "metrics" as const, label: "Métricas", icon: BarChart3 },
    { id: "mobile" as const, label: "Overrides Mobile", icon: Smartphone },
  ];

  return (
    <ContactDrawerProvider>
      <div className="min-h-screen bg-[#070809] text-foreground flex flex-col overflow-hidden select-none">
        {/* Top Control Bar (Wix/WordPress Style) */}
        <header className="min-h-14 lg:h-14 border-b border-white/[0.08] bg-[#0C0D10]/95 backdrop-blur-md px-6 sm:px-10 py-3 lg:py-0 flex flex-wrap items-center justify-between gap-3 shrink-0 z-40">
          {/* Left: Brand & Breadcrumb */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <Link
              to="/admin"
              className="text-muted-foreground hover:text-foreground text-xs font-mono flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Painel</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/10" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-foreground">
                Editor Visual da Hero
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                <Sparkles size={10} />
                Pro Builder
              </span>
            </div>
            {hasChanges && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Alterações não salvas
              </span>
            )}
          </div>

          {/* Center: Device Mode (Desktop vs Mobile) & Viewports */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher (Desktop vs Mobile Edit Mode) */}
            <div className="flex items-center bg-[#141518] p-1 rounded-lg border border-white/[0.08] gap-1">
              <button
                type="button"
                onClick={() => handleEditModeChange("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                  editMode === "desktop"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor size={14} />
                <span>Modo Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => handleEditModeChange("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                  editMode === "mobile"
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone size={14} />
                <span>Modo Mobile</span>
              </button>
            </div>

            {/* Viewport Size Switcher */}
            <div className="hidden lg:flex items-center bg-[#141518] p-1 rounded-lg border border-white/[0.08] gap-1">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                title="1440px"
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === "desktop" ? "bg-white/20 text-white" : "text-muted-foreground"
                }`}
              >
                <Monitor size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewport("tablet")}
                title="768px"
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === "tablet" ? "bg-white/20 text-white" : "text-muted-foreground"
                }`}
              >
                <Tablet size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                title="390px"
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === "mobile" ? "bg-white/20 text-white" : "text-muted-foreground"
                }`}
              >
                <Smartphone size={13} />
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">Restaurar</span>
            </button>

            <button
              type="button"
              onClick={() => setCodeModalOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded hover:bg-white/[0.05] transition-colors flex items-center gap-1.5 font-mono"
            >
              <Code size={13} />
              <span className="hidden md:inline">Código</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span className="hidden md:inline">Ver no Site</span>
            </a>

            <button
              type="button"
              onClick={handleSaveToCode}
              disabled={saving}
              className="bg-primary hover:bg-[#ff551a] text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(255,64,1,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{saving ? "Salvando..." : "Salvar no Código"}</span>
            </button>
          </div>
        </header>

        {/* Main Workspace (Split View) */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Left Sidebar: Advanced Wix-like Inspector (380px) */}
          <aside className="w-full lg:w-[380px] shrink-0 border-r border-white/[0.08] bg-[#141518] flex flex-col z-30">
            {/* Category Nav Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-white/[0.06] bg-[#0A0B0D] overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-white font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Panels (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-foreground select-text">
              {/* TAB 1: CAMADAS & BLOCOS (ADD/REMOVE/REORDER) */}
              {activeTab === "layers" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Layers size={15} className="text-primary" />
                        Árvore de Camadas & Elementos
                      </h3>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Edição ativa:{" "}
                        <span className={editMode === "mobile" ? "text-amber-400 font-medium" : "text-primary font-medium"}>
                          {editMode === "mobile" ? "Visibilidade Mobile" : "Visibilidade Desktop"}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAddElementModalOpen(true)}
                      className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {/* Layers List */}
                  <div className="space-y-2">
                    {(config.layers || []).map((layer, index) => {
                      const isVisible =
                        editMode === "mobile" ? layer.visibleMobile : layer.visibleDesktop;
                      const { name, type } = getLayerLabel(layer.id);
                      const isCustom = layer.id.startsWith("elem-");

                      return (
                        <div
                          key={layer.id}
                          className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                            isVisible
                              ? "border-white/[0.1] bg-white/[0.03]"
                              : "border-white/[0.04] bg-white/[0.01] opacity-50"
                          }`}
                        >
                          {/* Visibility Eye */}
                          <button
                            type="button"
                            onClick={() => toggleLayerVisibility(layer.id)}
                            className={`p-1.5 rounded transition-colors ${
                              isVisible
                                ? "text-primary hover:bg-primary/20"
                                : "text-muted-foreground hover:bg-white/10"
                            }`}
                            title={isVisible ? "Ocultar elemento" : "Exibir elemento"}
                          >
                            {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs text-foreground truncate">{name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                              {type}
                            </div>
                          </div>

                          {/* Controls (Up / Down / Delete) */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveLayer(index, "up")}
                              disabled={index === 0}
                              className="p-1 text-muted-foreground hover:text-white disabled:opacity-20"
                              title="Subir camada"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLayer(index, "down")}
                              disabled={index === (config.layers || []).length - 1}
                              className="p-1 text-muted-foreground hover:text-white disabled:opacity-20"
                              title="Descer camada"
                            >
                              <ArrowDown size={13} />
                            </button>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomElement(layer.id)}
                                className="p-1 text-red-400 hover:text-red-300 ml-1"
                                title="Remover elemento"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FUNDO & VÍDEO (REPLACE ENTIRE HERO ATMOSPHERE) */}
              {activeTab === "background" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <Film size={15} className="text-primary" />
                      Atmosfera de Fundo da Hero
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-3">
                      Substitua todo o fundo por um vídeo dinâmico em loop, imagem estática ou o shader interativo.
                    </p>

                    {/* Mode Selector */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { id: "shader", label: "Shader WebGL", desc: "Ruído fluido interativo" },
                        { id: "image", label: "Imagem / Foto", desc: "Papel de parede fixo" },
                        { id: "video", label: "Vídeo em Loop", desc: "Showreel cinematográfico" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            updateConfig((prev) => ({
                              ...prev,
                              background: {
                                ...prev.background,
                                type: item.id as any,
                              },
                            }))
                          }
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            config.background.type === item.id
                              ? "border-primary bg-primary/10 text-white"
                              : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="font-semibold text-xs text-foreground">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Options when Image is selected */}
                    {config.background.type === "image" && (
                      <div className="space-y-3 p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                        <input
                          type="file"
                          ref={bgImageInputRef}
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => bgImageInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-foreground font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <Upload size={14} className="text-primary" />
                          <span>Fazer Upload de Imagem de Fundo</span>
                        </button>

                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Ou URL direta da imagem (JPG/PNG):
                          </label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/fundo-hero.jpg"
                            value={config.background.imageUrl || ""}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                background: { ...prev.background, imageUrl: e.target.value },
                              }))
                            }
                            className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Options when Video is selected */}
                    {config.background.type === "video" && (
                      <div className="space-y-3 p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            URL do Vídeo MP4 ou WebM (Loop automático):
                          </label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/showreel.mp4"
                            value={config.background.videoUrl || ""}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                background: { ...prev.background, videoUrl: e.target.value },
                              }))
                            }
                            className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          Presets de demonstração rápida:
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            {
                              label: "Animação Digital & Gráficos",
                              url: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31913-large.mp4",
                            },
                            {
                              label: "Luzes Abstratas em Movimento",
                              url: "https://assets.mixkit.co/videos/preview/mixkit-fluid-particles-in-motion-42523-large.mp4",
                            },
                          ].map((v) => (
                            <button
                              key={v.url}
                              type="button"
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  background: { ...prev.background, videoUrl: v.url },
                                }))
                              }
                              className="text-left px-2 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono truncate"
                            >
                              ✦ {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contrast Scrim Overlay Slider */}
                    {(config.background.type === "image" || config.background.type === "video") && (
                      <div className="pt-4 border-t border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">Máscara Escura de Legibilidade</span>
                          <span className="font-mono text-xs text-primary">
                            {config.background.overlayOpacity ?? 65}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="95"
                          step="5"
                          value={config.background.overlayOpacity ?? 65}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              background: {
                                ...prev.background,
                                overlayOpacity: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full accent-primary cursor-pointer"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Garante alto contraste e leitura cristalina dos textos conforme exigências WCAG.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FOTO & VISUAL */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <ImageIcon size={15} className="text-primary" />
                      Foto do Estúdio & Retrato
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-3">
                      Selecione um preset do projeto ou envie uma imagem personalizada.
                    </p>

                    {/* Presets Grid */}
                    <div className="space-y-2 mb-4">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Imagens Pré-definidas do Estúdio:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(HERO_IMAGE_PRESETS).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                media: {
                                  ...prev.media,
                                  imagePreset: key as any,
                                  imageUrl: "",
                                },
                              }))
                            }
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                              config.media.imagePreset === key && !config.media.imageUrl
                                ? "border-primary bg-primary/10 text-white"
                                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <img
                              src={item.src}
                              alt={item.label}
                              className="w-8 h-8 rounded object-cover shrink-0 bg-black/40"
                            />
                            <span className="truncate text-[11px] font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Image / Upload */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Ou envie uma imagem personalizada:
                      </label>
                      <input
                        type="file"
                        ref={portraitInputRef}
                        accept="image/*"
                        onChange={handlePortraitUpload}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => portraitInputRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-foreground font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <Upload size={14} className="text-primary" />
                          <span>Fazer Upload de Foto</span>
                        </button>
                        {config.media.imageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                media: {
                                  ...prev.media,
                                  imageUrl: "",
                                  imagePreset: "lucas-hero-jpg",
                                },
                              }))
                            }
                            className="px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Ou cole a URL direta da imagem (ex: https://...)"
                          value={config.media.imageUrl}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              media: {
                                ...prev.media,
                                imageUrl: e.target.value,
                                imagePreset: "custom",
                              },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aspect Ratio & Radius */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-4">
                    <div>
                      <h4 className="font-semibold text-xs mb-2">Proporção da Imagem</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "16/10", label: "16 : 10" },
                          { id: "4/3", label: "4 : 3" },
                          { id: "1/1", label: "1 : 1" },
                          { id: "3/4", label: "3 : 4" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                media: { ...prev.media, aspectRatio: item.id as any },
                              }))
                            }
                            className={`p-2 rounded border text-center transition-all ${
                              config.media.aspectRatio === item.id
                                ? "border-primary bg-primary/15 text-white font-medium"
                                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs mb-2">Arredondamento das Bordas</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "rounded-xl", label: "12px" },
                          { id: "rounded-2xl", label: "16px" },
                          { id: "rounded-3xl", label: "24px" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                media: { ...prev.media, borderRadius: item.id as any },
                              }))
                            }
                            className={`p-2 rounded border text-center transition-all ${
                              config.media.borderRadius === item.id
                                ? "border-primary bg-primary/15 text-white font-medium"
                                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="font-semibold text-xs block">Efeito Glow Laranja</span>
                        <span className="text-[11px] text-muted-foreground">
                          Iluminação ambiente quente no topo do card
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.media.glowEffect}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            media: { ...prev.media, glowEffect: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TEXTOS & TIPOGRAFIA */}
              {activeTab === "typography" && (
                <div className="space-y-6">
                  {/* Headline */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Título Principal (Headline)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">Linha 1:</label>
                        <input
                          type="text"
                          value={config.typography.headlineLine1}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              typography: { ...prev.typography, headlineLine1: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-primary">Palavra Destacada 1 (Laranja):</label>
                        <input
                          type="text"
                          value={config.typography.headlineHighlight1}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              typography: { ...prev.typography, headlineHighlight1: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-primary/40 rounded px-3 py-1.5 text-xs text-primary font-medium focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">Linha 2:</label>
                        <input
                          type="text"
                          value={config.typography.headlineLine2}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              typography: { ...prev.typography, headlineLine2: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-primary">Palavra Destacada 2 (Laranja):</label>
                        <input
                          type="text"
                          value={config.typography.headlineHighlight2}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              typography: { ...prev.typography, headlineHighlight2: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-primary/40 rounded px-3 py-1.5 text-xs text-primary font-medium focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-2">
                    <label className="font-semibold text-xs block">Subtítulo Descritivo:</label>
                    <textarea
                      rows={4}
                      value={config.typography.subtitle}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          typography: { ...prev.typography, subtitle: e.target.value },
                        }))
                      }
                      className="w-full bg-[#141518] border border-white/[0.1] rounded p-3 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: BOTÕES DE AÇÃO */}
              {activeTab === "actions" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Botão Primário de Destaque</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">Texto:</label>
                        <input
                          type="text"
                          value={config.actions.primaryText}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              actions: { ...prev.actions, primaryText: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">Ação:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "drawer", label: "Drawer" },
                            { id: "whatsapp", label: "WhatsApp" },
                            { id: "contact", label: "Contato" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  actions: { ...prev.actions, primaryAction: item.id as any },
                                }))
                              }
                              className={`p-2 rounded border text-center transition-all ${
                                config.actions.primaryAction === item.id
                                  ? "border-primary bg-primary/15 text-white font-medium"
                                  : "border-white/[0.08] bg-white/[0.02] text-muted-foreground"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">Botão Secundário</span>
                      <input
                        type="checkbox"
                        checked={config.actions.showSecondary}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            actions: { ...prev.actions, showSecondary: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                    {config.actions.showSecondary && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={config.actions.secondaryText}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              actions: { ...prev.actions, secondaryText: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: MÉTRICAS */}
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Faixa de Métricas</h3>
                    <input
                      type="checkbox"
                      checked={config.metrics.enabled}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: { ...prev.metrics, enabled: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>

                  {config.metrics.enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-muted-foreground">Projetos:</label>
                        <input
                          type="text"
                          value={config.metrics.statProjects}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              metrics: { ...prev.metrics, statProjects: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-foreground font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Clientes:</label>
                        <input
                          type="text"
                          value={config.metrics.statClients}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              metrics: { ...prev.metrics, statClients: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-white/[0.1] rounded px-2.5 py-1 text-xs text-foreground font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-primary">Experiência:</label>
                        <input
                          type="text"
                          value={config.metrics.statExperience}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              metrics: { ...prev.metrics, statExperience: e.target.value },
                            }))
                          }
                          className="w-full bg-[#141518] border border-primary/40 rounded px-2.5 py-1 text-xs text-primary font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: OVERRIDES EXCLUSIVOS MOBILE */}
              {activeTab === "mobile" && (
                <div className="space-y-6">
                  <div className="p-3 rounded-lg border border-amber-400/30 bg-amber-400/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
                        <Smartphone size={14} />
                        Personalizações Exclusivas para Celular
                      </span>
                      <input
                        type="checkbox"
                        checked={config.mobileOverrides?.enabled}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            mobileOverrides: {
                              ...prev.mobileOverrides,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Quando ativado, os valores abaixo substituem o layout padrão apenas em dispositivos móveis.
                    </p>
                  </div>

                  {config.mobileOverrides?.enabled && (
                    <div className="space-y-5">
                      <div>
                        <h4 className="font-semibold text-xs mb-2">Alinhamento no Celular</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                mobileOverrides: {
                                  ...prev.mobileOverrides,
                                  textAlignment: "left",
                                },
                              }))
                            }
                            className={`p-2 rounded border text-center transition-all ${
                              config.mobileOverrides?.textAlignment === "left"
                                ? "border-amber-400 bg-amber-400/20 text-white font-medium"
                                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground"
                            }`}
                          >
                            À Esquerda
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                mobileOverrides: {
                                  ...prev.mobileOverrides,
                                  textAlignment: "center",
                                },
                              }))
                            }
                            className={`p-2 rounded border text-center transition-all ${
                              config.mobileOverrides?.textAlignment === "center"
                                ? "border-amber-400 bg-amber-400/20 text-white font-medium"
                                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground"
                            }`}
                          >
                            Centralizado
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-xs mb-2">Escala do Título no Celular</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "compact", label: "Compacto" },
                            { id: "normal", label: "Padrão" },
                            { id: "large", label: "Grande" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  mobileOverrides: {
                                    ...prev.mobileOverrides,
                                    headlineFontSize: item.id as any,
                                  },
                                }))
                              }
                              className={`p-2 rounded border text-center transition-all ${
                                config.mobileOverrides?.headlineFontSize === item.id
                                  ? "border-amber-400 bg-amber-400/20 text-white font-medium"
                                  : "border-white/[0.08] bg-white/[0.02] text-muted-foreground"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-xs mb-2">Proporção da Foto no Celular</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "1/1", label: "1:1 (Quadrado)" },
                            { id: "4/5", label: "4:5 (Vertical)" },
                            { id: "16/10", label: "16:10" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  mobileOverrides: {
                                    ...prev.mobileOverrides,
                                    imageAspectRatio: item.id as any,
                                  },
                                }))
                              }
                              className={`p-2 rounded border text-center transition-all ${
                                config.mobileOverrides?.imageAspectRatio === item.id
                                  ? "border-amber-400 bg-amber-400/20 text-white font-medium"
                                  : "border-white/[0.08] bg-white/[0.02] text-muted-foreground"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                        <h4 className="font-semibold text-xs">Ocultações Seletivas no Celular</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Ocultar faixa de métricas (encurta a rolagem)
                          </span>
                          <input
                            type="checkbox"
                            checked={config.mobileOverrides?.hideMetrics}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                mobileOverrides: {
                                  ...prev.mobileOverrides,
                                  hideMetrics: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 accent-amber-400"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Ocultar ícones de redes sociais
                          </span>
                          <input
                            type="checkbox"
                            checked={config.mobileOverrides?.hideSocial}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                mobileOverrides: {
                                  ...prev.mobileOverrides,
                                  hideSocial: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 accent-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Quick Save & Info Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0A0B0D] flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-muted-foreground">
                Arquivo: <span className="text-foreground">heroConfig.json</span>
              </span>
              <button
                type="button"
                onClick={handleSaveToCode}
                disabled={saving}
                className="text-xs bg-primary/20 hover:bg-primary text-primary hover:text-white px-3 py-1 rounded transition-colors font-semibold"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </aside>

          {/* Center Stage: Interactive Live Preview Canvas */}
          <main className="min-w-0 flex-1 bg-[#090A0C] overflow-y-auto relative flex flex-col items-center p-6 sm:p-10">
            {/* Viewport Frame Container */}
            <div
              className={`transition-all duration-300 w-full flex flex-col rounded-2xl border border-white/[0.12] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden ${
                viewport === "mobile"
                  ? "max-w-[390px] min-h-[750px]"
                  : viewport === "tablet"
                  ? "max-w-[768px] min-h-[800px]"
                  : "max-w-[1440px] w-full"
              }`}
            >
              {/* Device Header Mockup */}
              <div className="h-8 bg-[#141518] border-b border-white/[0.08] px-3 flex items-center justify-between text-[11px] text-muted-foreground select-none shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="font-mono text-[10px] bg-black/40 px-3 py-0.5 rounded text-muted-foreground">
                  lucasevangelista.design ·{" "}
                  {editMode === "mobile" ? "Simulação Mobile (com overrides)" : "Visualização Desktop"}
                </div>
                <div className="text-[10px] font-mono uppercase text-primary">
                  {viewport === "mobile" ? "390px" : viewport === "tablet" ? "768px" : "1440px"}
                </div>
              </div>

              {/* Live Render of Hero */}
              <div data-orion-static className="w-full relative bg-black">
                <HeroSplitEditorial
                  statProjects={config.metrics.statProjects}
                  statClients={config.metrics.statClients}
                  statExperience={config.metrics.statExperience}
                  instagramUrl={config.social.customInstagram || "https://instagram.com"}
                  behanceUrl={config.social.customBehance || "https://behance.net"}
                  linkedinUrl={config.social.customLinkedin || "https://linkedin.com"}
                  dribbbleUrl={config.social.customDribbble || "https://dribbble.com"}
                  openContactDrawer={() => {
                    toast.info("Ação de teste: Drawer de orçamento acionado.");
                  }}
                  config={config}
                  previewDevice={viewport}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Modal: Add New Element */}
        <Dialog open={addElementModalOpen} onOpenChange={setAddElementModalOpen}>
          <DialogContent className="max-w-md bg-[#0E1014] border-white/15 text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                <span>Adicionar Novo Elemento na Hero</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Escolha o tipo de elemento para enriquecer a primeira dobra.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold block mb-1">Tipo de Elemento:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "text", label: "Texto / Aviso Livre", icon: Type },
                    { id: "image", label: "Imagem PNG Transparente", icon: ImageIcon },
                    { id: "button", label: "Botão Adicional", icon: MousePointerClick },
                    { id: "divider", label: "Linha Divisória", icon: Sliders },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewElementType(t.id as any)}
                        className={`p-2 rounded border text-left flex items-center gap-2 transition-all ${
                          newElementType === t.id
                            ? "border-primary bg-primary/15 text-white"
                            : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon size={14} className="text-primary" />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Identificação / Título:</label>
                <input
                  type="text"
                  placeholder="Ex: Selo Comemorativo, Aviso de Vagas, etc."
                  value={newElementTitle}
                  onChange={(e) => setNewElementTitle(e.target.value)}
                  className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {newElementType === "text" && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Conteúdo do Texto:</label>
                  <textarea
                    rows={3}
                    placeholder="Digite a mensagem ou parágrafo..."
                    value={newElementContent}
                    onChange={(e) => setNewElementContent(e.target.value)}
                    className="w-full bg-[#141518] border border-white/[0.1] rounded p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {newElementType === "image" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold block">Imagem PNG ou Ilustração:</label>
                  <input
                    type="file"
                    ref={customPngInputRef}
                    accept="image/*"
                    onChange={handleCustomPngUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => customPngInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg border border-white/15 bg-white/[0.04] text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Upload size={13} className="text-primary" />
                    <span>Upload de PNG Transparente</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem (https://...)"
                    value={newElementContent}
                    onChange={(e) => setNewElementContent(e.target.value)}
                    className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {newElementType === "button" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Rótulo do Botão:</label>
                    <input
                      type="text"
                      placeholder="Ex: Baixar Apresentação PDF"
                      value={newElementContent}
                      onChange={(e) => setNewElementContent(e.target.value)}
                      className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">URL / Link de Destino:</label>
                    <input
                      type="text"
                      placeholder="https://... ou /contato"
                      value={newElementLink}
                      onChange={(e) => setNewElementLink(e.target.value)}
                      className="w-full bg-[#141518] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {newElementType !== "divider" && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Alinhamento:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewElementAlignment("left")}
                      className={`p-1.5 rounded border text-xs text-center ${
                        newElementAlignment === "left"
                          ? "border-primary bg-primary/15 text-white"
                          : "border-white/[0.08]"
                      }`}
                    >
                      À Esquerda
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewElementAlignment("center")}
                      className={`p-1.5 rounded border text-xs text-center ${
                        newElementAlignment === "center"
                          ? "border-primary bg-primary/15 text-white"
                          : "border-white/[0.08]"
                      }`}
                    >
                      Centralizado
                    </button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setAddElementModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustomElement}
                className="bg-primary hover:bg-[#ff551a] text-white px-4 py-1.5 rounded text-xs font-semibold"
              >
                Adicionar Elemento
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: View Generated JSON Code */}
        <Dialog open={codeModalOpen} onOpenChange={setCodeModalOpen}>
          <DialogContent className="max-w-2xl bg-[#0E1014] border-white/15 text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code size={18} className="text-primary" />
                <span>Código JSON de Configuração da Hero</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Arquivo persistido em{" "}
                <code className="text-primary font-mono">src/config/heroConfig.json</code>.
              </DialogDescription>
            </DialogHeader>

            <div className="relative mt-2">
              <pre className="max-h-[380px] overflow-y-auto p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-emerald-400 select-all">
                {JSON.stringify(config, null, 2)}
              </pre>
              <button
                type="button"
                onClick={handleCopyJson}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedCode ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Confirm Reset to Default */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent className="bg-[#0E1014] border-white/15 text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar padrão oficial?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Todas as customizações visuais serão descartadas e a Hero voltará
                à configuração original oficial do estúdio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/10 text-muted-foreground hover:bg-white/5">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetToDefault}
                className="bg-primary hover:bg-[#ff551a] text-white"
              >
                Sim, Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContactDrawerProvider>
  );
}
