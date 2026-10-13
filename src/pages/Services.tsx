import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProcessSection from "@/components/ProcessSection";
import UnifiedAtmosphereSection from "@/components/UnifiedAtmosphereSection";
import PageMeta from "@/components/PageMeta";
import { HOME_SERVICES } from "@/components/ServicesSection";
import { useContactDrawer } from "@/components/ContactDrawer";

const Services = () => {
  const { openContactDrawer } = useContactDrawer();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Serviços — Lucas Evangelista"
        description="Serviços de identidade visual, design para redes sociais e criação de sites e interfaces digitais."
      />
      <Navbar />

      <main className="pt-[108px] md:pt-[124px]">
        {/* Header */}
        <section className="container-editorial pb-14 md:pb-20 border-b border-border">
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

        {/* Detailed Service Blocks */}
        <section className="container-editorial divide-y divide-border">
          {HOME_SERVICES.map((srv) => (
            <div
              key={srv.num}
              className="py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
            >
              <div className="lg:col-span-6">
                <div className="font-mono text-sm text-primary font-medium mb-3">
                  FRENTE {srv.num}
                </div>

                <h2
                  className="font-display text-foreground font-medium mb-4"
                  style={{ fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.1 }}
                >
                  {srv.label}
                </h2>

                <p className="text-muted-foreground text-[16px] md:text-[17px] leading-[1.68] mb-8">
                  {srv.description}
                </p>

                <div className="mb-8">
                  <h3 className="text-[13px] font-mono text-muted-foreground mb-4">
                    O QUE ESTÁ INCLUÍDO
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {srv.subservices.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-[15px] text-foreground"
                      >
                        <Check size={16} className="text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openContactDrawer(srv.label)}
                    className="btn-primary group"
                  >
                    <span>Solicitar orçamento</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>

                  <Link
                    to={`/projetos?categoria=${encodeURIComponent(srv.label)}`}
                    className="btn-ghost"
                  >
                    Ver exemplos desta frente
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-xl overflow-hidden border border-border bg-card aspect-[16/10]">
                  <img
                    src={srv.previewImage}
                    alt={srv.label}
                    width={720}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <ProcessSection detailed sectionNumber="02." />
        {/* Unified Continuous Atmospheric Stage: FAQ -> CTA -> Footer */}
        <UnifiedAtmosphereSection sectionNumber="03." />
      </main>
    </div>
  );
};

export default Services;
