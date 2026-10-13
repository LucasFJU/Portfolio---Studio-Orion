import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollRevealTitle } from "./ScrollRevealTitle";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useScrollParallax } from "@/hooks/useScrollParallax";

// Project Assets
import projectFitpulse from "@/assets/project-fitpulse.jpg";
import projectAtelierNoir from "@/assets/project-atelier-noir.jpg";
import projectNextech from "@/assets/project-nextech.jpg";
import projectCafeOrigina from "@/assets/project-cafe-origina.jpg";
import demoBrandIdentity from "@/assets/demo-brand-identity.jpg";
import demoSocialMedia from "@/assets/demo-social-media.jpg";
import demoPackaging from "@/assets/demo-packaging.jpg";
import demoRestaurantBrand from "@/assets/demo-restaurant-brand.jpg";
import demoWebDesign from "@/assets/demo-web-design.jpg";
import demoAppDesign from "@/assets/demo-app-design.jpg";
import fit1 from "@/assets/gallery/fit-1.jpg";
import fit4 from "@/assets/gallery/fit-4.jpg";
import fit6 from "@/assets/gallery/fit-6.jpg";
import fit7 from "@/assets/gallery/fit-7.jpg";
import nexCover from "@/assets/gallery/nex-cover.jpg";
import noirCover from "@/assets/gallery/noir-cover.jpg";

interface ShowcaseCardItem {
  id: string;
  image: string;
  link?: string;
  alt: string;
}

const DEFAULT_ROW_1: ShowcaseCardItem[] = [
  {
    id: "r1-1",
    image: projectFitpulse,
    link: "/projetos/fitpulse-brand-identity",
    alt: "FitPulse — Identidade Visual",
  },
  {
    id: "r1-2",
    image: demoPackaging,
    link: "/projetos/cafe-origina",
    alt: "Café Origina — Embalagens Especiais",
  },
  {
    id: "r1-3",
    image: projectNextech,
    link: "/projetos/nextech-platform",
    alt: "NexTech — Plataforma Digital",
  },
  {
    id: "r1-4",
    image: demoSocialMedia,
    link: "/projetos",
    alt: "Campanhas Digitais & Redes Sociais",
  },
  {
    id: "r1-5",
    image: projectAtelierNoir,
    link: "/projetos/atelier-noir",
    alt: "Atelier Noir — Marca de Alta Costura",
  },
  {
    id: "r1-6",
    image: fit4,
    link: "/projetos/fitpulse-brand-identity",
    alt: "Key Visuals & Sistema Gráfico",
  },
  {
    id: "r1-7",
    image: noirCover,
    link: "/projetos/atelier-noir",
    alt: "Noir Luxury — Lookbook Editorial",
  },
  {
    id: "r1-8",
    image: demoRestaurantBrand,
    link: "/projetos",
    alt: "Gastro Art — Identidade e Embalagens",
  },
];

const DEFAULT_ROW_2: ShowcaseCardItem[] = [
  {
    id: "r2-1",
    image: demoAppDesign,
    link: "/projetos",
    alt: "Aplicativo Mobile e Interface",
  },
  {
    id: "r2-2",
    image: projectCafeOrigina,
    link: "/projetos/cafe-origina",
    alt: "Café Origina — Direção Visual",
  },
  {
    id: "r2-3",
    image: fit6,
    link: "/projetos/fitpulse-brand-identity",
    alt: "FitPulse — Linha de Produtos 3D",
  },
  {
    id: "r2-4",
    image: demoWebDesign,
    link: "/projetos",
    alt: "Website Institucional e Design",
  },
  {
    id: "r2-5",
    image: fit1,
    link: "/projetos/fitpulse-brand-identity",
    alt: "Comunicação Visual e Pôsteres",
  },
  {
    id: "r2-6",
    image: nexCover,
    link: "/projetos/nextech-platform",
    alt: "NexTech — Design System",
  },
  {
    id: "r2-7",
    image: fit7,
    link: "/projetos/fitpulse-brand-identity",
    alt: "Merchandising e Linha de Produtos",
  },
  {
    id: "r2-8",
    image: demoBrandIdentity,
    link: "/projetos",
    alt: "Manual de Marca e Diretrizes",
  },
];

