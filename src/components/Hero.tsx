import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContactDrawer } from "./ContactDrawer";
import { isValidSocialUrl } from "@/lib/caseStudy";
import { HeroSplitEditorial } from "./hero/HeroSplitEditorial";
import { getStoredHeroConfig, type HeroConfig } from "@/config/heroConfig";

export interface HeroProps {
  colors?: string[];
  bg?: string;
  config?: HeroConfig;
}

const Hero = ({
  colors = ["#FF4001", "#000000", "#141518", "#090A0C"],
  bg = "#000000",
  config: propConfig,
}: HeroProps = {}) => {
  const { openContactDrawer } = useContactDrawer();
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => propConfig || getStoredHeroConfig());

  useEffect(() => {
    if (propConfig) {
      setHeroConfig(propConfig);
      return;
    }
    const updateConfig = () => {
      setHeroConfig(getStoredHeroConfig());
    };
    window.addEventListener("hero-config-updated", updateConfig);
    window.addEventListener("storage", updateConfig);
    window.addEventListener("portfolio-store-updated", updateConfig);
    return () => {
      window.removeEventListener("hero-config-updated", updateConfig);
      window.removeEventListener("storage", updateConfig);
      window.removeEventListener("portfolio-store-updated", updateConfig);
    };
  }, [propConfig]);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      return (data as any[]) || [];
    },
  });

  const getSetting = (key: string, fallback: string) => {
    const found = settings?.find((s: any) => s.key === key)?.value;
    return found && found.trim() ? found.trim() : fallback;
  };

  const statProjects = getSetting("stat_projects", "2.500+");
  const statClients = getSetting("stat_clients", "500+");
  const statExperience = getSetting("stat_experience", "13+ anos");

  const rawInstagram = getSetting("social_instagram", "");
  const rawBehance = getSetting("social_behance", "");
  const rawLinkedin = getSetting("social_linkedin", "");
  const rawDribbble = getSetting("social_dribbble", "");

  const instagramUrl = isValidSocialUrl(rawInstagram) ? rawInstagram : "https://instagram.com";
  const behanceUrl = isValidSocialUrl(rawBehance) ? rawBehance : "https://behance.net";
  const linkedinUrl = isValidSocialUrl(rawLinkedin) ? rawLinkedin : "https://linkedin.com";
  const dribbbleUrl = isValidSocialUrl(rawDribbble) ? rawDribbble : "https://dribbble.com";

  const sharedProps = {
    whatsappNumber: getSetting("whatsapp_number", ""),
    statProjects,
    statClients,
    statExperience,
    instagramUrl,
    behanceUrl,
    linkedinUrl,
    dribbbleUrl,
    openContactDrawer,
    colors,
    bg,
    config: heroConfig,
  };

  return (
    <section className="relative bg-[#000000] flex flex-col justify-between overflow-hidden">
      {/* Definitive Layout: Split Editorial Studio */}
      <HeroSplitEditorial {...sharedProps} />
    </section>
  );
};

export default Hero;
