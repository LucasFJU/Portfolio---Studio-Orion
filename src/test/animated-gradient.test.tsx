import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AnimatedGradient from "@/components/ui/animated-gradient";

let reducedMotion = false;
vi.mock("framer-motion", async (original) => ({
  ...await original<typeof import("framer-motion")>(), useReducedMotion: () => reducedMotion,
}));
const config = { preset: "custom", color1: "#090A0C", color2: "#FF4001", color3: "#F0EEE8" } as const;
let intersect: IntersectionObserverCallback;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
const draw = vi.fn();
const dispose = vi.fn();

beforeEach(() => {
  reducedMotion = false;
  frameId = 0;
  frames = new Map();
  draw.mockClear(); dispose.mockClear();
  const gl = new Proxy({}, { get: (_target, property) => {
    if (property === "getProgramParameter") return () => true;
    if (property === "isContextLost") return () => false;
    if (property === "drawArrays") return draw;
    if (String(property).startsWith("delete")) return dispose;
    return () => ({});
  } });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(gl as WebGL2RenderingContext);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function frame(time: number) {
  const [id, callback] = [...frames.entries()][0];
  frames.delete(id);
  act(() => callback(time));
}

it("loops while visible, pauses offscreen and releases GPU resources on unmount", () => {
  const { unmount } = render(<AnimatedGradient config={config} />);
  frame(100); frame(116);
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(1);
  act(() => intersect([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(frames.size).toBe(0);
  act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  frame(500);
  expect(draw).toHaveBeenCalledTimes(3);
  unmount();
  expect(frames.size).toBe(0);
  expect(dispose).toHaveBeenCalledTimes(4);
});

it("renders a decorative static frame with reduced motion and resumes if the preference changes", () => {
  reducedMotion = true;
  const { container, rerender } = render(<AnimatedGradient config={config} />);
  expect(draw).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(0);
  expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  expect(container.firstChild).toHaveAttribute("data-motion", "static");
  reducedMotion = false;
  rerender(<AnimatedGradient config={config} />);
  frame(100);
  expect(draw).toHaveBeenCalledTimes(2);
  expect(frames.size).toBe(1);
});
