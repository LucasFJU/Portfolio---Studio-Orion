import { useEffect } from "react";

/** Observe headings only; editable content and sticky ancestors never move. */
export function useRouteReveals(pathname: string) {
  useEffect(() => {
    if (pathname === "/" || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".orion-route-content");
    if (!root) return;
    const observed = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("orion-reveal-visible");
        observer.unobserve(target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    const scan = () => {
      const selector = pathname.startsWith("/admin") ? "h1, [data-orion-summary]" : "h1, [data-orion-reveal]";
      root.querySelectorAll(selector).forEach((element) => {
        if (observed.has(element)) return;
        if (element.closest("[data-orion-static]")) return;
        if (element.tagName === "H1" && element.parentElement?.closest("[data-orion-reveal]")) return;
        observed.add(element);
        element.classList.add("orion-reveal-ready");
        observer.observe(element);
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); mutations.disconnect();
      observed.forEach((element) => element.classList.remove("orion-reveal-ready", "orion-reveal-visible"));
    };
  }, [pathname]);
}
