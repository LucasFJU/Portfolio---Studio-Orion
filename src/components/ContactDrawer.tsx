import { createContext, useContext, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ContactForm from "./ContactForm";
import { ArrowUpRight } from "lucide-react";

interface ContactDrawerOptions {
  defaultService?: string;
}

interface ContactDrawerContextValue {
  isOpen: boolean;
  openContactDrawer: (options?: ContactDrawerOptions | string) => void;
  closeContactDrawer: () => void;
}

const ContactDrawerContext = createContext<ContactDrawerContextValue>({
  isOpen: false,
  openContactDrawer: () => {},
  closeContactDrawer: () => {},
});

export const useContactDrawer = () => useContext(ContactDrawerContext);

export const ContactDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ContactDrawerOptions>({});

  const openContactDrawer = (opts?: ContactDrawerOptions | string) => {
    if (typeof opts === "string") {
      setOptions({ defaultService: opts });
    } else {
      setOptions(opts || {});
    }
    setIsOpen(true);
  };

  const closeContactDrawer = () => {
    setIsOpen(false);
  };

  return (
    <ContactDrawerContext.Provider value={{ isOpen, openContactDrawer, closeContactDrawer }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[500px] bg-background border-1   border-border p-6 md:p-8 overflow-y-auto"
        >
          <SheetHeader className="text-left pb-6 border-b border-border mb-6">
            <div className="section-label mb-1">
              <span className="label-num">Contato.</span> Iniciar conversa
            </div>
            <SheetTitle className="font-display text-2xl md:text-[28px] font-medium text-foreground leading-tight">
              Vamos conversar sobre seu projeto?
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
              Conte o que você precisa criar ou melhorar.
            </SheetDescription>
          </SheetHeader>

          <ContactForm initialService={options.defaultService} compact />

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Prefere a página completa?</span>
            <Link
              to="/contato"
              onClick={closeContactDrawer}
              className="text-foreground hover:text-primary font-medium inline-flex items-center gap-1 transition-colors"
            >
              Abrir página de contato <ArrowUpRight size={13} />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </ContactDrawerContext.Provider>
  );
};
