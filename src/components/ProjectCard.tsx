import ResponsiveImage from "@/components/ResponsiveImage";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { parseCaseStudy, formatCategoryLabel } from "@/lib/caseStudy";

interface ProjectCardProps {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  imagem_capa: string | null;
  tags?: string[] | null;
  data_publicacao?: string | null;
  index?: number;
}

const ProjectCard = ({
  id,
  titulo,
  descricao,
  categoria,
  imagem_capa,
  tags,
  data_publicacao,
  index = 0,
}: ProjectCardProps) => {
  const caseData = parseCaseStudy({
    titulo,
    descricao,
    categoria,
    tags,
    data_publicacao,
  });

  const cleanTitle = titulo.split("—")[0].trim();
  const categoryLabel = formatCategoryLabel(categoria);
  const yearText = caseData.ano || "2025";
  const displayClient =
    caseData.cliente && caseData.cliente !== cleanTitle && caseData.cliente !== "Cliente"
      ? caseData.cliente
      : null;

  return (
    <article className="group rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-foreground/30 hover:shadow-2xl hover:shadow-black/25">
      <Link
        to={`/projetos/${id}`}
        className="grid grid-cols-1 lg:grid-cols-12 items-stretch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Coluna da Imagem (Proporção 16:10 com cantos suaves) */}
        <div className="lg:col-span-7 relative bg-secondary/40 overflow-hidden">
          <div className="aspect-[16/10] w-full h-full relative overflow-hidden">
            {imagem_capa ? (
              <ResponsiveImage
                src={imagem_capa}
                alt={titulo}
                width={1280}
                height={800}
                loading="lazy" sizes="(min-width: 1360px) 700px, (min-width: 1024px) 58vw, 100vw"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-secondary/50">
                <span className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
                  {categoryLabel}
                </span>
                <span className="font-display text-xl sm:text-2xl font-medium text-foreground">
                  {cleanTitle}
                </span>
              </div>
            )}

            {/* Gradiente sutil e vinheta de profundidade */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-35"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Coluna de Informações e Narrativa do Estudo de Caso */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/70">
          <div>
            {/* Metadados sem pílulas (Zero-Pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground mb-3 font-mono">
              <span className="text-primary font-medium">{categoryLabel}</span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="tabular-nums">{yearText}</span>
              {displayClient && (
                <>
                  <span aria-hidden="true" className="text-border">·</span>
                  <span className="truncate max-w-[170px] text-foreground/80">{displayClient}</span>
                </>
              )}
            </div>

            {/* Título Principal */}
            <h2 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-medium text-foreground leading-[1.14] mb-3.5 group-hover:text-primary transition-colors text-balance">
              {cleanTitle}
            </h2>

            {/* Resumo do Desafio / Estudo de Caso */}
            <p className="text-muted-foreground text-[15px] sm:text-[16px] leading-[1.6] line-clamp-3 mb-6">
              {caseData.resumo}
            </p>

            {/* Disciplinas e Entregáveis em texto limpo com separadores sutis */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground/80 mb-6">
                {tags.slice(0, 4).map((tag, i) => (
                  <span key={tag} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-border">/</span>}
                    <span className="hover:text-foreground transition-colors">{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé do Card com CTA e Microinteração na Seta */}
          <div className="pt-5 border-t border-border/70 flex items-center justify-between text-[14px] font-medium text-foreground group-hover:text-primary transition-colors mt-auto">
            <span className="tracking-tight">Ver estudo de caso</span>
            <div className="w-9 h-9 rounded-full border border-border group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300">
              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProjectCard;
