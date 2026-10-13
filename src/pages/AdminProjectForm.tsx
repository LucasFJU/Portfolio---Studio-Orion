import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Plus,
  Eye,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  Link2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { parseCaseStudy, serializeCaseStudy } from "@/lib/caseStudy";
import {
  extractBehanceUsername,
  fetchBehanceProfileProjects,
  fetchBehanceProjectDetails,
  isValidBehanceProjectUrl,
  type BehanceProfileProjectItem,
} from "@/lib/behance";

const categories = [
  "Identidade visual",
  "Design para redes sociais",
  "Sites e interfaces",
  "Brand Design",
  "Social Media",
  "Web Design",
  "UI/UX Design",
];
const projectStatuses = ["Concluído", "Em andamento", "Em breve", "Rascunho"];
const DRAFT_KEY = "admin-project-draft-v2";

const AdminProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const draftTimeout = useRef<ReturnType<typeof setTimeout>>();

  const [form, setForm] = useState(() => {
    if (!id) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      titulo: "",
      cliente: "",
      categoria: "Identidade visual",
      metrica: "",
      resumo: "",
      desafio: "",
      estrategia: "",
      resultados: "",
      entregaveis: "",
      tags: "",
      link_projeto: "",
      destaque: true,
      status: "Concluído",
    };
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Behance Importer State
  const [behanceTab, setBehanceTab] = useState<"url" | "profile">("url");
  const [behanceProjectUrl, setBehanceProjectUrl] = useState("");
  const [behanceProfileInput, setBehanceProfileInput] = useState("");
  const [importingUrl, setImportingUrl] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileProjects, setProfileProjects] = useState<BehanceProfileProjectItem[]>([]);
  const [importingProfileItemId, setImportingProfileItemId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("import") === "behance") {
      setBehanceTab("profile");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEditing) return;
    if (draftTimeout.current) clearTimeout(draftTimeout.current);
    draftTimeout.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 500);
    return () => {
      if (draftTimeout.current) clearTimeout(draftTimeout.current);
    };
  }, [form, isEditing]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  const { data: existingPortfolioProjects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, titulo, link_projeto");
      return data || [];
    },
    enabled: !!user,
  });

  const hasAutoLoadedProfile = useRef(false);

  // Pre-fill Behance username from site_settings if configured
  useEffect(() => {
    if (settings && !behanceProfileInput) {
      const savedBehance = settings.find((s: any) => s.key === "social_behance")?.value || "";
      const extracted = extractBehanceUsername(savedBehance);
      if (extracted) {
        setBehanceProfileInput(extracted);
      }
    }
  }, [settings, behanceProfileInput]);

  // Auto-fetch profile projects when switching to Profile tab if username is known
  useEffect(() => {
    if (
      behanceTab === "profile" &&
      behanceProfileInput &&
      profileProjects.length === 0 &&
      !loadingProfile &&
      !hasAutoLoadedProfile.current
    ) {
      hasAutoLoadedProfile.current = true;
      const username = extractBehanceUsername(behanceProfileInput);
      if (username) {
        setLoadingProfile(true);
        fetchBehanceProfileProjects(username)
          .then((items) => setProfileProjects(items))
          .catch(() => {})
          .finally(() => setLoadingProfile(false));
      }
    }
  }, [behanceTab, behanceProfileInput, profileProjects.length, loadingProfile]);

  const { data: project } = useQuery({
    queryKey: ["admin-project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing && !!user,
  });

  useEffect(() => {
    if (project) {
      const parsed = parseCaseStudy(project);
      setForm({
        titulo: project.titulo,
        cliente: parsed.cliente || "",
        categoria: project.categoria,
        metrica: parsed.metrica || "",
        resumo: parsed.resumo || "",
        desafio: parsed.desafio || "",
        estrategia: parsed.estrategia || "",
        resultados: parsed.resultados || "",
        entregaveis: parsed.entregaveis?.join(", ") || "",
        tags: project.tags?.join(", ") || "",
        link_projeto: project.link_projeto || "",
        destaque: project.destaque || false,
        status: project.status || "Concluído",
      });
      setCoverPreview(project.imagem_capa || "");
      setExistingGallery(project.galeria || []);
    }
  }, [project]);

  const applyExtractedBehanceData = (
    extracted: Awaited<ReturnType<typeof fetchBehanceProjectDetails>>
  ) => {
    setForm((prev: typeof form) => ({
      ...prev,
      titulo: extracted.titulo || prev.titulo,
      cliente: extracted.cliente || prev.cliente,
      categoria: extracted.categoria || prev.categoria,
      resumo: extracted.resumo || prev.resumo,
      desafio: extracted.desafio || prev.desafio,
      estrategia: extracted.estrategia || prev.estrategia,
      entregaveis: extracted.entregaveis.join(", "),
      tags: extracted.tags.join(", "),
      link_projeto: extracted.link_projeto || prev.link_projeto,
      destaque: true,
      status: "Concluído",
    }));

    if (extracted.imagem_capa) {
      setCoverFile(null);
      setCoverPreview(extracted.imagem_capa);
    }

    if (extracted.galeria.length > 0) {
      setExistingGallery(extracted.galeria);
    }

    toast.success(
      `Projeto "${extracted.titulo}" carregado com ${extracted.galeria.length} lâmina(s)! Revise os campos antes de salvar.`
    );
  };

  const handleImportByProjectUrl = async () => {
    const trimmed = behanceProjectUrl.trim();
    if (!trimmed) {
      toast.error("Cole o link do projeto do Behance.");
      return;
    }

    // If the user pasted a profile link/username here instead of a single gallery link, switch to profile mode automatically!
    if (!isValidBehanceProjectUrl(trimmed)) {
      const maybeUsername = extractBehanceUsername(trimmed);
      if (maybeUsername) {
        setBehanceTab("profile");
        setBehanceProfileInput(maybeUsername);
        setBehanceProjectUrl("");
        setLoadingProfile(true);
        try {
          const items = await fetchBehanceProfileProjects(maybeUsername);
          setProfileProjects(items);
          toast.success(
            `Detectamos um link de perfil! ${items.length} projeto(s) listados de @${maybeUsername}.`
          );
        } catch (err) {
          toast.error((err as Error).message || "Não foi possível carregar o perfil do Behance.");
        } finally {
          setLoadingProfile(false);
        }
        return;
      }

      toast.error(
        "Informe o link direto de um projeto do Behance (ex: https://www.behance.net/gallery/123456/Nome-do-Projeto)"
      );
      return;
    }

    setImportingUrl(true);
    try {
      const extracted = await fetchBehanceProjectDetails(trimmed);
      applyExtractedBehanceData(extracted);
      setBehanceProjectUrl("");
    } catch (err) {
      toast.error(
        (err as Error).message || "Não foi possível extrair os dados deste link do Behance."
      );
    } finally {
      setImportingUrl(false);
    }
  };

  const handleLoadBehanceProfile = async () => {
    const rawInput = behanceProfileInput.trim();
    if (!rawInput) {
      toast.error("Informe seu usuário ou link de perfil do Behance.");
      return;
    }

    setLoadingProfile(true);
    try {
      const items = await fetchBehanceProfileProjects(rawInput);
      setProfileProjects(items);
      const username = extractBehanceUsername(rawInput);
      if (username) {
        const profileUrl = `https://www.behance.net/${username}`;
        await supabase
          .from("site_settings" as any)
          .upsert({ key: "social_behance", value: profileUrl }, { onConflict: "key" });
        queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      }
      toast.success(`${items.length} projeto(s) encontrados no Behance!`);
    } catch (err) {
      toast.error((err as Error).message || "Erro ao carregar projetos do perfil Behance.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSelectProfileProject = async (item: BehanceProfileProjectItem) => {
    setImportingProfileItemId(item.id);
    try {
      const extracted = await fetchBehanceProjectDetails(item.url, item);
      applyExtractedBehanceData(extracted);
    } catch (err) {
      toast.error((err as Error).message || "Erro ao carregar detalhes do projeto.");
    } finally {
      setImportingProfileItemId(null);
    }
  };

  const moveGallerySlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= existingGallery.length) return;
    setExistingGallery((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("projects").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("projects").getPublicUrl(path);
    return data.publicUrl;
  };

  const addGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setExistingGallery((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const projectId = id || crypto.randomUUID();
      let coverUrl = coverPreview || existingGallery[0] || "";
      if (coverFile) {
        coverUrl = await uploadFile(
          coverFile,
          `${projectId}/cover.${coverFile.name.split(".").pop()}`
        );
      }
      const galleryUrls = [...existingGallery];
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        const url = await uploadFile(
          file,
          `${projectId}/gallery/${Date.now()}-${i}.${file.name.split(".").pop()}`
        );
        galleryUrls.push(url);
      }

      const tags = String(form.tags || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
      const entregaveis = String(form.entregaveis || "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const cleanTitle = (form.titulo || "Novo Projeto").trim();
      const cleanSummary =
        (form.resumo || "").trim() ||
        `Estudo de caso em ${(form.categoria || "Identidade visual").toLowerCase()} desenvolvido para ${
          form.cliente || cleanTitle.split("—")[0].trim()
        }.`;

      const serializedDescription = serializeCaseStudy({
        resumo: cleanSummary,
        cliente: form.cliente || cleanTitle.split("—")[0].trim(),
        metrica: form.metrica || "",
        desafio: form.desafio || "",
        estrategia: form.estrategia || "",
        resultados: form.resultados || "",
        entregaveis: entregaveis.length > 0 ? entregaveis : tags,
      });

      const projectData = {
        titulo: cleanTitle,
        descricao: serializedDescription,
        categoria: form.categoria || "Identidade visual",
        imagem_capa: coverUrl || null,
        galeria: galleryUrls,
        tags,
        link_projeto: form.link_projeto || null,
        destaque: Boolean(form.destaque),
        status: form.status || "Concluído",
      };

      if (isEditing) {
        const { error } = await supabase.from("projects").update(projectData).eq("id", id!);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("projects")
          .insert({ id: projectId, ...projectData, data_publicacao: new Date().toISOString() });
        if (error) throw error;
      }

      // If marked as featured (destaque), place it at position #1 in featured_projects_order and cap total featured at 4
      if (projectData.destaque) {
        const [{ data: orderSetting }, { data: allFeatured }] = await Promise.all([
          supabase
            .from("site_settings" as any)
            .select("value")
            .eq("key", "featured_projects_order")
            .maybeSingle(),
          supabase
            .from("projects")
            .select("id, data_publicacao")
            .eq("destaque", true)
            .order("data_publicacao", { ascending: false }),
        ]);

        let existingOrder: string[] = [];
        if ((orderSetting as any)?.value) {
          try {
            const parsed = JSON.parse((orderSetting as any).value);
            if (Array.isArray(parsed)) existingOrder = parsed;
          } catch {
            // ignore
          }
        }

        const allFeaturedIds = (allFeatured || []).map((p: any) => p.id);
        const mergedOrder = [
          projectId,
          ...existingOrder.filter((itemId) => itemId !== projectId && allFeaturedIds.includes(itemId)),
          ...allFeaturedIds.filter((itemId) => itemId !== projectId && !existingOrder.includes(itemId)),
        ];

        const nextOrder = mergedOrder.slice(0, 4);
        const overflowIds = mergedOrder.slice(4);

        for (const extraId of overflowIds) {
          await supabase.from("projects").update({ destaque: false }).eq("id", extraId);
        }

        await supabase
          .from("site_settings" as any)
          .upsert(
            { key: "featured_projects_order", value: JSON.stringify(nextOrder) },
            { onConflict: "key" }
          );
      }
    },
    onSuccess: () => {
      localStorage.removeItem(DRAFT_KEY);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-nav"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects-home"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(isEditing ? "Case atualizado com sucesso!" : "Novo case publicado no site e na Home!");
      navigate("/admin");
    },
    onError: (err) => toast.error("Erro ao salvar: " + (err as Error).message),
    onSettled: () => setUploading(false),
  });

  if (authLoading || !user) return null;

  const isAlreadyInPortfolio = (item: BehanceProfileProjectItem) => {
    if (!existingPortfolioProjects?.length) return false;
    return existingPortfolioProjects.some(
      (p) =>
        (p.link_projeto && p.link_projeto.toLowerCase() === item.url.toLowerCase()) ||
        p.titulo.toLowerCase().trim() === item.title.toLowerCase().trim()
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial max-w-[960px] pt-[104px] md:pt-[116px] pb-24">
        {/* Editorial Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-border">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Voltar para Cases</span>
            </Link>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(26px, 3.4vw, 40px)", lineHeight: 1.08 }}
            >
              {isEditing ? "Editar estudo de caso." : "Novo estudo de caso."}
            </h1>
            <p className="text-[15px] text-muted-foreground mt-1.5">
              Importe direto do Behance em 1 clique ou preencha a narrativa e galeria abaixo.
            </p>
          </div>

          {isEditing && id && (
            <Link
              to={`/projetos/${id}`}
              target="_blank"
              className="btn-ghost px-4 py-2.5 text-[13px] inline-flex items-center gap-2 shrink-0"
            >
              <Eye size={15} />
              <span>Ver página pública</span>
            </Link>
          )}
        </div>

        {/* Behance Importer Panel (Both by Project URL and Full Profile) */}
        <div className="mb-8 rounded-2xl border border-primary/35 bg-[#141518] p-6 md:p-8 shadow-[0_16px_44px_-24px_rgba(255,64,1,0.28)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-display text-[18px] font-medium text-foreground">
                  Importar direto do Behance
                </h2>
                <p className="text-xs text-muted-foreground">
                  Extrai título, capa, lâminas em alta resolução, tags e descrição para você revisar antes de publicar.
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBehanceTab("url")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                  behanceTab === "url"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 size={13} />
                <span>Por link do projeto</span>
              </button>
              <button
                type="button"
                onClick={() => setBehanceTab("profile")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                  behanceTab === "profile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck size={13} />
                <span>Do meu perfil completo</span>
              </button>
            </div>
          </div>

          {behanceTab === "url" ? (
            <div className="space-y-3">
              <label className="block text-[13px] font-medium text-foreground">
                Cole a URL do projeto no Behance
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={behanceProjectUrl}
                  onChange={(e) => setBehanceProjectUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleImportByProjectUrl();
                    }
                  }}
                  placeholder="https://www.behance.net/gallery/123456789/Nome-do-Projeto"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-[14px] text-foreground font-mono focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleImportByProjectUrl}
                  disabled={importingUrl}
                  className="btn-primary px-6 py-3 text-[14px] shrink-0 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importingUrl ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Extraindo lâminas...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Puxar dados e imagens</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Todas as imagens da apresentação serão adicionadas automaticamente à capa e à galeria abaixo para você revisar.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">
                  Usuário ou URL do seu perfil no Behance
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={behanceProfileInput}
                    onChange={(e) => setBehanceProfileInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLoadBehanceProfile();
                      }
                    }}
                    placeholder="Ex: lucasevangelista ou https://behance.net/seuusuario"
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-[14px] text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleLoadBehanceProfile}
                    disabled={loadingProfile}
                    className="btn-primary px-6 py-3 text-[14px] shrink-0 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingProfile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Buscando perfil...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={15} />
                        <span>Listar projetos do perfil</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {profileProjects.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {profileProjects.length} projetos públicos encontrados — clique em um projeto para preencher o formulário
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
                    {profileProjects.map((item) => {
                      const alreadyImported = isAlreadyInPortfolio(item);
                      const isLoadingThis = importingProfileItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="group rounded-xl border border-border bg-background/80 overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all"
                        >
                          <div>
                            <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
                              {item.coverUrl ? (
                                <img
                                  src={item.coverUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  Sem miniatura
                                </div>
                              )}
                              {alreadyImported && (
                                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-mono">
                                  <CheckCircle2 size={11} />
                                  Já no portfólio
                                </span>
                              )}
                            </div>

                            <div className="p-3.5">
                              <h3 className="font-display text-sm font-medium text-foreground line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          <div className="px-3.5 pb-3.5 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-muted-foreground hover:text-foreground"
                            >
                              Ver no Behance ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => handleSelectProfileProject(item)}
                              disabled={isLoadingThis}
                              className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/35 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {isLoadingThis ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>Puxando...</span>
                                </>
                              ) : (
                                <>
                                  <Download size={12} />
                                  <span>Carregar para revisão</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-8"
        >
          {/* 1. Informações Básicas */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <h2 className="font-display text-[18px] font-medium text-foreground mb-6 pb-4 border-b border-border flex items-center gap-2.5">
              <span className="font-mono text-primary text-[13px] tabular-nums">01.</span>
              <span>Ficha técnica do projeto</span>
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Título do projeto <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Ex: FitPulse — Identidade Visual & App"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Nome do cliente
                  </label>
                  <input
                    type="text"
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Ex: FitPulse Performance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Frente de serviço <span className="text-primary">*</span>
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Indicador de resultado (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.metrica}
                    onChange={(e) => setForm({ ...form, metrica: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Ex: Reposicionamento completo"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Status de publicação
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    {projectStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Frase-resumo (exibida nos cards da Home e em /projetos){" "}
                  <span className="text-primary">*</span>
                </label>
                <textarea
                  value={form.resumo}
                  onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors resize-y"
                  placeholder="Uma frase objetiva descrevendo o projeto e o que foi construído..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Entregáveis do escopo (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={form.entregaveis}
                    onChange={(e) => setForm({ ...form, entregaveis: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Logotipo, Guia da marca, Landing page, Kit social"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Tags complementares (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Identidade visual, UI/UX, Direção de arte"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
                <div>
                  <label className="block text-[14px] font-medium text-foreground mb-2">
                    Link do projeto online / Behance (opcional)
                  </label>
                  <input
                    type="url"
                    value={form.link_projeto}
                    onChange={(e) => setForm({ ...form, link_projeto: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer sm:mt-7 p-3.5 rounded-xl border border-border bg-background/60 hover:border-foreground/25 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.destaque}
                    onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-border bg-secondary accent-primary"
                  />
                  <div>
                    <span className="text-[14px] text-foreground font-medium block">
                      Destacar em "Projetos selecionados" na Home
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      Até 4 projetos marcados aparecem nos cards empilhados da Home.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Narrativa Editorial do Estudo de Caso */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <h2 className="font-display text-[18px] font-medium text-foreground mb-1.5 flex items-center gap-2.5">
              <span className="font-mono text-primary text-[13px] tabular-nums">02.</span>
              <span>Narrativa do estudo de caso</span>
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6 pb-4 border-b border-border">
              Estes textos alimentam a página individual do projeto (O desafio, Minha atuação e Resultados) e as propostas comerciais.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  <span className="font-mono text-xs text-primary mr-2">01.</span>
                  O desafio
                </label>
                <textarea
                  value={form.desafio}
                  onChange={(e) => setForm({ ...form, desafio: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors resize-y"
                  placeholder="Qual era a necessidade de posicionamento, comunicação ou presença digital da marca?"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  <span className="font-mono text-xs text-primary mr-2">02.</span>
                  Minha atuação e solução visual
                </label>
                <textarea
                  value={form.estrategia}
                  onChange={(e) => setForm({ ...form, estrategia: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors resize-y"
                  placeholder="Qual foi a direção visual construída e como o sistema foi organizado?"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  <span className="font-mono text-xs text-primary mr-2">03.</span>
                  Resultados observados{" "}
                  <span className="text-muted-foreground font-normal text-[13px]">
                    (opcional — a seção só é exibida se houver dados reais)
                  </span>
                </label>
                <textarea
                  value={form.resultados}
                  onChange={(e) => setForm({ ...form, resultados: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors resize-y"
                  placeholder="Descreva os resultados alcançados pela marca após a entrega..."
                />
              </div>
            </div>
          </div>

          {/* 3. Imagens & Galeria */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
                <span className="font-mono text-primary text-[13px] tabular-nums">03.</span>
                <span>Capa e galeria visual</span>
              </h2>
              {existingGallery.length > 0 && (
                <span className="font-mono text-xs text-primary tabular-nums">
                  {existingGallery.length} lâmina(s) na galeria
                </span>
              )}
            </div>

            <div className="space-y-7">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2.5">
                  Imagem de capa
                </label>
                {coverPreview && (
                  <div className="relative rounded-xl overflow-hidden mb-4 border border-border max-h-[340px] bg-background">
                    <img src={coverPreview} alt="Capa do projeto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview("");
                      }}
                      className="absolute top-3 right-3 bg-background/90 p-2 rounded-lg border border-border hover:bg-destructive hover:text-white transition-colors"
                      aria-label="Remover capa"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl px-5 py-6 text-[14px] text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload size={16} className="text-primary" />
                    <span>
                      <strong className="text-foreground font-medium">Enviar arquivo</strong> de capa
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverFile(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      placeholder="Ou cole a URL da imagem de capa..."
                      className="flex-1 bg-background border border-border rounded-lg px-3.5 py-3 text-[14px] text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (coverUrlInput.trim()) {
                          setCoverFile(null);
                          setCoverPreview(coverUrlInput.trim());
                          setCoverUrlInput("");
                        }
                      }}
                      className="btn-ghost px-4 py-3 text-[13px] shrink-0"
                    >
                      Definir
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-[14px] font-medium text-foreground">
                    Galeria do estudo de caso
                  </label>
                  {existingGallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExistingGallery([])}
                      className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Limpar todas as lâminas
                    </button>
                  )}
                </div>

                {(existingGallery.length > 0 || galleryFiles.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {existingGallery.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="group relative rounded-lg overflow-hidden aspect-[4/3] bg-secondary border border-border"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/85 border border-border text-[10px] font-mono text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              setCoverFile(null);
                              setCoverPreview(url);
                              toast.success("Lâmina definida como capa do projeto!");
                            }}
                            className="bg-background/90 px-2 py-1 rounded text-[10px] font-mono text-foreground border border-border hover:border-primary transition-colors"
                          >
                            Usar como capa
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveGallerySlide(i, -1)}
                              disabled={i === 0}
                              className="bg-background/90 px-1.5 py-1 rounded text-[10px] font-mono text-foreground border border-border hover:border-primary disabled:opacity-40"
                              title="Mover lâmina para trás"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGallerySlide(i, 1)}
                              disabled={i === existingGallery.length - 1}
                              className="bg-background/90 px-1.5 py-1 rounded text-[10px] font-mono text-foreground border border-border hover:border-primary disabled:opacity-40"
                              title="Mover lâmina para frente"
                            >
                              →
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingGallery((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-2 right-2 bg-background/90 p-1.5 rounded-md border border-border hover:bg-destructive hover:text-white transition-colors"
                          aria-label="Remover imagem"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {galleryFiles.map((file, i) => (
                      <div
                        key={i}
                        className="relative rounded-lg overflow-hidden aspect-[4/3] bg-secondary border border-border"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-2 right-2 bg-background/90 p-1.5 rounded-md border border-border hover:bg-destructive hover:text-white transition-colors"
                          aria-label="Remover imagem"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl px-5 py-6 text-[14px] text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload size={16} className="text-primary" />
                    <span>Adicionar imagens à galeria</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      placeholder="Ou adicione imagem por URL..."
                      className="flex-1 bg-background border border-border rounded-lg px-3.5 py-3 text-[14px] text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addGalleryUrl}
                      className="btn-ghost px-4 py-3 text-[13px] shrink-0 inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-2">
            <Link to="/admin" className="btn-ghost px-6 py-3.5 text-[14px]">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary px-8 py-3.5 text-[15px] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {uploading && <Loader2 size={16} className="animate-spin" />}
              <span>{uploading ? "Salvando..." : isEditing ? "Salvar alterações" : "Publicar case"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminProjectForm;
