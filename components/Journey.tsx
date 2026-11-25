"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { chapters, plan, scenes } from "@/content/data";
import { announceChapter, useSite } from "@/lib/providers";

const N = scenes.length;
/** frames per scene in public/seq/<key>/000.webp ... 120.webp (every frame of the 5 s clip) */
const FRAMES = 121;
/** scroll length of one scene, in % of the screen height */
const SCENE_SCROLL = 260;
const floorLabel = (f: number) => (f === 0 ? "G" : String(f).padStart(2, "0"));
const frameUrl = (key: string, i: number) => `/seq/${key}/${String(i).padStart(3, "0")}.webp`;
/** phones load the half-size frames (public/seq-m, 640 x 352): about a third of the data */
const loadUrl = (key: string, i: number) =>
  window.innerWidth < 768 ? `/seq-m/${key}/${String(i).padStart(3, "0")}.webp` : frameUrl(key, i);

/**
 * The tour is a lift ride. One pinned screen: scrolling moves through each scene frame by frame
 * (an image sequence drawn on a canvas). Between scenes, outside shots arrive behind sliding lift doors
 * (the floor counter runs while they are shut) and rooms open out of a doorway.
 */
export default function Journey() {
  const section = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const frames = useRef<(HTMLImageElement[] | null)[]>(Array(N).fill(null));
  /** scroll position inside each scene, 0 to 1 */
  const local = useRef<number[]>(Array(N).fill(0));
  /** the position actually drawn: eases toward `local` so frames glide instead of jumping */
  const smooth = useRef<number[]>(Array(N).fill(0));
  const drawn = useRef<number[]>(Array(N).fill(-1));
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const doorFloor = useRef<HTMLParagraphElement>(null);

  const shownRef = useRef(0);
  const targetRef = useRef(0);
  const busy = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const [shown, setShown] = useState(0);
  const [floor, setFloor] = useState(scenes[0].floor);
  const [dir, setDir] = useState<"up" | "down" | "">("");
  const [reduced, setReduced] = useState(false);
  const { scrollTo } = useSite();

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  /** draw scene i at its current scroll position (nearest loaded frame), cover-fit */
  const draw = useCallback((i: number, force = false) => {
    const c = canvases.current[i];
    const imgs = frames.current[i];
    if (!c || !imgs) return;
    const want = Math.round(smooth.current[i] * (FRAMES - 1));
    let f = want;
    while (f > 0 && !(imgs[f].complete && imgs[f].naturalWidth)) f--;
    const img = imgs[f];
    if (!img.complete || !img.naturalWidth) return;
    if (!force && drawn.current[i] === f) return;
    drawn.current[i] = f;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // tall screens (phones): show the whole wide frame across the width, over a dimmed fill of the same frame
    if (c.width / c.height < 1.2) {
      ctx.fillStyle = "#0D1012";
      ctx.fillRect(0, 0, c.width, c.height);
      const sc = Math.max(c.width / iw, c.height / ih);
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, (c.width - iw * sc) / 2, (c.height - ih * sc) / 2, iw * sc, ih * sc);
      ctx.globalAlpha = 1;
      const w = c.width;
      const h = (w * ih) / iw;
      ctx.drawImage(img, 0, Math.max(c.height * 0.4 - h / 2, c.height * 0.14), w, h);
      return;
    }
    const s = Math.max(c.width / iw, c.height / ih);
    const w = iw * s;
    const h = ih * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }, []);

  /** fetch a scene's frames: first, last and middle frames first so scrubbing has something to show early */
  const load = useCallback(
    (i: number) => {
      if (i < 0 || i >= N || frames.current[i]) return;
      const key = scenes[i].key;
      const imgs = Array.from({ length: FRAMES }, () => new Image());
      frames.current[i] = imgs;
      const order = [0, FRAMES - 1, 60, 30, 90, 15, 45, 75, 105, ...Array.from({ length: FRAMES }, (_, k) => k)];
      const seen = new Set<number>();
      order.forEach((k) => {
        if (seen.has(k)) return;
        seen.add(k);
        imgs[k].decoding = "async";
        imgs[k].onload = () => {
          if (Math.round(smooth.current[i] * (FRAMES - 1)) >= k) draw(i, true);
        };
        imgs[k].src = loadUrl(key, k);
      });
    },
    [draw],
  );

  /** canvases follow the screen size (capped pixel ratio keeps it light) */
  useEffect(() => {
    if (reduced) return;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvases.current.forEach((c, i) => {
        if (!c) return;
        c.width = Math.round(c.clientWidth * dpr);
        c.height = Math.round(c.clientHeight * dpr);
        draw(i, true);
      });
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [reduced, draw]);

  /** show one layer flat on screen, all others hidden */
  const settle = (i: number) => {
    layers.current.forEach((l, j) => {
      if (l) gsap.set(l, { zIndex: j === i ? 2 : 0, autoAlpha: j === i ? 1 : 0, clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
    });
  };

  /** play the transition from what is on screen to the scene the scroll asks for */
  const run = useCallback(() => {
    if (busy.current) return;
    const from = shownRef.current;
    const to = targetRef.current;
    if (from === to) return;
    busy.current = true;
    [to, to + 1, to - 1].forEach(load);

    const a = scenes[from];
    const b = scenes[to];
    const swap = () => {
      shownRef.current = to;
      smooth.current[to] = local.current[to];
      setShown(to);
      draw(to, true);
    };
    const t = gsap.timeline({
      onComplete: () => {
        busy.current = false;
        tl.current = null;
        run(); // the reader may have scrolled on while this played
      },
    });
    tl.current = t;

    if (a.zone === "room" && b.zone === "room") {
      // step through a doorway: the next room grows out of a tall door shape
      const L = layers.current[to];
      t.add(() => {
        gsap.set(L, { zIndex: 3, autoAlpha: 1, clipPath: "inset(16% 41% 0% 41%)", scale: 1.14 });
        swap();
      });
      t.to(L, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.9, ease: "expo.inOut" });
      t.add(() => settle(to));
    } else {
      // lift doors: close, ride if the floor changes, open on the new scene
      const ride = a.floor !== b.floor;
      t.to([doorL.current, doorR.current], { xPercent: 0, duration: 0.45, ease: "power3.inOut" });
      t.to(doorFloor.current, { autoAlpha: 1, duration: 0.2 }, "-=0.15");
      if (ride) {
        const counter = { v: a.floor };
        setDir(b.floor > a.floor ? "up" : "down");
        t.to(counter, {
          v: b.floor,
          duration: 1.0,
          ease: "power1.inOut",
          onUpdate: () => {
            const f = Math.round(counter.v);
            setFloor(f);
            if (doorFloor.current) doorFloor.current.textContent = floorLabel(f);
          },
        });
        t.add(() => setDir(""));
      } else {
        t.add(() => setFloor(b.floor));
        t.to({}, { duration: 0.1 });
      }
      t.add(() => {
        settle(to);
        swap();
      });
      t.to(doorFloor.current, { autoAlpha: 0, duration: 0.2 });
      t.to(doorL.current, { xPercent: -101, duration: 0.65, ease: "power3.inOut" }, "<");
      t.to(doorR.current, { xPercent: 101, duration: 0.65, ease: "power3.inOut" }, "<");
    }
  }, [draw, load]);

  // first scene ready, doors parked open
  useEffect(() => {
    if (reduced) return;
    load(0);
    load(1);
    settle(0);
    gsap.set(doorL.current, { xPercent: -101 });
    gsap.set(doorR.current, { xPercent: 101 });
    gsap.set(doorFloor.current, { autoAlpha: 0 });
  }, [reduced, load]);

  // every frame, ease the drawn position of the scene on screen toward the scroll position
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const s = shownRef.current;
      const d = local.current[s] - smooth.current[s];
      if (Math.abs(d) > 0.0005) {
        smooth.current[s] += d * 0.14;
        draw(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, draw]);

  // pin the stage; scroll picks the scene and scrubs its frames
  useEffect(() => {
    if (reduced || !section.current) return;
    const ctx = gsap.context(() => {
      trigger.current = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: () => `+=${N * SCENE_SCROLL}%`,
        pin: true,
        onUpdate: (self) => {
          const raw = Math.min(N - 1e-4, self.progress * N);
          const i = Math.floor(raw);
          local.current[i] = raw - i;
          // scenes before the current one rest on their last frame, later ones on their first
          for (let k = 0; k < N; k++) if (k !== i) local.current[k] = k < i ? 1 : 0;
          if (i !== targetRef.current) {
            targetRef.current = i;
            run();
          }
        },
        onToggle: (self) => announceChapter(self.isActive ? scenes[targetRef.current].chapter : ""),
      });
    }, section);
    return () => {
      tl.current?.kill();
      ctx.revert();
      trigger.current = null;
    };
  }, [reduced, run, draw]);

  useEffect(() => {
    if (trigger.current?.isActive) announceChapter(scenes[shown].chapter);
  }, [shown]);

  const jump = useCallback(
    (i: number) => {
      const t = trigger.current;
      if (t) scrollTo(t.start + (t.end - t.start) * ((i + 0.08) / N));
      else scrollTo(`#scene-${scenes[i].key}`);
    },
    [scrollTo],
  );

  useEffect(() => {
    const on = (e: Event) => jump((e as CustomEvent<number>).detail);
    window.addEventListener("alta:jump", on);
    return () => window.removeEventListener("alta:jump", on);
  }, [jump]);

  // reduced motion: no pinning, every scene as a still with its text
  if (reduced) {
    return (
      <section aria-label="The tour" className="mx-auto max-w-page space-y-16 px-4 py-24 md:px-8">
        {scenes.map((s) => (
          <figure key={s.key} id={`scene-${s.key}`} className="grid gap-6 md:grid-cols-12 md:items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/img/${s.key}.webp`} alt={s.alt} width={1280} height={720} loading="lazy" className="w-full md:col-span-8" />
            <figcaption className="md:col-span-4">
              <p className="font-mono text-sm text-jade">Floor {floorLabel(s.floor)}</p>
              <h2 className="display mt-2 text-3xl">{s.title}</h2>
              <p className="mt-3 text-mist">{s.line}</p>
            </figcaption>
          </figure>
        ))}
      </section>
    );
  }

  const scene = scenes[shown];
  const chapterLabel = chapters.find((c) => c.id === scene.chapter)?.label ?? "";
  const words = scene.title.split(" ");

  return (
    <section ref={section} id="tour" aria-label="The tour" className="relative h-[100dvh] overflow-hidden bg-ink">
      {scenes.map((s, i) => (
        <div
          key={s.key}
          ref={(el) => void (layers.current[i] = el)}
          className="invisible absolute inset-0 bg-contain bg-[center_40%] bg-no-repeat opacity-0 will-change-transform md:bg-cover md:bg-center"
          style={{ backgroundImage: `url(${frameUrl(s.key, 0)})` }}
        >
          <canvas ref={(el) => void (canvases.current[i] = el)} className="h-full w-full" role="img" aria-label={s.alt} aria-hidden={i !== shown} />
        </div>
      ))}
      <div className="scrim-bottom pointer-events-none absolute inset-0 z-[4]" aria-hidden="true" />

      {/* lift doors */}
      <div ref={doorL} className="lift-door absolute inset-y-0 left-0 z-[6] w-1/2 border-r border-black/50" aria-hidden="true" />
      <div ref={doorR} className="lift-door absolute inset-y-0 right-0 z-[6] w-1/2 border-l border-white/10" aria-hidden="true" />
      <p ref={doorFloor} className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center font-mono text-[22vw] font-medium tabular-nums text-jade/90 md:text-[14vw]" aria-hidden="true">
        {floorLabel(scene.floor)}
      </p>

      {/* lift display */}
      <div className="absolute left-4 top-24 z-[8] flex items-center gap-3 border border-line bg-ink/80 px-4 py-3 md:left-8">
        <span className="flex flex-col text-mist" aria-hidden="true">
          <CaretUp size={14} weight="fill" className={dir === "up" ? "text-jade" : ""} />
          <CaretDown size={14} weight="fill" className={dir === "down" ? "text-jade" : ""} />
        </span>
        <span className="font-mono text-4xl tabular-nums leading-none text-bone md:text-5xl" aria-label={`Floor ${floorLabel(floor)}`}>
          {floorLabel(floor)}
        </span>
        <span className="hidden font-mono text-xs leading-tight text-mist sm:block">
          Tower A
          <br />
          {chapterLabel}
        </span>
      </div>

      {/* room name, large and quiet */}
      {scene.zone === "room" && (
        <p key={`o-${scene.key}`} className="outline-text rise pointer-events-none absolute right-4 top-24 z-[5] hidden text-right text-[9vw] leading-none md:block md:right-8" aria-hidden="true">
          {scene.name}
        </p>
      )}

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 z-[8]">
        <div className="mx-auto flex max-w-page items-end justify-between gap-8 px-4 pb-10 pr-20 md:px-8 md:pb-14 lg:pr-28">
          <div key={scene.key} aria-live="polite" className="max-w-[34rem] lg:max-w-[40rem]">
            <p className="rise font-mono text-sm text-jade">
              {String(shown + 1).padStart(2, "0")} <span className="text-mist">of {N}</span>
            </p>
            <h2 className="display mt-3 text-[clamp(1.9rem,4.4vw,3.6rem)]">
              {words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="word-rise inline-block" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
                    {w}&nbsp;
                  </span>
                </span>
              ))}
            </h2>
            <p className="rise-2 mt-3 text-lg text-bone/90" style={{ animationDelay: "0.55s" }}>
              {scene.line}
            </p>
          </div>

          {/* floor plan: where you are in the flat */}
          {scene.zone === "room" && (
            <figure className="rise hidden shrink-0 border border-line bg-ink/80 p-3 lg:block">
              <svg viewBox="-2 -2 204 144" className="h-[132px] w-[190px]" role="img" aria-label={`Floor plan, ${scene.name} highlighted`}>
                {plan.map((r) => {
                  const on = r.id === scene.plan;
                  const idx = scenes.findIndex((s) => s.plan === r.id);
                  return (
                    <g key={r.id} className="cursor-pointer" onClick={() => idx >= 0 && jump(idx)}>
                      <rect x={r.x} y={r.y} width={r.w} height={r.h} className={`transition-colors duration-500 ${on ? "fill-jade/30 stroke-jade" : "fill-transparent stroke-bone/40 hover:fill-bone/10"}`} strokeWidth={on ? 1.6 : 0.8} />
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle" className={`font-mono text-[8px] ${on ? "fill-bone" : "fill-mist"}`}>
                        {r.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <figcaption className="mt-1 font-mono text-[11px] text-mist">Sample layout, 3 bedroom</figcaption>
            </figure>
          )}
        </div>
      </div>

      {/* progress */}
      <div className="absolute inset-x-4 top-[4.6rem] z-[8] flex gap-1 md:inset-x-8" aria-hidden="true">
        {scenes.map((s, i) => (
          <span key={s.key} className={`h-0.5 flex-1 transition-colors duration-500 ${i <= shown ? "bg-jade" : "bg-bone/25"}`} />
        ))}
      </div>
    </section>
  );
}
