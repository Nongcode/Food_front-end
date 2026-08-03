"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CustomSelect } from "./CustomSelect";
import { HeroMediaCarousel, type HeroMediaItem } from "./HeroMediaCarousel";
import { SiteHeader } from "./SiteHeader";

type SelectOption = {
  value: string;
  label: string;
};

type HomeHeroProps = {
  slides: HeroMediaItem[];
  eyebrow: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  searchAction: string;
  productLabel: string;
  productPlaceholder: string;
  styleLabel: string;
  stylePlaceholder: string;
  styleOptions: SelectOption[];
  timeLabel: string;
  submitLabel: string;
};

const HERO_INTERVAL_MS = 7200;

export function HomeHero({
  slides,
  eyebrow,
  fallbackTitle,
  fallbackSubtitle,
  primaryLabel,
  secondaryLabel,
  secondaryHref,
  searchAction,
  productLabel,
  productPlaceholder,
  styleLabel,
  stylePlaceholder,
  styleOptions,
  timeLabel,
  submitLabel,
}: HomeHeroProps) {
  const displaySlides = useMemo(() => slides.filter((slide) => slide.src), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (displaySlides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displaySlides.length);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [displaySlides.length]);

  const safeActiveIndex = displaySlides.length ? activeIndex % displaySlides.length : 0;
  const activeSlide = displaySlides[safeActiveIndex];
  const title = activeSlide?.title || fallbackTitle;
  const subtitle = activeSlide?.subtitle || fallbackSubtitle;

  return (
    <section className="hero-section">
      <HeroMediaCarousel items={displaySlides} activeIndex={safeActiveIndex} intervalMs={HERO_INTERVAL_MS} />
      <div className="hero-overlay" />
      <SiteHeader variant="hero" />

      <div className="hero-content" id="top">
        <p className="eyebrow">{eyebrow}</p>
        <div className="hero-text-cycle" key={`${safeActiveIndex}-${title}`}>
          <h1>{title}</h1>
          <p className="hero-copy">{subtitle}</p>
        </div>

        {displaySlides.length > 1 ? (
          <div className="hero-slide-dots" aria-label="Banner đang hiển thị">
            {displaySlides.map((slide, index) => (
              <button
                suppressHydrationWarning
                key={`${slide.src}-${index}`}
                type="button"
                className={index === safeActiveIndex ? "active" : ""}
                aria-label={`Xem banner ${index + 1}`}
                aria-current={index === safeActiveIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        ) : null}

        <div className="hero-actions">
          <a className="primary-action" href="#product-categories">
            {primaryLabel}
          </a>
          <Link className="secondary-action" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        </div>
        <form className="hero-search" id="trip-search" action={searchAction}>
          <label>
            {productLabel}
            <input suppressHydrationWarning name="destination" placeholder={productPlaceholder} />
          </label>
          <div className="hero-search-field">
            <span className="hero-search-label">{styleLabel}</span>
            <CustomSelect
              name="style"
              defaultValue=""
              placeholder={stylePlaceholder}
              options={styleOptions}
            />
          </div>
          <label>
            {timeLabel}
            <input suppressHydrationWarning name="date" type="month" />
          </label>
          <button suppressHydrationWarning type="submit">{submitLabel}</button>
        </form>
      </div>
    </section>
  );
}
