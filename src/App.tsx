import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjectForm from "./pages/AdminProjectForm";
import AdminSettings from "./pages/AdminSettings";
import AdminAbout from "./pages/AdminAbout";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminProposals from "./pages/AdminProposals";
import AdminProposalForm from "./pages/AdminProposalForm";
import AdminLeads from "./pages/AdminLeads";
import AdminHeroEditor from "./pages/AdminHeroEditor";
import ProposalView from "./pages/ProposalView";
import NotFound from "./pages/NotFound";

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
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
