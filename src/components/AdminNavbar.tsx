import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AdminNavbarProps = {
  primaryAction?: { label: string; to: string };
};

const AdminNavbar = ({ primaryAction }: AdminNavbarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: leadsCount } = useQuery({
    queryKey: ["admin-leads-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const links = [
    {
      label: "Projetos",
      to: "/admin",
      match: (p: string) => p === "/admin" || p.startsWith("/admin/projetos"),
    },
    {
      label: "Orçamentos",
      to: "/admin/orcamentos",
      match: (p: string) => p.startsWith("/admin/orcamentos"),
      badge: leadsCount,
    },
    {
      label: "Propostas",
      to: "/admin/propostas",
      match: (p: string) => p.startsWith("/admin/propostas"),
    },
    {
      label: "Depoimentos",
      to: "/admin/depoimentos",
      match: (p: string) => p.startsWith("/admin/depoimentos"),
    },
    {
      label: "Sobre",
      to: "/admin/sobre",
      match: (p: string) => p.startsWith("/admin/sobre"),
    },
    {
      label: "Editor Hero",
      to: "/admin/editor-hero",
      match: (p: string) => p === "/admin/editor-hero",
    },
    {
      label: "Configurações",
      to: "/admin/configuracoes",
      match: (p: string) => p.startsWith("/admin/configuracoes"),
    },
  ];

  const activeLink = links.find((item) => item.match(pathname)) || links[0];

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 md:px-6">
      <nav
        aria-label="Navegação administrativa"
        className="max-w-[1200px] mx-auto flex items-center justify-between rounded-full border border-foreground/[0.08] bg-[#090A0C]/90 backdrop-blur-xl px-5 md:px-6 h-[54px] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      >
        {/* Zone 1: Brand identity */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            className="font-display text-[16px] font-semibold tracking-tight text-foreground whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span>Admin</span>
          </Link>
          <span className="md:hidden text-xs font-mono text-muted-foreground">
            · {activeLink.label}
          </span>
        </div>

        {/* Zone 2: Primary Admin Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span
                    className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded-full ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/10 text-foreground/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Zone 3: Actions + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3">
          {primaryAction && (
            <Link
              to={primaryAction.to}
              className="hidden sm:inline-flex btn-primary !min-h-9 !px-3.5 !py-2 !text-xs"
            >
              {primaryAction.label}
            </Link>
          )}
          <Link
            to="/"
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <span className="hidden sm:inline">Ver site</span>
            <ArrowUpRight size={14} />
          </Link>
          <button
            onClick={handleSignOut}
            className="hidden sm:inline-flex text-[13px] font-medium text-muted-foreground hover:text-destructive transition-colors items-center gap-1.5"
            title="Sair do painel"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-1.5 rounded-full text-foreground hover:bg-white/5"
            aria-label="Abrir menu administrativo"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {/* Clean Single Dropdown on Mobile (only when opened) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-[1200px] mx-auto rounded-2xl border border-foreground/[0.1] bg-[#0E1014]/95 backdrop-blur-xl p-4 shadow-2xl space-y-1">
          {links.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/85 hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-border flex items-center justify-between px-3 py-1">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span>Abrir site público</span>
              <ArrowUpRight size={13} />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-destructive inline-flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
