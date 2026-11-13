"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type HeroMediaItem = {
  src: string;
  mediaType: "image" | "video";
  title?: string | null;
};

type HeroMediaCarouselProps = {
  items: HeroMediaItem[];
};

export function HeroMediaCarousel({ items }: HeroMediaCarouselProps) {
  const slides = useMemo(() => items.filter((item) => item.src), [items]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const safeActiveIndex = activeIndex % slides.length;

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