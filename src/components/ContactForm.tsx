import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowRight, Loader2 } from "lucide-react";

const SERVICE_OPTIONS = [
  "Identidade visual",
  "Design para redes sociais",
  "Sites e interfaces",
  "Projeto completo (Mais de uma frente)",
];

interface ContactFormProps {
  initialService?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

const ContactForm = ({ initialService = "", onSuccess, compact = false }: ContactFormProps) => {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servico, setServico] = useState(initialService || SERVICE_OPTIONS[0]);
  const [mensagem, setMensagem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialService) {
      const matched = SERVICE_OPTIONS.find(
        (opt) => opt.toLowerCase() === initialService.toLowerCase()
      );
      if (matched) setServico(matched);
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      setErrorMessage("Por favor, preencha seu nome, e-mail e um resumo do que precisa.");
      return;
    }

    setSubmitting(true);
    try {
      const cleanWa = whatsapp.trim();
      const { error } = await supabase.from("leads").insert({
        nome: nome.trim(),
        email: email.trim(),
        assunto: cleanWa ? `WhatsApp: ${cleanWa}` : servico,
        tipo_projeto: servico,
        mensagem: mensagem.trim(),
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSubmitted(true);
      setNome("");
      setEmail("");
      setWhatsapp("");
      setMensagem("");
      if (onSuccess) onSuccess();
    } catch {
      setErrorMessage(
        "Não foi possível enviar sua mensagem agora. Tente novamente ou envie um e-mail direto."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-border bg-secondary/40 p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
          <Check size={22} />
        </div>
        <h3 className="font-display text-2xl font-medium text-foreground mb-2">
          Mensagem recebida
        </h3>
        <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md mx-auto mb-6">
          Obrigado pelo interesse. Analisarei as informações do seu projeto e retornarei em até 1
          dia útil.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn-ghost text-sm px-5 py-2.5"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="cf-nome" className="block text-[14px] font-medium text-foreground mb-2">
          Seu nome *
        </label>
        <input
          id="cf-nome"
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como posso te chamar?"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-email" className="block text-[14px] font-medium text-foreground mb-2">
            E-mail *
          </label>
          <input
            id="cf-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="cf-whatsapp"
            className="block text-[14px] font-medium text-foreground mb-2"
          >
            WhatsApp <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <input
            id="cf-whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <span className="block text-[14px] font-medium text-foreground mb-2">
          O que você precisa desenvolver? *
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SERVICE_OPTIONS.map((option) => {
            const active = servico === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setServico(option)}
                aria-pressed={active}
                className={`text-left rounded-lg border px-4 py-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/25"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="cf-mensagem"
          className="block text-[14px] font-medium text-foreground mb-2"
        >
          Sobre o projeto *
        </label>
        <textarea
          id="cf-mensagem"
          rows={compact ? 3 : 4}
          required
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Conte brevemente sobre sua marca, objetivos e prazo desejado..."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-[14px] text-destructive-foreground"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <span>Enviar solicitação de orçamento</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
