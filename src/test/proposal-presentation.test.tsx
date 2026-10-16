import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ProposalView from "@/pages/ProposalView";

vi.mock("@/components/ui/GradientBlinds", () => ({ default: () => <div data-testid="gradient-blinds" /> }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) } }));
beforeEach(() => vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function show(projectIds: string[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  queryClient.setQueryData(["proposal", "local-qa"], {
    id: "local-qa", slug: "local-qa", titulo: "Projeto de identidade", cliente_nome: "Cliente de teste", status: "Enviada",
    introducao: "Objetivo exclusivo desta proposta de teste.",
    projeto_ids: projectIds, created_at: "2026-10-16T12:00:00Z", prazo_entrega: "30 dias", valor_total: 5000,
    processo: { steps: [], entregaveis: ["Manual de marca"] },
    formas_pagamento: [{ titulo: "À vista", detalhe: "Pagamento único", destaque: true }, { titulo: "Parcelado", detalhe: "Duas parcelas", destaque: false }],
  });
  queryClient.setQueryData(["proposal-projects", "local-qa"], [
    { id: "a", titulo: "Case Alfa", categoria: "Brand Design", descricao: "Case de teste" },
    { id: "b", titulo: "Case Beta", categoria: "Web Design", descricao: "Case de teste" },
  ]);
  queryClient.setQueryData(["site-settings-public"], []);
  return render(<HelmetProvider><QueryClientProvider client={queryClient}><MemoryRouter initialEntries={["/proposta/local-qa"]}><Routes><Route path="/proposta/:slug" element={<ProposalView />} /></Routes></MemoryRouter></QueryClientProvider></HelmetProvider>);
}
it("shows the portrait and biography without an empty cases section", () => {
  const { container } = show();
  expect(screen.getByRole("heading", { name: "Prazer, sou o Lucas." })).toBeInTheDocument();
  expect(within(container.querySelector("#autoridade") as HTMLElement).getByRole("img", { name: "Lucas Evangelista" })).toBeInTheDocument();
  expect(container.querySelector("#cases")).toBeNull();
  expect(container.querySelector("#autoridade .orion-portrait-halo")).toBeInTheDocument();
  expect(container.querySelector("#objetivo")).toHaveTextContent("Objetivo exclusivo desta proposta de teste.");
  expect(Array.from(container.querySelectorAll<HTMLElement>(".orion-proposal-page section[id]"), section => section.id))
    .toEqual(["objetivo", "autoridade", "escopo", "investimento"]);
  expect(container.querySelector(".orion-proposal-cover-effect")).toBeInTheDocument();
  expect(container.querySelector('[aria-label="Marcas e empresas parceiras"]')).toBeInTheDocument();
  expect(container.querySelector(".orion-proposal-cover-kicker")).toHaveTextContent("Cliente de teste");
  expect(container.querySelector(".orion-proposal-cover-kicker")).not.toHaveTextContent("Proposta preparada para");
  expect(container.querySelector(".orion-proposal-cover")).toHaveTextContent("Válida até");
  expect(container.querySelector(".orion-proposal-cover")).not.toHaveTextContent("Objetivo exclusivo desta proposta de teste.");
});
it("preserves curated case order and payment selection without approving the proposal", () => {
  const { container } = show(["b", "a"]);
  expect(Array.from(container.querySelectorAll("#cases h3"), el => el.textContent)).toEqual(["Case Beta", "Case Alfa"]);
  const options = container.querySelectorAll<HTMLButtonElement>("[data-proposal-payment]");
  expect(options).toHaveLength(2);
  fireEvent.click(options[1]);
  expect(options[1]).toHaveAttribute("aria-pressed", "true");
  expect(options[0]).toHaveAttribute("aria-pressed", "false");
  expect(screen.getAllByText("Parcelado").length).toBeGreaterThan(1);
  expect(screen.getByRole("heading", { name: "Proposta Comercial" })).toBeInTheDocument();
  expect(container.querySelector(".orion-proposal-cover-client")).toHaveTextContent("Projeto de identidade");
  expect(Array.from(container.querySelectorAll<HTMLElement>(".orion-proposal-page section[id]"), section => section.id))
    .toEqual(["objetivo", "autoridade", "escopo", "cases", "investimento"]);
  expect(container.querySelector('a[href="#cases"]')).toHaveTextContent("04. Cases");
});
