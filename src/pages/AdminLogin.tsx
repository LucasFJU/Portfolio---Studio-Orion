import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("admin@lucasevangelista.design");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const backendUnavailable = import.meta.env.PROD && !isSupabaseConfigured;
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (role) {
          navigate("/admin");
        } else {
          toast.error("Acesso não autorizado. Apenas administradores podem acessar.");
          await supabase.auth.signOut();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backendUnavailable) {
      setError(true);
      toast.error("O painel ainda não está conectado ao Supabase.");
      return;
    }
    setLoading(true);
    setError(false);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(true);
      toast.error("Credenciais inválidas");
    } else {
      toast.success("Bem-vindo ao painel!");
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-10">
      <div className="container-editorial w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Voltar ao site</span>
        </Link>
      </div>

      <div className="w-full max-w-[488px] px-6 mx-auto my-auto py-10">
        <div className="rounded-2xl border border-border bg-[#141518] p-8 sm:p-10">
          <div className="section-label mb-3">
            <span className="label-num">01.</span> Área restrita
          </div>

          <h1 className="font-display text-[28px] font-medium text-foreground leading-tight mb-2">
            Lucas Evangelista
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
            Gestão de projetos selecionados, estudos de caso, configurações e propostas comerciais.
          </p>

          {backendUnavailable && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-[13px] text-amber-200 mb-5">
              O painel administrativo está indisponível até que o projeto Supabase seja conectado.
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-[13px] text-destructive mb-5">
              E-mail ou senha incorretos. Verifique suas credenciais.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[14px] font-medium text-foreground mb-2"
              >
                E-mail
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lucasevangelista.design"
                className="w-full bg-background border border-border rounded-lg px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[14px] font-medium text-foreground mb-2"
              >
                Senha
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3.5 text-[15px] mt-2 inline-flex disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Acessar painel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="container-editorial w-full text-center sm:text-left text-[12px] text-muted-foreground">
        © {new Date().getFullYear()} Lucas Evangelista · Painel administrativo
      </div>
    </div>
  );
};

export default AdminLogin;
