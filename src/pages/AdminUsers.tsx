import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import { Search, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
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

type Admin = { id: string; email: string; created_at: string };
type SearchResult = { id: string; email: string; is_admin: boolean };

const callEdge = async (action: string, params?: Record<string, string>) => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    if (action === "list") {
      return {
        admins: [
          {
            id: "mock-admin-id",
            email: "admin@lucasevangelista.design",
            created_at: new Date().toISOString(),
          },
        ],
      };
    }
    return { users: [] };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`;
  const url = new URL(base);
  url.searchParams.set("action", action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

const postEdge = async (body: Record<string, string>) => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    return { success: true };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`;
  const res = await fetch(base, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    user_id: string;
    email: string;
    action: "promote" | "demote";
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await callEdge("list");
      return res.admins as Admin[];
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async ({ user_id, action }: { user_id: string; action: string }) => {
      return postEdge({ user_id, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSearchResults(null);
      setSearchEmail("");
      toast.success(
        confirmAction?.action === "promote" ? "Usuário promovido a admin" : "Admin removido"
      );
      setConfirmAction(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setConfirmAction(null);
    },
  });

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const res = await callEdge("search", { email: searchEmail.trim() });
      setSearchResults(res.users as SearchResult[]);
    } catch {
      toast.error("Erro ao buscar usuários");
    } finally {
      setSearching(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container-editorial pt-[104px] md:pt-[116px] pb-24">
        <div className="mb-10 pb-8 border-b border-border">
          <div className="section-label mb-3">
            <span className="label-num">05.</span> Controle de acesso
          </div>
          <h1
            className="font-display text-foreground font-medium"
            style={{ fontSize: "clamp(26px, 3.6vw, 42px)", lineHeight: 1.08 }}
          >
            Gerenciar administradores.
          </h1>
          <p className="text-[15px] text-muted-foreground mt-2 max-w-[54ch]">
            Visualize e gerencie as contas com permissão administrativa no painel.
          </p>
        </div>

        {/* Current admins */}
        <div className="bg-[#141518] border border-border rounded-2xl overflow-hidden mb-8">
          <div className="px-7 py-5 border-b border-border">
            <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
              <span className="font-mono text-[13px] text-primary tabular-nums">01.</span>
              <span>Administradores atuais</span>
            </h2>
          </div>
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {admins?.map((a) => (
                <div key={a.id} className="px-7 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{a.email}</div>
                    <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      Desde {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  {a.id !== user.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ user_id: a.id, email: a.email!, action: "demote" })
                      }
                      className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/5 transition-colors"
                    >
                      <ShieldOff size={14} />
                      <span>Remover</span>
                    </button>
                  )}
                  {a.id === user.id && (
                    <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1">
                      Conta atual
                    </span>
                  )}
                </div>
              ))}
              {admins?.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nenhum administrador encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search & promote */}
        <div className="bg-[#141518] border border-border rounded-2xl overflow-hidden">
          <div className="px-7 py-5 border-b border-border">
            <h2 className="font-display text-[18px] font-medium text-foreground flex items-center gap-2.5">
              <span className="font-mono text-[13px] text-primary tabular-nums">02.</span>
              <span>Adicionar administrador</span>
            </h2>
          </div>
          <div className="p-7">
            <p className="text-[14px] text-muted-foreground mb-4">
              Busque pelo e-mail de um usuário cadastrado para conceder acesso ao painel administrativo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching || !searchEmail.trim()}
                className="btn-primary px-6 py-3 text-[14px] inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span>Buscar</span>
              </button>
            </div>

            {searchResults && (
              <div className="mt-5 border border-border rounded-xl divide-y divide-border bg-background/50">
                {searchResults.length === 0 && (
                  <div className="p-5 text-center text-sm text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
                {searchResults.map((u) => (
                  <div key={u.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="text-sm text-foreground">{u.email}</div>
                    {u.is_admin ? (
                      <span className="text-xs text-primary font-medium">Já é admin</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({ user_id: u.id, email: u.email, action: "promote" })
                        }
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 transition-colors"
                      >
                        <ShieldCheck size={14} />
                        <span>Promover</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "promote"
                ? "Promover a administrador?"
                : "Remover administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "promote"
                ? `${confirmAction.email} terá acesso total ao painel administrativo.`
                : `${confirmAction?.email} perderá acesso ao painel administrativo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmAction &&
                mutation.mutate({ user_id: confirmAction.user_id, action: confirmAction.action })
              }
              className={
                confirmAction?.action === "demote"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              {confirmAction?.action === "promote" ? "Promover" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;