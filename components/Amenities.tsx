"use client";

import { useEffect, useRef } from "react";
import { CaretDown } from "@phosphor-icons/react";
import AutoVideo from "@/components/AutoVideo";
import { amenities } from "@/content/data";

// the pool is the tall lead tile; the gardens run the full width underneath
const SPAN = ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-12"];

export default function Amenities() {
  const list = useRef<HTMLUListElement>(null);

  // tiles rise in one after another as they enter the screen
  useEffect(() => {
    const tiles = Array.from(list.current?.querySelectorAll<HTMLElement>(".tile") ?? []);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18 },
    );
    tiles.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // tilt toward the mouse (desktop only)
  const tilt = (e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.classList.add("tilting");
    el.style.setProperty("--ry", `${px * 6}deg`);
    el.style.setProperty("--rx", `${py * -6}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLLIElement>) => {
    const el = e.currentTarget;
    el.classList.remove("tilting");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <section id="amenities" aria-labelledby="amenities-title" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-32">
      <p className="inline-flex items-center gap-3 border border-line px-4 py-2 font-mono text-sm text-mist">
        <CaretDown size={14} weight="fill" className="text-jade" aria-hidden="true" />
        <span className="text-2xl leading-none text-bone">G</span>
        Back down to the ground floor
      </p>
      <h2 id="amenities-title" className="display mt-6 max-w-[16ch] text-[clamp(2rem,5vw,4rem)]">
        Downstairs, a resort.
      </h2>
      <p className="mt-4 max-w-[52ch] text-lg text-mist">Four shared spaces for the people who live here, and nobody else.</p>

      <ul ref={list} className="mt-12 grid grid-cols-1 gap-4 lg:auto-rows-[20rem] lg:grid-cols-12">
        {amenities.map((a, i) => (
          <li
            key={a.key}
            onPointerMove={tilt}
            onPointerLeave={untilt}
            style={{ transitionDelay: `${(i % 3) * 0.12}s` }}
            className={`tile relative aspect-video overflow-hidden bg-slate lg:aspect-auto lg:h-auto ${SPAN[i]}`}
          >
            <AutoVideo name={a.key} alt={a.alt} className="transition-transform duration-[1.4s] ease-out hover:scale-[1.04]" />
            <div className="scrim-bottom pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-6">
              <h3 className="display text-2xl md:text-3xl">{a.name}</h3>
              <p className="mt-1 max-w-[38ch] text-bone/85">{a.line}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
