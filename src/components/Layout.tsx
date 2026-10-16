import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import WhatsAppButton from "./WhatsAppButton";
import { ContactDrawerProvider } from "./ContactDrawer";
import EditorialGrid from "./EditorialGrid";
import OrionCursor from "./OrionCursor";
import { useRouteReveals } from "@/hooks/use-route-reveals";
import "./orion-surfaces.css";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();
  useRouteReveals(pathname);
  const area = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/proposta") ? "proposal" : "public";
  const isInternalRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/proposta");

  return (
    <ContactDrawerProvider>
      <div data-orion-area={area} data-orion-page={pathname} data-public-layout={isInternalRoute ? undefined : "true"} className="relative isolate min-h-screen bg-background flex flex-col">
        <motion.div
          key={pathname}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="orion-route-content flex-1 flex flex-col"
        >
          {children}
        </motion.div>
        <EditorialGrid />
        {!isInternalRoute && <OrionCursor key={`cursor-${pathname}`} />}
        {!isInternalRoute && <WhatsAppButton />}
      </div>
    </ContactDrawerProvider>
  );
};

export default Layout;
