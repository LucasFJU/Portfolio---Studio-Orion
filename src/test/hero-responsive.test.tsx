import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSplitEditorial } from "@/components/hero/HeroSplitEditorial";
import { DEFAULT_HERO_CONFIG } from "@/config/heroConfig";

vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(),
  useReducedMotion: () => true,
}));
vi.mock("@/components/ui/GradientBlinds", () => ({ default: () => <div aria-hidden="true" /> }));

let mobile = false;
let breakpointListeners: Array<() => void> = [];
beforeEach(() => {
  mobile = false;
  breakpointListeners = [];
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    get matches() { return query === "(max-width: 767px)" && mobile; },
    media: query,
    addEventListener: (_: string, listener: () => void) => breakpointListeners.push(listener),
    removeEventListener: (_: string, listener: () => void) => { breakpointListeners = breakpointListeners.filter((item) => item !== listener); },
    addListener: () => {}, removeListener: () => {},
  })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function setup(config = structuredClone(DEFAULT_HERO_CONFIG), extra = {}) {
  const openContactDrawer = vi.fn();
  const result = render(<MemoryRouter><HeroSplitEditorial config={config} statProjects="" statClients="" statExperience="" instagramUrl="" behanceUrl="" linkedinUrl="" dribbbleUrl="" openContactDrawer={openContactDrawer} {...extra} /></MemoryRouter>);
  return { ...result, openContactDrawer };
}

describe("hero configuration and real mobile breakpoints", () => {
  it("applies mobile layer visibility and overrides when the viewport crosses the breakpoint", () => {
    const config = structuredClone(DEFAULT_HERO_CONFIG);
    config.mobileOverrides.hideKicker = true;
    config.layers.find((item) => item.id === "actions")!.visibleMobile = false;
    setup(config);
    expect(screen.getByText("Disponível para novos projetos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solicitar orçamento" })).toBeInTheDocument();
    act(() => { mobile = true; breakpointListeners.forEach((listener) => listener()); });
    expect(screen.queryByText("Disponível para novos projetos")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Solicitar orçamento" })).not.toBeInTheDocument();
    act(() => { mobile = false; breakpointListeners.forEach((listener) => listener()); });
    expect(screen.getByRole("button", { name: "Solicitar orçamento" })).toBeInTheDocument();
  });

  it("keeps the admin mobile preview independent of the host viewport", () => {
    const config = structuredClone(DEFAULT_HERO_CONFIG);
    config.mobileOverrides.hideKicker = true;
    setup(config, { previewDevice: "mobile" });
    expect(screen.queryByText("Disponível para novos projetos")).not.toBeInTheDocument();
  });

  it("opens the existing drawer and retains the portfolio destination", () => {
    const { openContactDrawer } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar orçamento" }));
    expect(openContactDrawer).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Ver projetos" })).toHaveAttribute("href", "/projetos");
  });

  it("uses the configured WhatsApp number and falls back to contact when no valid number exists", () => {
    const config = structuredClone(DEFAULT_HERO_CONFIG);
    config.actions.primaryAction = "whatsapp";
    const popup = vi.spyOn(window, "open").mockReturnValue(null);
    const view = setup(config, { whatsappNumber: "+55 (11) 98765-4321" });
    fireEvent.click(screen.getByRole("button", { name: "Solicitar orçamento" }));
    expect(popup).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/5511987654321?text="), "_blank", "noopener,noreferrer");
    expect(view.openContactDrawer).not.toHaveBeenCalled();
    cleanup();
    const fallback = setup(config);
    fireEvent.click(screen.getByRole("button", { name: "Solicitar orçamento" }));
    expect(fallback.openContactDrawer).toHaveBeenCalledOnce();
  });
});
