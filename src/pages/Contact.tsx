import SectionTransition from "@/components/SectionTransition";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageMeta from "@/components/PageMeta";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { isValidWhatsappNumber } from "@/lib/caseStudy";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("servico") || "";

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback = "") =>
    settings?.find((s: any) => s.key === key)?.value || fallback;

  const contactEmail = getSetting("contact_email", "contato@lucasevangelista.design");
  const rawWhatsapp = getSetting("whatsapp_number") || getSetting("contact_whatsapp", "");
  const hasValidWhatsapp = isValidWhatsappNumber(rawWhatsapp);
  const cleanWhatsapp = hasValidWhatsapp ? rawWhatsapp.replace(/\D/g, "") : "";

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Contato — Lucas Evangelista"
        description="Entre em contato para solicitar um orçamento de identidade visual, design para redes sociais ou criação de site."
      />
      <Navbar />

      <main className="pt-[108px] md:pt-[124px]">
        <header data-orion-reveal className="container-editorial pb-12 md:pb-16">
              <div className="section-label mb-3">
                <span className="label-num">01.</span> Contato e orçamento
              </div>

              <h1
                className="font-display text-foreground font-medium mb-5"
                style={{ fontSize: "clamp(32px, 4.8vw, 52px)", lineHeight: 1.06 }}
              >
                Vamos conversar sobre o seu projeto.
              </h1>

              <p className="text-muted-foreground text-[16px] md:text-[17px] leading-[1.65] mb-10">
                Preencha o formulário ao lado com algumas informações iniciais ou entre em contato
                diretamente por e-mail.
              </p>

        </header>
        <SectionTransition sourceColor="#090A0C" destinationColor="#FFFAFA" />
        <section className="orion-surface-light sec-pad">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5">
              <div className="space-y-6 pt-8 border-t border-border" data-orion-reveal>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[13px] text-muted-foreground mb-0.5">E-mail direto</div>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-[15px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {cleanWhatsapp && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-0.5">WhatsApp</div>
                      <a
                        href={`https://wa.me/${cleanWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] font-medium text-foreground hover:text-primary transition-colors"
                      >
                        Iniciar conversa no WhatsApp ↗
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-[13px] text-muted-foreground mb-0.5">Prazo de retorno</div>
                    <div className="text-[15px] font-medium text-foreground">
                      Retorno em até 1 dia útil
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="orion-surface-dark relative z-30 rounded-2xl border border-border p-6 sm:p-9 lg:p-11">
                <ContactForm initialService={initialService} />
              </div>
            </div>
          </div>
        </div>
        </section>
        <SectionTransition sourceColor="#FFFAFA" destinationColor="#090A0C" />
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
