"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowDown } from "@phosphor-icons/react";
import AutoVideo from "@/components/AutoVideo";
import Magnetic from "@/components/Magnetic";
import { jumpToScene, useSite } from "@/lib/providers";

const HEADLINE = "Come home above the city.".split(" ");

/**
 * The hero is a window in the shape of the name: the tower film plays inside the letters ALTA.
 * Scrolling flies the camera through the letter L until the film fills the screen, then the headline rises.
 */
export default function Hero() {
  const { scrollTo } = useSite();
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const tagline = useRef<HTMLParagraphElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const word = useRef<SVGTextElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    if (reduced || !section.current) return;
    let removeMove: (() => void) | undefined;
    const ctx = gsap.context(() => {
      // the window opens on load: the letters fade in and close up from wide spacing
      gsap.fromTo(
        word.current,
        { attr: { "fill-opacity": 0 }, letterSpacing: "0.12em" },
        { attr: { "fill-opacity": 1 }, letterSpacing: "0.01em", duration: 1.6, ease: "expo.out", delay: 0.15, onComplete: () => aim() },
      );
      gsap.from(".hero-tag", { autoAlpha: 0, y: 16, duration: 0.9, ease: "power3.out", delay: 0.75 });

      // fly through the stem of the L (the second letter): aim the scale at it
      // (the letters are scaled inside the SVG mask, so the browser redraws them sharp each frame)
      function aim() {
        const t = word.current;
        if (!t) return;
        try {
          const e = t.getExtentOfChar(1);
          gsap.set(t, { svgOrigin: `${e.x + e.width * 0.22} ${e.y + e.height * 0.5}` });
        } catch {
          gsap.set(t, { svgOrigin: `${window.innerWidth * 0.42} ${window.innerHeight * 0.5}` });
        }
      }
      aim();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onRefresh: aim,
        },
      });
      tl.to(tagline.current, { autoAlpha: 0, y: -24, duration: 0.15 }, 0)
        .to(cue.current, { autoAlpha: 0, duration: 0.08 }, 0)
        .to(word.current, { scale: 16, ease: "power3.in", duration: 0.7 }, 0)
        .to(mask.current, { autoAlpha: 0, duration: 0.12 }, 0.58)
        .fromTo(media.current, { scale: 1.08 }, { scale: 1, duration: 0.75, ease: "power2.out" }, 0)
        .to(scrim.current, { autoAlpha: 1, duration: 0.2 }, 0.7)
        .fromTo(".hero-word", { yPercent: 115 }, { yPercent: 0, stagger: 0.035, duration: 0.18, ease: "power3.out" }, 0.74)
        .fromTo(".hero-after", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.14, ease: "power3.out" }, 0.86);

      // the film drifts a little with the mouse, for depth
      if (window.matchMedia("(hover: hover)").matches) {
        const x = gsap.quickTo(media.current, "x", { duration: 1.2, ease: "power3.out" });
        const y = gsap.quickTo(media.current, "y", { duration: 1.2, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          x((e.clientX / window.innerWidth - 0.5) * -26);
          y((e.clientY / window.innerHeight - 0.5) * -16);
        };
        window.addEventListener("pointermove", move);
        removeMove = () => window.removeEventListener("pointermove", move);
      }
    }, section);
    return () => {
      removeMove?.();
      ctx.revert();
    };
  }, [reduced]);

  const ctas = (
    <div className="hero-after mt-8 flex flex-wrap gap-3">
      <Magnetic>
        <button type="button" onClick={() => scrollTo("#visit")} className="bg-jade px-6 py-3.5 font-semibold text-ink transition-transform active:translate-y-px">
          Book a site visit
        </button>
      </Magnetic>
      <Magnetic>
        <button
          type="button"
          onClick={() => jumpToScene(0)}
          className="inline-flex items-center gap-2 border border-bone/60 bg-ink/40 px-6 py-3.5 font-semibold text-bone transition-colors hover:border-bone"
        >
          Take the tour <ArrowDown size={18} weight="bold" aria-hidden="true" />
        </button>
      </Magnetic>
    </div>
  );

  // reduced motion: the film behind a plain headline
  if (reduced) {
    return (
      <section aria-label="ALTA" className="relative min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <AutoVideo name="aerial" alt="Aerial view of two residential towers with a swimming pool and gardens" priority />
        </div>
        <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-page flex-col justify-end px-4 pb-16 pt-24 md:px-8">
          <h1 className="display max-w-[14ch] text-[clamp(2.6rem,7vw,5.6rem)]">Come home above the city.</h1>
          <p className="mt-5 max-w-[46ch] text-lg text-bone/90">Walk through a home on screen, from the gate to the balcony. Then come and see it for real.</p>
          {ctas}
        </div>
      </section>
    );
  }

  return (
    <section ref={section} aria-label="ALTA" className="relative h-[260vh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-ink">
        <div ref={media} className="absolute -inset-[2%] will-change-transform">
          {/* phones: the whole wide film sits across the screen, over a soft, dimmed copy of its first frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/aerial.webp" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl md:hidden" />
          <div className="absolute inset-0">
            <AutoVideo name="aerial" alt="Aerial view of two residential towers with a swimming pool and gardens" priority className="max-md:object-contain max-md:object-[center_42%]" />
          </div>
        </div>

        {/* the window: an ink sheet with ALTA cut out of it (an SVG mask, no blending), so the GPU can scale it cheaply */}
        <div ref={mask} aria-hidden="true" className="absolute inset-0">
          <svg className="h-full w-full">
            <defs>
              <mask id="alta-window" maskUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="white" />
                <text
                  ref={word}
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "30vw", letterSpacing: "0.01em" }}
                >
                  ALTA
                </text>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="#0D1012" fillOpacity="0.93" mask="url(#alta-window)" />
          </svg>
        </div>

        <p ref={tagline} className="absolute inset-x-0 bottom-[17vh] px-4 text-center font-mono text-sm text-mist md:text-base">
          <span className="hero-tag inline-block">Two towers above the city. Homes from 2 to 4 bedrooms.</span>
        </p>

        {/* scroll reminder: a line that keeps running down, gone as soon as the reader scrolls */}
        <div ref={cue} className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-mist" aria-hidden="true">
          <span className="hero-tag font-mono text-xs uppercase tracking-[0.3em]">Scroll</span>
          <span className="relative h-12 w-px overflow-hidden bg-bone/20">
            <span className="scroll-line absolute inset-x-0 top-0 h-1/2 bg-jade" />
          </span>
        </div>

        <div ref={scrim} className="scrim-bottom invisible absolute inset-0 opacity-0" aria-hidden="true" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-page px-4 pb-14 md:px-8 md:pb-20">
            <h1 className="display max-w-[14ch] text-[clamp(2.6rem,7vw,5.6rem)]">
              {HEADLINE.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="hero-word inline-block">{w}&nbsp;</span>
                </span>
              ))}
            </h1>
            <p className="hero-after mt-5 max-w-[46ch] text-lg text-bone/90">
              Walk through a home on screen, from the gate to the balcony. Then come and see it for real.
            </p>
            {ctas}
          </div>
        </div>
      </div>
    </section>
  );
}
