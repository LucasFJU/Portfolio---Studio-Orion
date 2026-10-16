import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import OrionCursor from "@/components/OrionCursor";
import Layout from "@/components/Layout";

vi.mock("@/components/WhatsAppButton", () => ({ default: () => null }));
vi.mock("@/components/ContactDrawer", () => ({ ContactDrawerProvider: ({ children }: { children: React.ReactNode }) => children }));
vi.mock("framer-motion", async (original) => ({ ...await original<typeof import("framer-motion")>(), useReducedMotion: () => true }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.orionCursor; });
function media(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({ matches, addEventListener() {}, removeEventListener() {} }));
}

it("uses the custom cursor on buttons, restores native text entry and cleans up after blur and unmount", () => {
  media(true);
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1200);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800);
  let frame: FrameRequestCallback = () => {};
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 1; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const { unmount } = render(<><OrionCursor /><button style={{ resize: "none", cursor: "pointer" }}>Projeto</button><input aria-label="Nome" /></>);
  const move = (element: Element, x = 100) => {
    const event = new MouseEvent("pointermove", { bubbles: true, clientX: x, clientY: 90 });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
    fireEvent(element, event);
  };
  move(screen.getByRole("button"));
  act(() => frame(0));
  expect(document.documentElement.dataset.orionCursor).toBe("active");
  expect(document.querySelector(".orion-cursor")).toHaveStyle({ visibility: "visible", transform: "translate3d(100px, 90px, 0)" });
  expect(document.querySelector(".orion-cursor")).toHaveAttribute("aria-hidden", "true");
  move(screen.getByLabelText("Nome"));
  expect(document.documentElement.dataset.orionCursor).toBeUndefined();
  move(screen.getByRole("button")); act(() => frame(0));
  fireEvent.blur(window);
  expect(document.documentElement.dataset.orionCursor).toBeUndefined();
  move(screen.getByRole("button"), 1200);
  expect(document.documentElement.dataset.orionCursor).toBeUndefined();
  move(screen.getByRole("button")); act(() => frame(0));
  fireEvent.keyDown(document, { key: "Tab" });
  expect(document.documentElement.dataset.orionCursor).toBeUndefined();
  unmount();
  expect(document.querySelector(".orion-cursor")).toBeNull();
});

it("keeps the native cursor when fine-pointer and motion requirements are not met", () => {
  media(false); render(<OrionCursor />);
  expect(document.querySelector(".orion-cursor")).toBeNull();
  expect(document.documentElement.dataset.orionCursor).toBeUndefined();
});

it.each([["/", true], ["/sobre", true], ["/admin", false], ["/proposta/example", false]])("limits custom cursor eligibility on %s", (route, visible) => {
  media(true);
  render(<MemoryRouter initialEntries={[route as string]}><Layout><main>Conteúdo</main></Layout></MemoryRouter>);
  expect(!!document.querySelector(".orion-cursor")).toBe(visible);
});
