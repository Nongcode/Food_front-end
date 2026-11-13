"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

export type HeroMediaItem = {
  src: string;
  mediaType: "image" | "video";
  title?: string | null;
  subtitle?: string | null;
};

type HeroMediaCarouselProps = {
  items: HeroMediaItem[];
  activeIndex?: number;
  intervalMs?: number;
};

export function HeroMediaCarousel({ items, activeIndex, intervalMs = 7200 }: HeroMediaCarouselProps) {
  const slides = useMemo(() => items.filter((item) => item.src), [items]);
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const isControlled = typeof activeIndex === "number";

  useEffect(() => {
    if (isControlled || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setInternalActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, isControlled, slides.length]);

  if (slides.length === 0) return null;

  const safeActiveIndex = (isControlled ? activeIndex : internalActiveIndex) % slides.length;

  return (
    <div className="hero-media-carousel" aria-hidden="true">
      {slides.map((item, index) => {
        const isActive = index === safeActiveIndex;
        const style = {
          "--hero-slide-direction": index % 2 === 0 ? 1 : -1,
          backgroundImage: item.mediaType === "image" ? `url(${item.src})` : undefined,
        } as CSSProperties;

        return (
          <div
            className={`hero-media-slide${isActive ? " is-active" : ""}`}
            key={`${item.src}-${index}`}
            style={style}
          >
            {item.mediaType === "video" ? (
              <video autoPlay loop muted playsInline preload={isActive ? "auto" : "metadata"} className="hero-media-video">
                <source src={item.src} />
              </video>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}