"use client";

import { ArrowRight, Check } from "@phosphor-icons/react";
import { facts, homes } from "@/content/data";
import { useSite } from "@/lib/providers";

export default function Homes() {
  const { home, setHome, scrollTo } = useSite();
  const current = homes.find((h) => h.id === home) ?? homes[1];

  return (
    <section id="homes" aria-labelledby="homes-title" className="border-y border-line bg-slate">
      <div className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-32">
        <h2 id="homes-title" className="display max-w-[16ch] text-[clamp(2rem,5vw,4rem)]">
          Three sizes of home.
        </h2>

        <dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-line pt-8 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="block font-mono text-4xl tabular-nums text-bone md:text-5xl">{f.value}</span>
                <span className="text-mist">{f.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4" role="group" aria-label="Choose a home size">
            {homes.map((h) => {
              const on = h.id === current.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHome(h.id)}
                  aria-pressed={on}
                  className={`flex w-full items-baseline justify-between gap-4 border-l-2 py-5 pl-5 pr-2 text-left transition-colors ${on ? "border-jade bg-ink" : "border-line hover:border-mist"}`}
                >
                  <span className={`display text-2xl md:text-3xl ${on ? "text-bone" : "text-bone/70"}`}>{h.name}</span>
                  <span className="font-mono text-sm tabular-nums text-mist">{h.area}</span>
                </button>
              );
            })}
            <p className="mt-5 text-sm text-mist">Sizes are sample figures. Ask for the current price list when you visit.</p>
          </div>

          <div className="grid gap-6 lg:col-span-8 md:grid-cols-5" aria-live="polite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.image}
              src={`/img/${current.image}.webp`}
              alt={current.alt}
              width={1280}
              height={720}
              loading="lazy"
              className="rise aspect-video w-full object-cover md:col-span-3"
            />
            <div className="md:col-span-2">
              <p className="text-lg text-bone">{current.line}</p>
              <ul className="mt-5 space-y-2">
                {current.rooms.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-bone/85">
                    <Check size={18} weight="bold" className="mt-1 shrink-0 text-jade" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => scrollTo("#visit")}
                className="mt-7 inline-flex items-center gap-2 bg-jade px-5 py-3 font-semibold text-ink transition-transform active:translate-y-px"
              >
                Book a site visit <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
