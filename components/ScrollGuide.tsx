"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { scenes } from "@/content/data";
import { useSite } from "@/lib/providers";

const R = 21;
const CIRC = 2 * Math.PI * R;

/** every place the up / down buttons stop: section tops, and each scene inside the pinned tour */
function stops(): number[] {
  const y = (el: Element | null) => (el ? el.getBoundingClientRect().top + window.scrollY : null);
  const list: (number | null)[] = [0];
  const tour = document.getElementById("tour");
  const spacer = tour?.parentElement;
  if (spacer && spacer.classList.contains("pin-spacer")) {
    const top = y(spacer)!;
    const span = (spacer.offsetHeight - window.innerHeight) / scenes.length;
    scenes.forEach((_, i) => list.push(top + span * i + span * 0.08));
  } else list.push(y(tour));
  ["#amenities", "#homes", "#visit"].forEach((id) => list.push(y(document.querySelector(id))));
  list.push(document.documentElement.scrollHeight - window.innerHeight);
  return (list.filter((v) => v !== null) as number[]).sort((a, b) => a - b);
}

/**
 * A small guide fixed to the corner of every screen: a ring that fills as you go down the page,
 * up / down buttons that jump to the previous or next section or tour scene,
 * and a "Scroll" hint that appears when the reader pauses.
 */
export default function ScrollGuide() {
  const { scrollTo } = useSite();
  const ring = useRef<SVGCircleElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [idle, setIdle] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const arm = () => {
      window.clearTimeout(timer.current);
      setIdle(false);
      timer.current = window.setTimeout(() => setIdle(true), 2600);
    };
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (ring.current) ring.current.style.strokeDashoffset = String(CIRC * (1 - self.progress));
        setAtTop(self.progress < 0.002);
        setAtEnd(self.progress > 0.998);
        arm();
      },
    });
    arm();
    return () => {
      st.kill();
      window.clearTimeout(timer.current);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const now = window.scrollY;
    const all = stops();
    const target = dir === 1 ? all.find((v) => v > now + 12) : [...all].reverse().find((v) => v < now - 12);
    if (target !== undefined) scrollTo(target);
  };

  const btn =
    "grid h-11 w-11 place-items-center text-bone transition-colors hover:bg-bone/10 focus-visible:bg-bone/10 disabled:cursor-default disabled:text-bone/25 disabled:hover:bg-transparent";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-end gap-3 md:bottom-6 md:right-6">
      {/* the hint when the reader pauses */}
      <p
        aria-hidden="true"
        className={`mb-3 hidden font-mono text-xs uppercase tracking-[0.25em] text-bone transition-all duration-500 sm:block ${idle && !atEnd ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"}`}
      >
        {atTop ? "Scroll down" : "Keep scrolling"}
      </p>

      <nav aria-label="Move through the page" className="pointer-events-auto flex flex-col items-center border border-line bg-ink/85 backdrop-blur-sm">
        <button type="button" onClick={() => go(-1)} disabled={atTop} aria-label="Previous section" className={btn}>
          <ArrowUp size={18} weight="bold" aria-hidden="true" />
        </button>

        {/* progress ring */}
        <div className="relative grid h-12 w-12 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90">
            <circle cx="25" cy="25" r={R} fill="none" stroke="currentColor" strokeWidth="2" className="text-line" />
            <circle ref={ring} cx="25" cy="25" r={R} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={CIRC} strokeDashoffset={CIRC} className="text-jade" />
          </svg>
          <span className={`h-1.5 w-1.5 rounded-full bg-jade ${idle && !atEnd ? "animate-ping" : ""}`} />
        </div>

        <button type="button" onClick={() => go(1)} disabled={atEnd} aria-label="Next section" className={`${btn} ${idle && !atEnd ? "text-jade" : ""}`}>
          <ArrowDown size={18} weight="bold" aria-hidden="true" className={idle && !atEnd ? "animate-bounce" : ""} />
        </button>
      </nav>
    </div>
  );
}