const ProjectImageCard = ({ item }: { item: ShowcaseCardItem }) => {
  const content = (
    <div className="group relative w-[320px] sm:w-[440px] md:w-[500px] lg:w-[560px] aspect-[16/10] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/30 bg-[#0E1013] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-pointer">
      <img
        src={item.image}
        alt={item.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-110 group-hover:contrast-[1.02]"
      />
    </div>
  );

  if (item.link) {
    return (
      <Link
        to={item.link}
        aria-label={item.alt}
        className="shrink-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        {content}
      </Link>
    );
  }

  return <div className="shrink-0">{content}</div>;
};

interface ProjectShowcaseScrollProps {
  sectionNumber?: string;
}

export const ProjectShowcaseScroll = ({
  sectionNumber = "04.",
}: ProjectShowcaseScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom Framer Motion Hook for Row 1 (drifts left on scroll down, inverts on scroll up)
  const { style: styleRow1 } = useScrollParallax(containerRef, {
    direction: "horizontal",
    range: ["4%", "-32%"],
    spring: {
      damping: 24,
      stiffness: 80,
      mass: 0.2,
    },
  });

  // Custom Framer Motion Hook for Row 2 (drifts right on scroll down, inverts on scroll up)
  const { style: styleRow2 } = useScrollParallax(containerRef, {
    direction: "horizontal",
    range: ["-32%", "4%"],
    spring: {
      damping: 24,
      stiffness: 80,
      mass: 0.2,
    },
  });

  // Query database projects to dynamically enrich cards if user added new ones
  const { data: dbProjects } = useQuery({
    queryKey: ["projects"],
    staleTime: 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, titulo, imagem_capa, status")
        .neq("status", "Rascunho")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Blend any custom DB projects into row items
  const { row1, row2 } = useMemo(() => {
    let r1 = [...DEFAULT_ROW_1];
    let r2 = [...DEFAULT_ROW_2];

    if (dbProjects && dbProjects.length > 0) {
      const customItems: ShowcaseCardItem[] = dbProjects
        .filter((p) => p.imagem_capa)
        .slice(0, 6)
        .map((p) => ({
          id: `db-${p.id}`,
          image: p.imagem_capa!,
          link: `/projetos/${p.id}`,
          alt: p.titulo,
        }));

      if (customItems.length > 0) {
        const half = Math.ceil(customItems.length / 2);
        r1 = [...customItems.slice(0, half), ...r1];
        r2 = [...customItems.slice(half), ...r2];
      }
    }

    return { row1: r1, row2: r2 };
  }, [dbProjects]);

  return (
    <section
      ref={containerRef}
      className="bg-[#090A0C] sec-pad border-b border-border overflow-hidden relative"
      aria-label="Galeria visual de projetos"
    >
      {/* Section Header */}
      <div className="container-editorial mb-10 sm:mb-14">
        <div className="max-w-[880px]">
          <div className="section-label mb-3.5">
            <span className="label-num">{sectionNumber}</span> Galeria Visual
          </div>

          <ScrollRevealTitle
            as="h2"
            text="Mais de 2.500 projetos entregues para marcas de todo o país."
            className="font-display font-medium text-left"
            style={{ fontSize: "clamp(26px, 3.8vw, 46px)", lineHeight: 1.12 }}
          />

          <ScrollReveal delay={0.1} yOffset={16}>
            <p className="mt-4 text-[15px] sm:text-[16px] text-muted-foreground max-w-[62ch]">
              Uma visão panorâmica sobre identidades visuais marcantes, direção contínua para redes sociais e experiências digitais concebidas para acelerar negócios.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Parallax Scroll Canvas with Deep Fade Mask */}
      <div className="relative w-full overflow-hidden mask-fade-edges-deep py-2 select-none">
        {/* Extended Soft Vignettes advancing deeper from sides toward the center */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 sm:w-48 md:w-64 lg:w-80 bg-gradient-to-r from-[#090A0C] via-[#090A0C]/75 to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 sm:w-48 md:w-64 lg:w-80 bg-gradient-to-l from-[#090A0C] via-[#090A0C]/75 to-transparent z-10"
        />

        {/* Row 1 — Standardized 1440x900 aspect ratio, pure images, hover scale & brightness */}
        <motion.div
          style={styleRow1}
          className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6 will-change-transform"
        >
          {row1.map((item, idx) => (
            <ProjectImageCard key={`r1-${item.id}-${idx}`} item={item} />
          ))}
          {/* Loop tail padding to prevent edge snapping during extreme scroll */}
          {row1.slice(0, 4).map((item, idx) => (
            <ProjectImageCard key={`r1-tail-${item.id}-${idx}`} item={item} />
          ))}
        </motion.div>

        {/* Row 2 — Standardized 1440x900 aspect ratio, pure images, hover scale & brightness */}
        <motion.div
          style={styleRow2}
          className="flex items-center gap-4 sm:gap-6 will-change-transform"
        >
          {row2.map((item, idx) => (
            <ProjectImageCard key={`r2-${item.id}-${idx}`} item={item} />
          ))}
          {/* Loop tail padding to prevent edge snapping during extreme scroll */}
          {row2.slice(0, 4).map((item, idx) => (
            <ProjectImageCard key={`r2-tail-${item.id}-${idx}`} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectShowcaseScroll;
