import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import { Save, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

const settingsKeys = [
  {
    key: "about_title",
    label: "Título de apresentação (/sobre)",
    placeholder: "Design com direção clara, critério visual e foco no que a marca precisa comunicar.",
  },
  {
    key: "about_description",
    label: "Narrativa principal (1ª pessoa)",
    placeholder:
      "Sou designer focado em identidade visual, conteúdo para redes sociais e interfaces digitais. Ao longo de mais de 6 anos de prática...",
    multiline: true,
  },
  {
    key: "about_mission",
    label: "Foco de atuação",
    placeholder: "Ajudar empresas a se apresentarem com clareza, consistência e presença profissional...",
    multiline: true,
  },
  {
    key: "about_vision",
    label: "Visão de design",
    placeholder: "Construir sistemas visuais duráveis que funcionem no dia a dia real da marca...",
    multiline: true,
  },
  {
    key: "about_values",
    label: "Princípios de trabalho",
    placeholder: "Clareza antes de ornamento · Consistência em cada ponto de contato · Contato direto",
    multiline: true,
  },
];

const AdminAbout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Record<string, string>>({});
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
      const map: Record<string, string> = {};
      settings.forEach((s: any) => {
        map[s.key] = s.value || "";
      });
      setForm(map);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      for (const { key } of settingsKeys) {
        const value = form[key] || "";
        const { data: existing } = await supabase
          .from("site_settings" as any)
          .select("id")
          .eq("key", key)
          .maybeSingle();
        if (existing) {
          await supabase.from("site_settings" as any).update({ value }).eq("key", key);
        } else {
          await supabase.from("site_settings" as any).insert({ key, value });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-public"] });
      toast.success("Página Sobre atualizada!");
    },
    onError: () => toast.error("Erro ao salvar"),
    onSettled: () => setSaving(false),
  });

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial max-w-[960px] pt-[104px] md:pt-[116px] pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-border">
          <div>
            <div className="section-label mb-3">
              <span className="label-num">03.</span> Conteúdo institucional
            </div>
            <h1
              className="font-display text-foreground font-medium"
              style={{ fontSize: "clamp(26px, 3.6vw, 42px)", lineHeight: 1.08 }}
            >
              Editar página Sobre.
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-[54ch]">
              Personalize os textos exibidos em /sobre mantendo a voz em primeira pessoa. Deixe em branco para usar o texto editorial padrão.
            </p>
          </div>

          <Link
            to="/sobre"
            target="_blank"
            className="btn-ghost px-4 py-2.5 text-[13px] inline-flex items-center gap-2 shrink-0"
          >
            <Eye size={15} />
            <span>Ver página Sobre</span>
          </Link>
        </div>

        <div className="bg-[#141518] border border-border rounded-2xl p-7 md:p-9 space-y-6">
          {settingsKeys.map(({ key, label, placeholder, multiline }) => (
            <div key={key}>
              <label className="block text-[14px] font-medium text-foreground mb-2">
                {label}
              </label>
              {multiline ? (
                <textarea
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors resize-y"
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saving}
              className="btn-primary px-7 py-3.5 text-[15px] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? "Salvando..." : "Salvar alterações"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAbout;
