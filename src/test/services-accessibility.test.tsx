import { act, cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ServicesSection from "@/components/ServicesSection";

let reducedMotion = true;
vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(),
  useReducedMotion: () => reducedMotion,
}));
beforeEach(() => { reducedMotion = true; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("shows all three offers without selectors or hidden content when reduced motion is requested", () => {
  // Reduced motion must expose every service even on a large screen.
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query === "(min-width: 1024px)", media: query,
    addEventListener: () => {}, removeEventListener: () => {},
  })));
  render(<MemoryRouter><ServicesSection /></MemoryRouter>);
  const offers = screen.getAllByRole("article");
  expect(offers).toHaveLength(3);
  for (const offer of offers) {
    expect(within(offer).getAllByRole("listitem")).toHaveLength(3);
    const image = within(offer).getByRole("img");
    expect(image).toHaveAttribute("data-parallax", "disabled");
    expect(image).toHaveStyle({ transform: "none" });
    expect(within(offer).getByRole("heading").parentElement).toHaveStyle({ opacity: "1" });
    expect(within(offer).getByRole("button", { name: /Solicitar orçamento:/ })).toBeInTheDocument();
    expect(within(offer).getByText("EXEMPLO VISUAL")).toBeInTheDocument();
  }
});

it("enables mobile stacking only while every panel fits, then falls back after content grows", () => {
  reducedMotion = false;
  let contentHeight = 600;
  let notify: ResizeObserverCallback = () => {};
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("innerHeight", 844);
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { notify = callback; }
    observe() {} disconnect() {}
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    const height = this.classList.contains("service-panel-inner") ? contentHeight :
      this.classList.contains("service-viewport-probe") ? 844 : 0;
    return { x: 0, y: 0, left: 0, right: 390, top: 844, bottom: 844 + height, width: 390, height, toJSON: () => ({}) };
  });
  const { container } = render(<MemoryRouter><ServicesSection theme="light" /></MemoryRouter>);
  expect(container.querySelector("section")).toHaveAttribute("data-scroll-mode", "stack");
  contentHeight = 800;
  act(() => notify([], {} as ResizeObserver));
  expect(container.querySelector("section")).toHaveAttribute("data-scroll-mode", "flow");
  expect(screen.getAllByRole("article")).toHaveLength(3);
  for (const offer of screen.getAllByRole("article")) {
    expect(within(offer).getByRole("heading").parentElement).toHaveStyle({ filter: "none" });
  }
});
