import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const PROJECTS_SCROLL_KEY = "le_projects_scroll_y";
export const PROJECTS_SCROLL_STORAGE_KEY = PROJECTS_SCROLL_KEY;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // When returning to /projetos, allow Projects page to restore its saved scroll position
    if (pathname === "/projetos") {
      const savedScroll = sessionStorage.getItem(PROJECTS_SCROLL_KEY);
      if (savedScroll && navType === "POP") {
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;