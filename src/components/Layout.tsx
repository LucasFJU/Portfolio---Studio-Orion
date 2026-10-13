import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import WhatsAppButton from "./WhatsAppButton";
import { ContactDrawerProvider } from "./ContactDrawer";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isInternalRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/proposta");

  return (
    <ContactDrawerProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <motion.div
          key={pathname}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
        {!isInternalRoute && <WhatsAppButton />}
      </div>
    </ContactDrawerProvider>
  );
};

export default Layout;
