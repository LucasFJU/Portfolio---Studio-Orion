import type { HeroConfig } from "@/config/heroConfig";

export interface HeroSharedProps {
  statProjects: string;
  statClients: string;
  statExperience: string;
  instagramUrl: string;
  behanceUrl: string;
  linkedinUrl: string;
  dribbbleUrl: string;
  whatsappNumber?: string;
  openContactDrawer: () => void;
  isComparisonMode?: boolean;
  onSelectThisVariant?: () => void;
  colors?: string[];
  bg?: string;
  config?: HeroConfig;
}
