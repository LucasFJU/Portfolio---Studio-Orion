import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useContactDrawer } from "./ContactDrawer";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Sobre", path: "/sobre" },
  { label: "Projetos", path: "/projetos" },
  { label: "Serviços", path: "/servicos" },
  { label: "Contato", path: "/contato" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hiddenOnScrollDown, setHiddenOnScrollDown] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { openContactDrawer } = useContactDrawer();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 36);

      if (currentY <= 90) {
        setHiddenOnScrollDown(false);
      } else if (delta > 8 && !mobileOpen) {
        // Scrolling down: retract header so sticky sections and mobile screens breathe
        setHiddenOnScrollDown(true);
      } else if (delta < -5) {
        // Scrolling up: reveal compact capsule header immediately
        setHiddenOnScrollDown(false);
      }

      lastScrollY.current = currentY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setHiddenOnScrollDown(false);
  }, [location.pathname]);

  const isLinkActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      onFocusCapture={() => setHiddenOnScrollDown(false)}
      className={`fixed top-3 md:top-4 left-0 right-0 z-50 px-4 sm:px-6 transition-all duration-300 ease-out ${
        hiddenOnScrollDown && !mobileOpen
          ? "-translate-y-[130%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div
        className={`mx-auto rounded-full border transition-all duration-300 flex items-center justify-between ${
          scrolled
            ? "max-w-[780px] h-[52px] md:h-[54px] px-4 md:px-6 bg-[#090A0C]/92 backdrop-blur-xl border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
            : "max-w-[1280px] h-[58px] md:h-[72px] px-5 md:px-7 bg-[#0B0C0E]/90 backdrop-blur-md border-white/[0.08]"
        }`}
      >
        {/* Brand Wordmark — Condenses subtly when scrolled */}
        <Link
          to="/"
          className="font-display text-[16px] md:text-[17px] font-bold tracking-tight text-foreground whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span className={scrolled ? "hidden sm:inline" : "inline"}>
            Studio <span className="text-primary">Orion</span>
          </span>
          <span className={scrolled ? "inline sm:hidden font-mono text-sm" : "hidden"}>
            Orion
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav
          aria-label="Navegação principal"
          className={`hidden lg:flex items-center transition-all duration-300 ${
            scrolled ? "gap-5" : "gap-7"
          }`}
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? "page" : undefined}
                className={`relative text-[13px] md:text-[14px] font-medium transition-colors duration-200 py-1 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Primary Action */}
        <div className="hidden lg:flex items-center shrink-0">
          <button
            type="button"
            onClick={() => openContactDrawer()}
            className={`rounded-full bg-[#c93c0d] text-white font-semibold transition-all duration-200 hover:bg-[#b83408] hover:shadow-[0_0_24px_rgba(255,64,1,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-1.5 ${
              scrolled ? "px-4 py-1.5 text-[13px]" : "px-5 py-2 text-[13px]"
            }`}
          >
            <span>{scrolled ? "Orçamento" : "Solicitar Orçamento"}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Mobile Right Controls: Compact CTA + Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => openContactDrawer()}
            className="rounded-full bg-primary/15 border border-primary/35 text-primary px-3 py-1 text-[12px] font-medium"
          >
            Orçamento
          </button>
          <button
            type="button"
            className="text-foreground p-2 -mr-1 rounded-full hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav-menu"
            aria-label="Menu principal móvel"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden max-w-[1280px] mx-auto mt-2 rounded-3xl bg-[#0E1014]/95 backdrop-blur-xl border border-white/[0.1] overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-2.5 text-[16px] font-display font-medium border-b border-white/[0.06] transition-colors ${
                      active ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openContactDrawer();
                  }}
                  className="w-full rounded-full bg-primary text-white py-3 text-[14px] font-semibold flex items-center justify-center shadow-[0_0_24px_rgba(255,64,1,0.35)]"
                >
                  Solicitar Orçamento
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
