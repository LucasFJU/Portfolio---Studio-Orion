import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it } from "vitest";
import { ContactDrawerProvider, useContactDrawer } from "@/components/ContactDrawer";

afterEach(cleanup);

function ContactEntry() {
  const { openContactDrawer } = useContactDrawer();
  return <button onClick={() => openContactDrawer("Sites e interfaces")}>Orçamento de site</button>;
}

it("passes the selected service from the contact drawer into the actual form", async () => {
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><ContactDrawerProvider><ContactEntry /></ContactDrawerProvider></MemoryRouter></QueryClientProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Orçamento de site" }));
  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sites e interfaces" })).toHaveAttribute("aria-pressed", "true");
});
