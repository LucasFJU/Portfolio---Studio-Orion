import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import { Save, Loader2, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { isValidWhatsappNumber, isValidSocialUrl } from "@/lib/caseStudy";

const AdminSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [contactEmail, setContactEmail] = useState("");
  const [siteName, setSiteName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [statProjects, setStatProjects] = useState("2.500+");
  const [statClients, setStatClients] = useState("500+");
  const [statExperience, setStatExperience] = useState("13+ anos");
  const [socialDribbble, setSocialDribbble] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialBehance, setSocialBehance] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings" as any).select("*");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      const findVal = (key: string) => settings.find((s: any) => s.key === key)?.value || "";
      setContactEmail(findVal("contact_email"));
      setSiteName(findVal("site_name"));
      setWhatsappNumber(findVal("whatsapp_number"));
      setStatProjects(findVal("stat_projects") || "2.500+");
      setStatClients(findVal("stat_clients") || "500+");
      setStatExperience(findVal("stat_experience") || "13+ anos");
      setSocialDribbble(findVal("social_dribbble"));
      setSocialLinkedin(findVal("social_linkedin"));
      setSocialBehance(findVal("social_behance"));
      setSocialInstagram(findVal("social_instagram"));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      const upserts = [
        { key: "contact_email", value: contactEmail.trim() },
        { key: "site_name", value: siteName.trim() },
        { key: "whatsapp_number", value: whatsappNumber.trim() },
        { key: "stat_projects", value: statProjects.trim() || "2.500+" },
        { key: "stat_clients", value: statClients.trim() || "500+" },
        { key: "stat_experience", value: statExperience.trim() || "13+ anos" },
        { key: "social_dribbble", value: socialDribbble.trim() },
        { key: "social_linkedin", value: socialLinkedin.trim() },
        { key: "social_behance", value: socialBehance.trim() },
        { key: "social_instagram", value: socialInstagram.trim() },
      ];
      for (const item of upserts) {
        const { data: existing } = await supabase
          .from("site_settings" as any)
          .select("id")
          .eq("key", item.key)
          .maybeSingle();
        if (existing) {
          await supabase
            .from("site_settings" as any)
            .update({ value: item.value })
            .eq("key", item.key);
        } else {
          await supabase.from("site_settings" as any).insert(item);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-public"] });
      toast.success("Configurações e métricas sincronizadas em todo o site!");
    },
    onError: () => toast.error("Erro ao salvar configurações"),
    onSettled: () => setSaving(false),
  });

  if (authLoading || !user) return null;

  const whatsappActive = isValidWhatsappNumber(whatsappNumber);

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial max-w-[960px] pt-[104px] md:pt-[116px] pb-24">
        <div className="mb-10 pb-8 border-b border-border">
          <div className="section-label mb-3">
            <span className="label-num">04.</span> Preferências globais
          </div>
          <h1
            className="font-display text-foreground font-medium"
            style={{ fontSize: "clamp(26px, 3.6vw, 42px)", lineHeight: 1.08 }}
          >
            Configurações, métricas e canais.
          </h1>
          <p className="text-[15px] text-muted-foreground mt-2 max-w-[58ch]">
            Gerencie e-mail, WhatsApp, indicadores de autoridade e perfis profissionais. Todas as alterações refletem automaticamente na Home, Sobre, Contato e Propostas.
          </p>
        </div>

        <div className="space-y-8">
          {/* Quick link: Visual Hero Editor */}
          <div className="bg-gradient-to-r from-primary/10 via-[#141518] to-[#141518] border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles size={16} />
                <span>Editor Visual da Hero (Estilo Wix)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-[50ch]">
                Personalize fotos, alinhamento de colunas, tipografia de destaque, botões e badges em tempo real com visualização interativa instantânea.
              </p>
            </div>
            <Link
              to="/admin/editor-hero"
              className="bg-primary hover:bg-[#ff551a] text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 transition-all shrink-0"
            >
              <span>Abrir Editor Visual</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 1. Identificação & Contato Direto */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9 space-y-6">
            <h2 className="font-display text-[18px] font-medium text-foreground border-b border-border pb-4 flex items-center gap-2.5">
              <span className="font-mono text-[13px] text-primary tabular-nums">01.</span>
              <span>Identificação e contato direto</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Nome profissional
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="Lucas Evangelista"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  E-mail comercial
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="contato@lucasevangelista.design"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Exibido no rodapé, na página Contato e no painel lateral de orçamento.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-[14px] font-medium text-foreground">
                  Número do WhatsApp
                </label>
                {whatsappActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 size={13} />
                    Ativo no site público e propostas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <AlertCircle size={13} />
                    Oculto (número provisório ou vazio)
                  </span>
                )}
              </div>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground font-mono tabular-nums focus:border-primary focus:outline-none transition-colors"
                placeholder="Ex: 5511987654321"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Informe DDI + DDD + número (apenas dígitos). Sincronizado com o botão flutuante, página Contato e aprovação de Propostas.
              </p>
            </div>
          </div>

          {/* 2. Métricas de Autoridade */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
                <span className="font-mono text-[13px] text-primary tabular-nums">02.</span>
                <span>Métricas de autoridade (Hero, Sobre &amp; Propostas)</span>
              </h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                Estes números aparecem na abertura da Home, na seção Sobre, na página /sobre e no rodapé de autoridade das propostas comerciais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Projetos entregues
                </label>
                <input
                  type="text"
                  value={statProjects}
                  onChange={(e) => setStatProjects(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground font-mono tabular-nums focus:border-primary focus:outline-none transition-colors"
                  placeholder="2.500+"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Clientes / Marcas atendidas
                </label>
                <input
                  type="text"
                  value={statClients}
                  onChange={(e) => setStatClients(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground font-mono tabular-nums focus:border-primary focus:outline-none transition-colors"
                  placeholder="500+"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-2">
                  Tempo de experiência
                </label>
                <input
                  type="text"
                  value={statExperience}
                  onChange={(e) => setStatExperience(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground font-mono tabular-nums focus:border-primary focus:outline-none transition-colors"
                  placeholder="13+ anos"
                />
              </div>
            </div>
          </div>

          {/* 3. Redes Sociais & Portfólios Externos */}
          <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
                <span className="font-mono text-[13px] text-primary tabular-nums">03.</span>
                <span>Perfis e portfólios externos</span>
              </h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                Insira a URL completa do seu perfil (ex: https://instagram.com/seuusuario). Links genéricos sem usuário são ocultados automaticamente no rodapé.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  label: "Instagram",
                  value: socialInstagram,
                  setter: setSocialInstagram,
                  placeholder: "https://instagram.com/seuusuario",
                },
                {
                  label: "Behance",
                  value: socialBehance,
                  setter: setSocialBehance,
                  placeholder: "https://behance.net/seuusuario",
                },
                {
                  label: "LinkedIn",
                  value: socialLinkedin,
                  setter: setSocialLinkedin,
                  placeholder: "https://linkedin.com/in/seuusuario",
                },
                {
                  label: "Dribbble",
                  value: socialDribbble,
                  setter: setSocialDribbble,
                  placeholder: "https://dribbble.com/seuusuario",
                },
              ].map((social) => {
                const valid = isValidSocialUrl(social.value);
                return (
                  <div key={social.label}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="block text-[14px] font-medium text-foreground">
                        {social.label}
                      </label>
                      <span
                        className={`text-[11px] font-medium ${
                          valid ? "text-emerald-400" : "text-muted-foreground"
                        }`}
                      >
                        {valid ? "Visível no site" : "Oculto (sem perfil específico)"}
                      </span>
                    </div>
                    <input
                      type="url"
                      value={social.value}
                      onChange={(e) => social.setter(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground focus:border-primary focus:outline-none transition-colors"
                      placeholder={social.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saving}
              className="btn-primary px-7 py-3.5 text-[15px] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? "Salvando..." : "Salvar configurações"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
