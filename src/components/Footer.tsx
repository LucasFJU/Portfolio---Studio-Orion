import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isValidSocialUrl } from "@/lib/caseStudy";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Sobre", path: "/sobre" },
  { label: "Projetos", path: "/projetos" },
  { label: "Serviços", path: "/servicos" },
  { label: "Contato", path: "/contato" },
];

interface FooterProps {
  embedded?: boolean;
}

const Footer = ({ embedded = false }: FooterProps) => {
  const { user } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback = "") =>
    settings?.find((s: any) => s.key === key)?.value || fallback;

  const contactEmail = getSetting("contact_email", "contato@lucasevangelista.design");

  const socialLinks = [
    { label: "Instagram", url: getSetting("social_instagram") },
    { label: "Behance", url: getSetting("social_behance") },
    { label: "LinkedIn", url: getSetting("social_linkedin") },
    { label: "Dribbble", url: getSetting("social_dribbble") },
  ].filter((item) => isValidSocialUrl(item.url));

  const footerInner = (
    <div className="container-editorial relative z-10">
      <div className={embedded ? "border-t border-white/[0.08] pt-10 md:pt-12" : "py-12 md:py-16"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-border">
          <div>
            <Link
              to="/"
              className="font-display text-[20px] font-semibold text-foreground tracking-tight"
            >
              Studio Orion
            </Link>
            <p className="text-[14px] text-muted-foreground mt-1.5 max-w-[42ch]">
              Identidade visual, design para redes sociais e sites.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`mailto:${contactEmail}`}
              className="text-foreground hover:text-primary transition-colors"
            >
              {contactEmail}
            </a>

            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {social.label} ↗
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Studio Orion.</span>
            {user && (
              <Link to="/admin" className="text-primary hover:underline">
                Painel Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <footer className="relative z-10 pb-12 md:pb-16 pt-2">
        {footerInner}
      </footer>
    );
  }

  return (
    <footer className="relative bg-[#07080A] border-t border-white/[0.08] overflow-hidden">
      {/* Top subtle orange/crimson hairline reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(255, 64, 1, 0.35) 50%, transparent 90%)",
        }}
      />
      {footerInner}
    </footer>
  );
};

export default Footer;
