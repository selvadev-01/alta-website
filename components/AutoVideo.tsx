"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** scene key: plays /video/<name>.mp4 over the poster /img/<name>.webp */
  name: string;
  alt: string;
  className?: string;
  /** load straight away (hero); otherwise the file is fetched when the tile gets near the viewport */
  priority?: boolean;
};

/** A silent looping clip that only loads near the viewport and only plays while visible. */
export default function AutoVideo({ name, alt, className = "", priority = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(priority);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // reduced motion: keep the poster, never play
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setVisible(e.isIntersecting && e.intersectionRatio > 0.2);
      },
      { rootMargin: "300px 0px", threshold: [0, 0.2, 0.6] },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible, near]);

  return (
    <video
      ref={ref}
      className={`h-full w-full object-cover ${className}`}
      src={near ? `/video/${name}.mp4` : undefined}
      poster={`/img/${name}.webp`}
      muted
      loop
      playsInline
      preload={priority ? "auto" : "none"}
      aria-label={alt}
    />
  );
}
