import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogosSection from "@/components/LogosSection";
import Velaris from "@/components/ui/velaris";
import StackedProjects from "@/components/StackedProjects";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ProjectShowcaseScroll from "@/components/ProjectShowcaseScroll";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UnifiedAtmosphereSection from "@/components/UnifiedAtmosphereSection";
import PageMeta from "@/components/PageMeta";

// Brand identity mesh gradient color palette
const HERO_BRAND_COLORS = ["#FF4001", "#000000", "#141518", "#090A0C"];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Lucas Evangelista — Identidade Visual, Redes Sociais & Sites"
        description="Portfólio de Lucas Evangelista. Projetos de identidade visual, design para redes sociais e criação de sites e interfaces digitais."
      />
      <Navbar />
      <main>
        {/* Hero Section with animated WebGL Velaris mesh gradient */}
        <Hero colors={HERO_BRAND_COLORS} bg="#000000" />
        {/* Marcas & Empresas que Confiam no Meu Trabalho */}
        <LogosSection />
        <StackedProjects />
        <ServicesSection />
        <AboutSection />
        <ProjectShowcaseScroll sectionNumber="04." />
        <ProcessSection sectionNumber="05." />
        <TestimonialsSection sectionNumber="06." />
        {/* Unified Continuous Atmospheric Stage: FAQ -> CTA -> Footer */}
        <UnifiedAtmosphereSection sectionNumber="07." />
      </main>
    </div>
  );
};

export default Index;
