import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useRouteReveals } from "@/hooks/use-route-reveals";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Harness({ route, loaded = true }: { route: string; loaded?: boolean }) {
  useRouteReveals(route);
  return <div className="orion-route-content">{loaded && <><h1>Título</h1><p data-orion-reveal>Introdução</p><form><input aria-label="Nome" /></form><table><tbody><tr><td>Linha</td></tr></tbody></table></>}</div>;
}
function setup(reduced = false) {
  let callback: IntersectionObserverCallback = () => {};
  const observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
  vi.stubGlobal("IntersectionObserver", vi.fn(function (cb: IntersectionObserverCallback) { callback = cb; return observer; }));
  return { observer, enter: (target: Element) => act(() => callback([{ target, isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)) };
}
it("reveals async route content once and leaves forms and table rows stable", async () => {
  const { observer, enter } = setup();
  const { container, rerender, unmount } = render(<Harness route="/sobre" loaded={false} />);
  rerender(<Harness route="/sobre" />);
  await waitFor(() => expect(observer.observe).toHaveBeenCalledTimes(2));
  const title = container.querySelector("h1")!;
  enter(title);
  expect(title).toHaveClass("orion-reveal-visible");
  expect(observer.unobserve).toHaveBeenCalledWith(title);
  expect(container.querySelector("input")).not.toHaveClass("orion-reveal-ready");
  expect(container.querySelector("tr")).not.toHaveClass("orion-reveal-ready");
  unmount();
  expect(observer.disconnect).toHaveBeenCalled();
  expect(title).not.toHaveClass("orion-reveal-ready");
});
it("limits admin motion to headings and summary blocks", () => {
  const { observer } = setup();
  render(<Harness route="/admin" />);
  expect(observer.observe).toHaveBeenCalledTimes(1);
});
it.each(["/", "/sobre"])("keeps %s static when motion is reduced", (route) => {
  const { observer } = setup(true);
  const { container } = render(<Harness route={route} />);
  expect(observer.observe).not.toHaveBeenCalled();
  expect(container.querySelector(".orion-reveal-ready")).toBeNull();
});
