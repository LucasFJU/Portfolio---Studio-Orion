import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SectionTransition from "@/components/SectionTransition";
import DesignValueSection from "@/components/DesignValueSection";
import ProcessSection from "@/components/ProcessSection";

let reducedMotion = true;
vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(),
  useReducedMotion: () => reducedMotion,
}));
vi.mock("@/lib/gsap", () => ({
  gsap: {}, ScrollTrigger: {},
  createEditorialScrollContext: () => ({ revert: () => {} }),
}));
beforeEach(() => { reducedMotion = true; });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function viewport(desktop: boolean) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query === "(min-width: 1024px)" && desktop,
    media: query, addEventListener: () => {}, removeEventListener: () => {},
  })));
}

it("keeps transitions decorative and static for reduced motion, even on desktop", () => {
  viewport(true);
  const { container } = render(<SectionTransition sourceColor="#090A0C" destinationColor="#F0EEE8" />);
  const band = container.firstElementChild!;
  expect(band).toHaveAttribute("aria-hidden", "true");
  expect(band).toHaveAttribute("data-motion", "static");
  expect(band).toHaveStyle({ backgroundColor: "#090A0C" });
  expect(container.querySelector("svg")).toHaveAttribute("focusable", "false");
  expect(container.querySelector("path")).toHaveAttribute("fill", "#F0EEE8");
  expect(container.querySelector("button, a, [tabindex]")).toBeNull();
});

it("keeps the curve static on mobile without changing the chosen destination", () => {
  reducedMotion = false;
  viewport(false);
  const { container } = render(<SectionTransition sourceColor="#FF4001" destinationColor="#090A0C" direction="rise-left" />);
  expect(container.firstElementChild).toHaveAttribute("data-motion", "static");
  expect(container.querySelector("path")).toHaveAttribute("fill", "#090A0C");
  expect(container.querySelector("svg")).toHaveClass("-scale-x-100");
});

it("exposes all three benefits immediately when motion is reduced", () => {
  render(<DesignValueSection />);
  expect(screen.getByRole("heading", { name: "Design que torna sua marca mais clara, consistente e reconhecível." })).toHaveStyle({ opacity: "1" });
  expect(screen.getAllByRole("article")).toHaveLength(3);
  for (const name of ["Reconhecimento", "Consistência", "Clareza"]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
});

it("keeps the default process dark and applies orange only when explicitly requested", () => {
  const { container, rerender } = render(<ProcessSection detailed sectionNumber="02." />);
  expect(container.querySelector("section")).toHaveAttribute("data-theme", "dark");
  expect(container.querySelector("section")).not.toHaveClass("home-surface-orange");
  expect(screen.getByText("Diagnóstico")).toBeInTheDocument();
  expect(screen.getByText("Reunião de alinhamento e levantamento de objetivos")).toBeInTheDocument();
  rerender(<ProcessSection theme="orange" sectionNumber="06." />);
  expect(container.querySelector("section")).toHaveClass("home-surface-orange");
  expect(screen.getByRole("heading", { name: "Do primeiro contato à entrega." })).toBeInTheDocument();
});
