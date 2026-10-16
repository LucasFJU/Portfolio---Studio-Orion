import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useContactDrawer } from "./ContactDrawer";

interface CTASectionProps { embedded?: boolean; }

const CTASection = ({ embedded = false }: CTASectionProps) => {
  const { openContactDrawer } = useContactDrawer();
  const cardContent = (
    <div className="container-editorial">
      <div className="rounded-2xl border border-white/10 bg-[#141518] p-8 sm:p-12 lg:p-16">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] font-medium text-foreground/85">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>Agenda aberta para novos projetos</span>
            </div>
            <h2 className="mb-4 font-display font-medium text-foreground"
              style={{ fontSize: "clamp(28px, 4.2vw, 48px)", lineHeight: 1.08 }}>
              Vamos conversar sobre o seu projeto?
            </h2>
            <p className="max-w-[52ch] text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Conte um pouco sobre a sua empresa e o que você precisa desenvolver. Retorno com uma
              proposta clara de escopo, prazos e investimento.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <button type="button" onClick={() => openContactDrawer()} className="btn-primary">
              <span>Solicitar orçamento</span><ArrowRight size={16} aria-hidden="true" />
            </button>
            <Link to="/contato" className="btn-ghost border-white/15">Ir para a página de contato</Link>
          </div>
        </div>
      </div>
    </div>
  );
  return embedded ? (
    <div className="relative z-10 py-10 sm:py-14 lg:py-16">{cardContent}</div>
  ) : (
    <section className="bg-[#07080A] py-20 sm:py-24 lg:py-28">{cardContent}</section>
  );
};
export default CTASection;
