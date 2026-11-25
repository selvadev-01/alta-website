"use client";

import { useEffect, useState } from "react";
import { chapters, firstSceneOf, type ChapterId } from "@/content/data";
import { jumpToScene, useSite } from "@/lib/providers";

export default function Nav() {
  const { scrollTo } = useSite();
  const [chapter, setChapter] = useState("");

  useEffect(() => {
    const on = (e: Event) => setChapter((e as CustomEvent<string>).detail);
    window.addEventListener("alta:chapter", on);
    return () => window.removeEventListener("alta:chapter", on);
  }, []);

  const link = "px-3 py-2 text-[15px] text-mist transition-colors hover:text-bone";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-ink/90">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 md:px-8">
        <button type="button" onClick={() => scrollTo(0)} className="display text-2xl text-bone" aria-label="ALTA, back to top">
          ALTA
        </button>

        <nav aria-label="Sections" className="hidden items-center lg:flex">
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpToScene(firstSceneOf(c.id as ChapterId))}
              aria-current={chapter === c.id ? "true" : undefined}
              className={`${link} ${chapter === c.id ? "!text-jade" : ""}`}
            >
              {c.label}
            </button>
          ))}
          <button type="button" onClick={() => scrollTo("#amenities")} className={link}>
            Amenities
          </button>
          <button type="button" onClick={() => scrollTo("#homes")} className={link}>
            Homes
          </button>
        </nav>

        <button
          type="button"
          onClick={() => scrollTo("#visit")}
          className="bg-jade px-4 py-2.5 text-[15px] font-semibold text-ink transition-transform active:translate-y-px"
        >
          Book a site visit
        </button>
      </div>
    </header>
  );
}
