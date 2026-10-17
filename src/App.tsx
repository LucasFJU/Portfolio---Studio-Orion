import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjectForm = lazy(() => import("./pages/AdminProjectForm"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminAbout = lazy(() => import("./pages/AdminAbout"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminProposals = lazy(() => import("./pages/AdminProposals"));
const AdminProposalForm = lazy(() => import("./pages/AdminProposalForm"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminHeroEditor = lazy(() => import("./pages/AdminHeroEditor"));
const ProposalView = lazy(() => import("./pages/ProposalView"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const StoreSyncListener = () => {
  useEffect(() => {
    const syncCaches = () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects-home"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-public"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    };

    window.addEventListener("storage", syncCaches);
    window.addEventListener("portfolio-store-updated", syncCaches);
    return () => {
      window.removeEventListener("storage", syncCaches);
      window.removeEventListener("portfolio-store-updated", syncCaches);
    };
  }, []);
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <StoreSyncListener />
          <Layout>
            <Suspense fallback={<main className="container-editorial min-h-screen pt-32" aria-busy="true" aria-label="Carregando página"><span className="sr-only" role="status">Carregando página…</span><div aria-hidden="true" className="h-12 w-2/3 rounded-xl bg-card" /></main>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projetos" element={<Projects />} />
              <Route path="/projetos/:id" element={<ProjectDetail />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/proposta/:slug" element={<ProposalView />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orcamentos" element={<AdminLeads />} />
              <Route path="/admin/depoimentos" element={<AdminTestimonials />} />
              <Route path="/admin/projetos/novo" element={<AdminProjectForm />} />
              <Route path="/admin/projetos/:id/editar" element={<AdminProjectForm />} />
              <Route path="/admin/propostas" element={<AdminProposals />} />
              <Route path="/admin/propostas/novo" element={<AdminProposalForm />} />
              <Route path="/admin/propostas/:id/editar" element={<AdminProposalForm />} />
              <Route path="/admin/editor-hero" element={<AdminHeroEditor />} />
              <Route path="/admin/configuracoes" element={<AdminSettings />} />
              <Route path="/admin/sobre" element={<AdminAbout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
