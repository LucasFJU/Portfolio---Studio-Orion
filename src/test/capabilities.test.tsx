import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Compass, Layers } from "lucide-react";
import { afterEach, expect, it, vi } from "vitest";
import CapabilitiesSection from "@/components/CapabilitiesSection";

vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(),
  useReducedMotion: () => true,
}));

afterEach(cleanup);

it("opens only the selected capability and exposes its accessible disclosure state", () => {
  render(<CapabilitiesSection items={[
    { num: "01", icon: Compass, category: "Identidade & Marca", summary: "Sistemas visuais.", skills: ["Manual de Marca"] },
    { num: "02", icon: Layers, category: "Sites & Interfaces", summary: "Experiências digitais.", skills: ["Landing Pages"] },
  ]} />);
  const brand = screen.getByRole("button", { name: "Identidade & Marca" });
  const sites = screen.getByRole("button", { name: "Sites & Interfaces" });
  expect(brand).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("region", { name: "Identidade & Marca" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Sites & Interfaces" })).not.toBeInTheDocument();
  fireEvent.click(sites);
  expect(brand).toHaveAttribute("aria-expanded", "false");
  expect(sites).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("region", { name: "Sites & Interfaces" })).toHaveTextContent("Landing Pages");
  expect(screen.queryByText("Manual de Marca")).not.toBeInTheDocument();
  fireEvent.click(sites);
  expect(screen.queryByRole("region", { name: "Sites & Interfaces" })).not.toBeInTheDocument();
});
