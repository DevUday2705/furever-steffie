import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const getScrollStorageKey = (key) => `scroll-position:${key}`;

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const rafRef = useRef(null);
  const scrollSaveRef = useRef(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // Continuously persist scroll position for the CURRENT location.
  useEffect(() => {
    const key = getScrollStorageKey(location.key);

    const onScroll = () => {
      if (scrollSaveRef.current) cancelAnimationFrame(scrollSaveRef.current);
      scrollSaveRef.current = requestAnimationFrame(() => {
        sessionStorage.setItem(key, String(window.scrollY));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollSaveRef.current) cancelAnimationFrame(scrollSaveRef.current);
    };
  }, [location.key]);

  // Restore (POP) or reset (PUSH/REPLACE) BEFORE paint.
  useLayoutEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (navigationType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setRestoring(false);
      return;
    }

    const target = Number(
      sessionStorage.getItem(getScrollStorageKey(location.key)) ?? 0
    );

    if (target === 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setRestoring(false);
      return;
    }

    const maxScrollNow =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScrollNow >= target) {
      // Content is already tall enough — scroll now, before paint. No flash.
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      setRestoring(false);
      return;
    }

    // Content isn't tall enough yet (async data still loading).
    // Hide the page briefly instead of showing a jump.
    setRestoring(true);

    let attempts = 0;
    const maxAttempts = 60; // ~1s at 60fps

    const tryScroll = () => {
      attempts += 1;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target || attempts >= maxAttempts) {
        window.scrollTo({ top: target, left: 0, behavior: "auto" });
        setRestoring(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tryScroll);
    };

    rafRef.current = requestAnimationFrame(tryScroll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [location.key, navigationType]);

  // Hide content while waiting for async layout to catch up to target scroll.
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    root.style.visibility = restoring ? "hidden" : "visible";
  }, [restoring]);

  return null;
}