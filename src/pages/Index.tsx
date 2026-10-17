import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogosSection from "@/components/LogosSection";
import StackedProjects from "@/components/StackedProjects";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ProjectShowcaseScroll from "@/components/ProjectShowcaseScroll";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UnifiedAtmosphereSection from "@/components/UnifiedAtmosphereSection";
import PageMeta from "@/components/PageMeta";
import SectionGlow from "@/components/SectionGlow";
import SectionTransition from "@/components/SectionTransition";

// Brand identity mesh gradient color palette
const HERO_BRAND_COLORS = ["#FF4001", "#000000", "#141518", "#090A0C"];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Studio Orion — Identidade Visual, Redes Sociais & Sites"
        description="Studio Orion, estúdio de design dirigido por Lucas Evangelista. Identidade visual, design para redes sociais e sites para marcas que querem se destacar."
      />
      <Navbar />
      <main>
        {/* Hero Section with animated WebGL Velaris mesh gradient */}
        <Hero colors={HERO_BRAND_COLORS} bg="#000000" />
        {/* Marcas & Empresas que Confiam no Meu Trabalho */}
        <LogosSection />
        <StackedProjects />
        <SectionTransition sourceColor="#090A0C" destinationColor="#FFFAFA" />
        <ServicesSection theme="light" sectionNumber="02." />
        <AboutSection sectionNumber="03." />
        <SectionGlow />
        <ProjectShowcaseScroll sectionNumber="04." />
        <SectionTransition sourceColor="#090A0C" destinationColor="#141518" />
        <ProcessSection sectionNumber="05." />
        <SectionTransition sourceColor="#141518" destinationColor="#090A0C" />
        <TestimonialsSection sectionNumber="06." />
        {/* Unified Continuous Atmospheric Stage: FAQ -> CTA -> Footer */}
        <UnifiedAtmosphereSection sectionNumber="07." />
      </main>
    </div>
  );
};

export default Index;
