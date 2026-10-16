import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import Layout from "@/components/Layout";

vi.mock("@/components/WhatsAppButton", () => ({ default: () => null }));
vi.mock("@/components/ContactDrawer", () => ({ ContactDrawerProvider: ({ children }: { children: React.ReactNode }) => children }));
vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(), useReducedMotion: () => true,
}));
afterEach(cleanup);

it.each(["/", "/projetos", "/projetos/example", "/sobre", "/servicos", "/contato"])("adds decorative shared guides to %s", (route) => {
  const { container } = render(<MemoryRouter initialEntries={[route]}><Layout><main>Conteúdo</main></Layout></MemoryRouter>);
  const grid = container.querySelector("[data-editorial-grid]");
  expect(grid).toHaveAttribute("aria-hidden", "true");
  expect(grid?.querySelectorAll("svg[focusable='false']")).toHaveLength(3);
  expect(grid?.querySelector("a, button, [tabindex]")).toBeNull();
});

it.each(["/admin", "/admin/login", "/admin/projetos/novo", "/proposta/example"])("adds noninteractive guides to %s while keeping the public cursor excluded", (route) => {
  const { container } = render(<MemoryRouter initialEntries={[route]}><Layout><main>Conteúdo</main></Layout></MemoryRouter>);
  expect(container.querySelector("[data-editorial-grid]")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector("[data-orion-area]")).toHaveAttribute("data-orion-area", route.startsWith("/admin") ? "admin" : "proposal");
  expect(container.querySelector("[data-public-layout]")).toBeNull();
  expect(document.querySelector(".orion-cursor")).toBeNull();
});
