import { cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import StackedProjects from "@/components/StackedProjects";

vi.mock("@/components/ScrollRevealTitle", () => ({ ScrollRevealTitle: ({ text }: { text: string }) => <h2>{text}</h2> }));

const clients: QueryClient[] = [];
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  localStorage.clear();
});

function showProjects(featuredIds: number[], order: string[] = []) {
  // The app's existing local adapter runs against isolated jsdom storage, never a remote database.
  localStorage.setItem("le_portfolio_store_v3", JSON.stringify({
    projects: [1, 2, 3, 4, 5, 6].map((id) => ({
      id: `project-${id}`, titulo: `Marca ${id} — Estudo de caso`, categoria: "Brand Design",
      destaque: featuredIds.includes(id), status: id === 6 ? "Rascunho" : "Concluído",
      imagem_capa: `/cover-${id}.jpg`, data_publicacao: `2024-01-0${id}T12:00:00Z`,
    })),
    site_settings: [{ key: "featured_projects_order", value: JSON.stringify(order) }],
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  return render(<QueryClientProvider client={client}><MemoryRouter><StackedProjects /></MemoryRouter></QueryClientProvider>);
}

function projectLinks() {
  return screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/projetos/"));
}

it("preserves curated ordering, the four-project limit and case-study links", async () => {
  showProjects([1, 2, 3, 4, 5, 6], ["project-2", "project-4", "project-1", "project-3"]);
  await screen.findByRole("link", { name: /Marca 5/ });
  const projects = projectLinks();
  expect(projects.map((link) => link.getAttribute("href"))).toEqual([
    "/projetos/project-5", "/projetos/project-2", "/projetos/project-4", "/projetos/project-1",
  ]);
  expect(screen.queryByRole("heading", { name: "Marca 6" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute("href", "/projetos");
  expect(within(projects[0]).getByRole("img")).toHaveAttribute("src", "/cover-5.jpg");
});

it("fills missing featured slots with recent published projects without duplicates", async () => {
  showProjects([2]);
  await screen.findByRole("link", { name: /Marca 2/ });
  expect(projectLinks().map((link) => link.getAttribute("href"))).toEqual([
    "/projetos/project-2", "/projetos/project-5", "/projetos/project-4", "/projetos/project-3",
  ]);
});
