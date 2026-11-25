"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { HomeId } from "@/content/data";

gsap.registerPlugin(ScrollTrigger);

type Ctx = {
  scrollTo: (target: string | number) => void;
  home: HomeId;
  setHome: (h: HomeId) => void;
  sound: boolean;
  setSound: (s: boolean) => void;
};

const SiteContext = createContext<Ctx | null>(null);

export const useSite = () => {
  const c = useContext(SiteContext);
  if (!c) throw new Error("useSite must be used inside <Providers>");
  return c;
};

/** the nav asks the pinned film to jump to a scene; the film listens */
export const jumpToScene = (index: number) => window.dispatchEvent(new CustomEvent("alta:jump", { detail: index }));
/** the film tells the nav which chapter is on screen ("" when the film is not pinned) */
export const announceChapter = (id: string) => window.dispatchEvent(new CustomEvent("alta:chapter", { detail: id }));

export function Providers({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [home, setHome] = useState<HomeId>("three");
  const [sound, setSound] = useState(false);

  // always open at the hero: stop the browser restoring an old scroll position
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  // Lenis <-> ScrollTrigger (skipped for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // re-measure triggers whenever the document height changes (fonts, images)
  useEffect(() => {
    let last = document.documentElement.scrollHeight;
    let t = 0;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 200);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const scrollTo = useCallback((target: string | number) => {
    const l = lenisRef.current;
    if (typeof target === "number") {
      if (l) l.scrollTo(target, { duration: 1.2 });
      else window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) return;
    if (l) l.scrollTo(el, { duration: 1.2, offset: -64 });
    else el.scrollIntoView();
  }, []);

  return <SiteContext.Provider value={{ scrollTo, home, setHome, sound, setSound }}>{children}</SiteContext.Provider>;
}
