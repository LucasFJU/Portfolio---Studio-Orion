import SectionGlow from "@/components/SectionGlow";
import Navbar from "@/components/Navbar";
import ProcessSection from "@/components/ProcessSection";
import UnifiedAtmosphereSection from "@/components/UnifiedAtmosphereSection";
import PageMeta from "@/components/PageMeta";
import ServicesSection from "@/components/ServicesSection";
import SectionTransition from "@/components/SectionTransition";

const Services = () => {

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Serviços — Lucas Evangelista"
        description="Serviços de identidade visual, design para redes sociais e criação de sites e interfaces digitais."
      />
      <Navbar />

      <main className="pt-[108px] md:pt-[124px]">
        {/* Header */}
        <section data-orion-reveal className="container-editorial pb-14 md:pb-20 border-b border-border">
          <div className="section-label mb-3">
            <span className="label-num">01.</span> Especialidades e entregáveis
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h1
              className="font-display text-foreground font-medium max-w-2xl"
              style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.05 }}
            >
              Três frentes para posicionar e expandir sua marca.
            </h1>

            <p className="text-muted-foreground text-[16px] md:text-[17px] leading-[1.6] max-w-[44ch]">
              Cada projeto é desenhado sob medida para o momento da sua empresa — da criação da
              identidade ao desdobramento digital.
            </p>
          </div>
        </section>

        <SectionTransition sourceColor="#090A0C" destinationColor="#FFFAFA" />
        <ServicesSection theme="light" detailed sectionNumber="01." />
        <SectionTransition sourceColor="#090A0C" destinationColor="#141518" />
        <SectionGlow />
        <ProcessSection detailed sectionNumber="02." />
        {/* Unified Continuous Atmospheric Stage: FAQ -> CTA -> Footer */}
        <SectionTransition sourceColor="#141518" destinationColor="#090A0C" />
        <UnifiedAtmosphereSection sectionNumber="03." />
      </main>
    </div>
  );
};

export default Services;
