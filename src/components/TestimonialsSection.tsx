import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollRevealTitle } from "./ScrollRevealTitle";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  autor: string;
  cargo: string;
  empresa: string;
  depoimento: string;
  destaque_frase?: string | null;
  nota?: number;
  avatar_url?: string | null;
  categoria?: string | null;
  fileira?: string | null;
  ativo?: boolean;
  ordem?: number;
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "fb-1",
    autor: "Mariana Costa",
    cargo: "Fundadora",
    empresa: "Studio Vértice",
    depoimento:
      "O Lucas traduziu com maestria o momento da nossa empresa em uma identidade sólida, elegante e de fácil aplicação. A percepção de valor dos nossos clientes mudou no mesmo dia do lançamento oficial.",
    destaque_frase: "A percepção de valor dos nossos clientes mudou no mesmo dia",
    nota: 5,
    categoria: "Identidade Visual",
    fileira: "top",
    ordem: 1,
  },
  {
    id: "fb-2",
    autor: "Rafael Mendes",
    cargo: "Diretor Executivo",
    empresa: "Norte Capital",
    depoimento:
      "O novo site institucional e a linha visual para as redes sociais organizaram completamente nossa frente comercial. Hoje apresentamos nossa tese de investimentos com muito mais autoridade e clareza.",
    destaque_frase: "muito mais autoridade e clareza comercial",
    nota: 5,
    categoria: "Web Design",
    fileira: "top",
    ordem: 2,
  },
  {
    id: "fb-3",
    autor: "Beatriz Alencar",
    cargo: "Sócia & CMO",
    empresa: "FitPulse Health",
    depoimento:
      "Processo cirúrgico e pontual. Do diagnóstico inicial às diretrizes visuais e telas interativas, cada detalhe foi entregue com nível internacional de refinamento e consistência técnica.",
    destaque_frase: "nível internacional de refinamento e consistência",
    nota: 5,
    categoria: "Identidade Visual",
    fileira: "top",
    ordem: 3,
  },
  {
    id: "fb-4",
    autor: "Carlos Eduardo",
    cargo: "Head de Produto",
    empresa: "NexTech Solutions",
    depoimento:
      "A clareza com que o Lucas estruturou o fluxo das interfaces economizou semanas da nossa equipe técnica. O design system facilitou a escalabilidade do produto.",
    destaque_frase: "economizou semanas da nossa equipe técnica",
    nota: 5,
    categoria: "UI/UX & Interfaces",
    fileira: "top",
    ordem: 4,
  },
  {
    id: "fb-5",
    autor: "Helena Duarte",
    cargo: "Diretora Criativa",
    empresa: "Atelier Noir",
    depoimento:
      "Poucos designers têm a sensibilidade estética e a disciplina de prazos do Lucas. O projeto de identidade e embalagens virou um ativo estratégico para a expansão da marca.",
    destaque_frase: "sensibilidade estética e disciplina de prazos impecável",
    nota: 5,
    categoria: "Branding & Embalagens",
    fileira: "bottom",
    ordem: 5,
  },
  {
    id: "fb-6",
    autor: "Thiago Vasconcelos",
    cargo: "Co-fundador",
    empresa: "Origina Cafés Especiais",
    depoimento:
      "As embalagens e o enxoval de social media criaram uma assinatura única para o Café Origina. Nosso engajamento e as vendas do e-commerce dobraram no trimestre seguinte.",
    destaque_frase: "vendas do e-commerce dobraram no trimestre seguinte",
    nota: 5,
    categoria: "Social Media",
    fileira: "bottom",
    ordem: 6,
  },
  {
    id: "fb-7",
    autor: "Camila Prado",
    cargo: "Fundadora",
    empresa: "Lótus Arquitetura",
    depoimento:
      "Trabalhar com o Lucas foi uma das decisões mais assertivas do nosso escritório. O portfólio digital transmite com precisão a sofisticação dos nossos projetos arquitetônicos.",
    destaque_frase: "transmite com precisão a sofisticação dos projetos",
    nota: 5,
    categoria: "Web Design",
    fileira: "bottom",
    ordem: 7,
  },
  {
    id: "fb-8",
    autor: "Rodrigo Siqueira",
    cargo: "Diretor de Operações",
    empresa: "Aurora Asset",
    depoimento:
      "Apresentação visual impecável, comunicação transparente em todas as fases e zero retrabalho. Um parceiro de longo prazo com o qual temos total tranquilidade.",
    destaque_frase: "comunicação transparente e zero retrabalho",
    nota: 5,
    categoria: "Identidade Visual",
    fileira: "bottom",
    ordem: 8,
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const renderHighlightedQuote = (quote: string, highlight?: string | null) => {
  if (!highlight || !quote.includes(highlight)) {
    return <span className="text-[#D4D4D8]">{quote}</span>;
  }
  const parts = quote.split(highlight);
  return (
    <>
      <span className="text-[#A1A1AA]">{parts[0]}</span>
      <span className="text-white font-medium bg-white/[0.06] px-1 py-0.5 rounded">
        {highlight}
      </span>
      <span className="text-[#A1A1AA]">{parts.slice(1).join(highlight)}</span>
    </>
  );
};

const TestimonialCard = ({ item }: { item: TestimonialItem }) => {
  const rating = Math.min(5, Math.max(1, item.nota || 5));

  return (
    <figure className="group relative w-[340px] sm:w-[420px] md:w-[460px] shrink-0 rounded-2xl border border-white/[0.08] bg-[#0E1013]/95 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:bg-[#13161A] shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
      {/* Top Header: Rating dots + Category tag */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1.5" aria-label={`Avaliação: ${rating} de 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                i < rating ? "bg-primary" : "bg-white/15"
              }`}
            />
          ))}
          <span className="ml-1 text-[11px] font-mono text-muted-foreground tabular-nums">
            5.0
          </span>
        </div>

        {item.categoria && (
          <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05]">
            {item.categoria}
          </span>
        )}
      </div>

      {/* Quote Body with highlighted phrase */}
      <blockquote className="text-[15px] sm:text-[16px] leading-[1.65] font-normal mb-6 min-h-[96px] select-none">
        “{renderHighlightedQuote(item.depoimento, item.destaque_frase)}”
      </blockquote>

      {/* Card Footer: Client Identity */}
      <figcaption className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-[15px] font-medium text-white truncate group-hover:text-primary transition-colors">
            {item.autor}
          </div>
          <div className="text-[12px] sm:text-[13px] text-muted-foreground truncate">
            {item.cargo} <span className="text-white/30">·</span> {item.empresa}
          </div>
        </div>

        {item.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={item.autor}
            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-mono font-medium text-white/80">
              {getInitials(item.autor)}
            </span>
          </div>
        )}
      </figcaption>
    </figure>
  );
};

interface TestimonialsSectionProps {
  sectionNumber?: string;
}

export const TestimonialsSection = ({ sectionNumber = "05." }: TestimonialsSectionProps) => {
  const { data: rawTestimonials } = useQuery({
    queryKey: ["testimonials"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials" as any)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_TESTIMONIALS;
      }
      return data as TestimonialItem[];
    },
  });

  const list = rawTestimonials && rawTestimonials.length > 0 ? rawTestimonials : FALLBACK_TESTIMONIALS;

  // Split into Row 1 (top) and Row 2 (bottom)
  const { rowTop, rowBottom } = useMemo(() => {
    const topExplicit = list.filter((t) => t.fileira === "top");
    const bottomExplicit = list.filter((t) => t.fileira === "bottom");

    let top: TestimonialItem[] = [];
    let bottom: TestimonialItem[] = [];

    if (topExplicit.length > 0 || bottomExplicit.length > 0) {
      top = topExplicit.length > 0 ? topExplicit : list.filter((_, idx) => idx % 2 === 0);
      bottom = bottomExplicit.length > 0 ? bottomExplicit : list.filter((_, idx) => idx % 2 === 1);
    } else {
      top = list.filter((_, idx) => idx % 2 === 0);
      bottom = list.filter((_, idx) => idx % 2 === 1);
    }

    // Ensure at least 3 items in each array for smooth loop
    while (top.length > 0 && top.length < 3) {
      top = [...top, ...top];
    }
    while (bottom.length > 0 && bottom.length < 3) {
      bottom = [...bottom, ...bottom];
    }

    return { rowTop: top, rowBottom: bottom };
  }, [list]);

  // Seamless duplication
  const duplicatedTop = useMemo(() => [...rowTop, ...rowTop], [rowTop]);
  const duplicatedBottom = useMemo(() => [...rowBottom, ...rowBottom], [rowBottom]);

  return (
    <section
      id="depoimentos"
      className="bg-background sec-pad border-b border-border overflow-hidden relative"
      aria-label="Depoimentos de clientes"
    >
      {/* Header Container */}
      <div className="container-editorial mb-12 sm:mb-16">
        <div className="max-w-[800px]">
          <div className="section-label mb-3.5">
            <span className="label-num">{sectionNumber}</span> Depoimentos
          </div>

          <ScrollRevealTitle
            as="h2"
            text="Parceiro de confiança. Padrões elevados. Entrega consistente."
            className="font-display text-foreground font-medium text-left"
            style={{ fontSize: "clamp(26px, 3.8vw, 44px)", lineHeight: 1.15 }}
          />

          <ScrollReveal delay={0.1} yOffset={16}>
            <p className="mt-4 text-[16px] text-muted-foreground max-w-[62ch]">
              O que dizem os fundadores, diretores e líderes que confiaram a evolução visual de suas marcas ao nosso estúdio.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Infinite Dual Carousel with Edge Fade Mask & ScrollReveal */}
      <ScrollReveal delay={0.18} yOffset={26}>
        <div className="relative w-full overflow-hidden mask-fade-edges py-3">
          {/* Subtle Dark Edge Vignettes for enhanced depth fade */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-background via-background/80 to-transparent z-10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-background via-background/80 to-transparent z-10"
          />

          {/* Row 1 — Moving Left with pause on hover */}
          <div className="mb-5 sm:mb-6 overflow-hidden flex items-center">
            <div className="marquee-track flex gap-5 sm:gap-6 animate-marquee-left shrink-0">
              {duplicatedTop.map((item, idx) => (
                <TestimonialCard key={`top-${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* Row 2 — Moving Right with pause on hover */}
          <div className="overflow-hidden flex items-center">
            <div className="marquee-track flex gap-5 sm:gap-6 animate-marquee-right shrink-0">
              {duplicatedBottom.map((item, idx) => (
                <TestimonialCard key={`bottom-${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default TestimonialsSection;
