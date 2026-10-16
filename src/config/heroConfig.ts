import defaultHeroData from "./heroConfig.json";
import lucasHeroJpg from "@/assets/lucas-hero.jpg";
import lucasHeroPng from "@/assets/lucas-hero-seated-v2.png";
import profilePhotoNew from "@/assets/profile-photo-new.png";
import demoBrandIdentity from "@/assets/demo-brand-identity.jpg";
import demoWebDesign from "@/assets/demo-web-design.jpg";
import heroBgJpg from "@/assets/hero-bg.jpg";

export interface CustomHeroElement {
  id: string;
  type: "text" | "image" | "button" | "divider";
  title: string;
  content: string; // Texto para text, URL para image, rótulo para button
  linkUrl?: string; // Para tipo button
  style?: {
    alignment?: "left" | "center" | "right";
    color?: "default" | "primary" | "muted";
    size?: "sm" | "base" | "lg";
  };
  visibleDesktop: boolean;
  visibleMobile: boolean;
}

export interface HeroLayerItem {
  id: string; // "kicker" | "headline" | "subtitle" | "actions" | "metrics" | "media" | custom element id
  visibleDesktop: boolean;
  visibleMobile: boolean;
}

export interface HeroConfig {
  background: {
    type: "shader" | "image" | "video";
    imageUrl?: string;
    videoUrl?: string;
    overlayOpacity: number; // 0 to 100
  };
  layout: {
    columnDistribution: "7-5" | "6-6" | "centered" | "inverted";
    textAlignment: "left" | "center";
    paddingY: "compact" | "normal" | "spacious";
    order: "text-first" | "image-first";
  };
  layers: HeroLayerItem[];
  customElements: CustomHeroElement[];
  mobileOverrides: {
    enabled: boolean;
    textAlignment?: "left" | "center";
    headlineFontSize?: "compact" | "normal" | "large";
    imageAspectRatio?: "16/10" | "1/1" | "4/5" | "3/4";
    hideMetrics?: boolean;
    hideSocial?: boolean;
    hideKicker?: boolean;
  };
  kicker: {
    enabled: boolean;
    statusText: string;
    subText: string;
    pulseDot: boolean;
  };
  typography: {
    headlineLine1: string;
    headlineHighlight1: string;
    headlineLine2: string;
    headlineHighlight2: string;
    headlineEnd: string;
    subtitle: string;
    headlineFontSize: "normal" | "large" | "compact";
  };
  media: {
    imageUrl: string;
    imagePreset: "lucas-hero-jpg" | "lucas-hero-png" | "profile-photo-new" | "demo-brand-identity" | "demo-web-design" | "custom";
    aspectRatio: "16/10" | "16/11" | "4/3" | "1/1" | "3/4";
    borderRadius: "rounded-xl" | "rounded-2xl" | "rounded-3xl" | "rounded-full";
    glowEffect: boolean;
    badgeEnabled: boolean;
    badgeText: string;
    badgeStatus: "emerald" | "primary" | "amber" | "blue";
    cardFooterEnabled: boolean;
    cardFooterTitle: string;
    cardFooterRole: string;
    cardFooterSubtitle: string;
    cardGuaranteeText: string;
  };
  actions: {
    primaryText: string;
    primaryAction: "drawer" | "whatsapp" | "contact";
    showSecondary: boolean;
    secondaryText: string;
    secondaryLink: string;
  };
  metrics: {
    enabled: boolean;
    statProjects: string;
    statProjectsLabel: string;
    statClients: string;
    statClientsLabel: string;
    statExperience: string;
    statExperienceLabel: string;
  };
  social: {
    enabled: boolean;
    showInstagram: boolean;
    showBehance: boolean;
    showLinkedin: boolean;
    showDribbble: boolean;
    customInstagram: string;
    customBehance: string;
    customLinkedin: string;
    customDribbble: string;
  };
}

export const HERO_IMAGE_PRESETS: Record<string, { label: string; src: string }> = {
  "lucas-hero-jpg": {
    label: "Retrato Oficial (JPG)",
    src: lucasHeroJpg,
  },
  "lucas-hero-png": {
    label: "Retrato Transparente (PNG)",
    src: lucasHeroPng,
  },
  "profile-photo-new": {
    label: "Foto de Perfil Estúdio",
    src: profilePhotoNew,
  },
  "demo-brand-identity": {
    label: "Key Visual Identidade",
    src: demoBrandIdentity,
  },
  "demo-web-design": {
    label: "Key Visual Web Design",
    src: demoWebDesign,
  },
};

export const HERO_BACKGROUND_PRESETS: Record<string, { label: string; src: string }> = {
  "hero-bg-dark": {
    label: "Estúdio Dark Wallpaper",
    src: heroBgJpg,
  },
};

export const DEFAULT_HERO_CONFIG: HeroConfig = defaultHeroData as HeroConfig;

const HERO_STORAGE_KEY = "le_hero_config_custom_v1";

export function resolveHeroImage(mediaConfig: HeroConfig["media"]): string {
  if (mediaConfig.imageUrl && mediaConfig.imageUrl.trim()) {
    return mediaConfig.imageUrl.trim();
  }
  const preset = HERO_IMAGE_PRESETS[mediaConfig.imagePreset];
  return preset ? preset.src : lucasHeroJpg;
}

export function getStoredHeroConfig(): HeroConfig {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(HERO_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_HERO_CONFIG,
          ...parsed,
          background: { ...DEFAULT_HERO_CONFIG.background, ...(parsed.background || {}) },
          layout: { ...DEFAULT_HERO_CONFIG.layout, ...(parsed.layout || {}) },
          layers: Array.isArray(parsed.layers) ? parsed.layers : DEFAULT_HERO_CONFIG.layers,
          customElements: Array.isArray(parsed.customElements) ? parsed.customElements : [],
          mobileOverrides: { ...DEFAULT_HERO_CONFIG.mobileOverrides, ...(parsed.mobileOverrides || {}) },
          kicker: { ...DEFAULT_HERO_CONFIG.kicker, ...(parsed.kicker || {}) },
          typography: { ...DEFAULT_HERO_CONFIG.typography, ...(parsed.typography || {}) },
          media: { ...DEFAULT_HERO_CONFIG.media, ...(parsed.media || {}) },
          actions: { ...DEFAULT_HERO_CONFIG.actions, ...(parsed.actions || {}) },
          metrics: { ...DEFAULT_HERO_CONFIG.metrics, ...(parsed.metrics || {}) },
          social: { ...DEFAULT_HERO_CONFIG.social, ...(parsed.social || {}) },
        };
      }
    }
  } catch {
    // fallback on error
  }
  return DEFAULT_HERO_CONFIG;
}

export function saveStoredHeroConfig(config: HeroConfig): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new Event("hero-config-updated"));
      window.dispatchEvent(new Event("portfolio-store-updated"));
    }
  } catch {
    // ignore
  }
}

export function resetHeroConfigToDefault(): HeroConfig {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(HERO_STORAGE_KEY);
      window.dispatchEvent(new Event("hero-config-updated"));
      window.dispatchEvent(new Event("portfolio-store-updated"));
    }
  } catch {
    // ignore
  }
  return DEFAULT_HERO_CONFIG;
}
