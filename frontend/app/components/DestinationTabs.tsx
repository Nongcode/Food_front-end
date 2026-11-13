"use client";

import { useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { PackageCard } from "./PackageCard";
import { ScrollProgressIndicator, useHorizontalScrollProgress } from "./ScrollProgressIndicator";

type PackageItem = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  rawDestination: string;
  duration: string;
  price: string;
  summary: string;
  image: string;
  status: string;
};

type ComboTab = {
  id: string;
  label: string;
  title: string;
  items: PackageItem[];
};

type DestinationTabsProps = {
  destinations?: string[];
  packages: PackageItem[];
  comboTabs?: ComboTab[];
};

function toTabId(value: string, index = 0) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `destination-${base || "item"}-${index}`;
}

function DestinationPackageScroller({ children, active }: { children: ReactNode; active: boolean }) {
  const { viewportRef, hasOverflow, progress } =
    useHorizontalScrollProgress<HTMLDivElement>(active);
  const dragStateRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 });
  const suppressClickRef = useRef(false);

  const scrollByCard = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstCard = viewport.querySelector<HTMLElement>(".package-card");
    const distance = firstCard ? firstCard.offsetWidth + 14 : viewport.clientWidth * 0.84;
    viewport.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hasOverflow || (event.pointerType === "mouse" && event.button !== 0)) return;

    dragStateRef.current = {
      dragging: true,
      startX: event.clientX,
      scrollLeft: viewportRef.current?.scrollLeft || 0,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;
    if (!viewport || !dragState.dragging) return;

    const distance = event.clientX - dragState.startX;
    if (Math.abs(distance) > 6) suppressClickRef.current = true;
    viewport.scrollLeft = dragState.scrollLeft - distance;
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.dragging) return;

    dragStateRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || !hasOverflow) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 0;
    const atEnd = viewport.scrollLeft >= maxScroll - 1;

    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

    event.preventDefault();
    viewport.scrollLeft += delta;
  };

  return (
    <div className="destination-scroller-shell">
      {hasOverflow ? (
        <div className="destination-scroll-actions" aria-label="Điều hướng combo">
          <button
            type="button"
            aria-label="Xem combo trước"
            title="Xem combo trước"
            onClick={() => scrollByCard(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            aria-label="Xem combo tiếp theo"
            title="Xem combo tiếp theo"
            onClick={() => scrollByCard(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      ) : null}
      <div
        className="destination-package-grid"
        ref={viewportRef}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        {children}
      </div>
      {hasOverflow ? (
        <ScrollProgressIndicator
          className="destination-scroll-indicator"
          label="Combo package position"
          progress={progress}
        />
      ) : null}
    </div>
  );
}

export function DestinationTabs({ destinations = [], packages, comboTabs = [] }: DestinationTabsProps) {
  const fallbackPackages = packages.slice(0, 3);
  const tabs = comboTabs.length > 0
    ? comboTabs.map((combo, index) => ({
      tabId: toTabId(combo.id || combo.label, index),
      label: combo.label,
      title: combo.title,
      items: combo.items.length > 0 ? combo.items : fallbackPackages,
    }))
    : destinations.map((destination, index) => {
      const matchedPackages = packages.filter((item) => item.rawDestination === destination);
      const matched = packages.find((item) => item.rawDestination === destination);
      return {
        tabId: toTabId(destination, index),
        label: matched ? matched.destination : destination,
        title: matched ? matched.destination : destination,
        items: matchedPackages.length > 0 ? matchedPackages : fallbackPackages,
      };
    });

  const [activeTab, setActiveTab] = useState(() => tabs[0]?.tabId || "");
  const tabStyles = tabs
    .map((tab) => `
        .destination-tabs:has(#${tab.tabId}:checked) .destination-tab-label[for="${tab.tabId}"] {
          background: var(--green);
          color: #fffdf7;
          transform: translateY(-1px);
        }

        .destination-tabs:has(#${tab.tabId}:checked) .destination-panel[data-tab="${tab.tabId}"] {
          display: block;
        }
      `)
    .join("\n");

  return (
    <div className="destination-tabs">
      <style>{tabStyles}</style>
      <div className="destination-tab-list" role="tablist" aria-label="Chọn nhóm combo">
        {tabs.map((tab, index) => (
          <div className="destination-tab-item" key={`${tab.tabId}-${index}`}>
            <input suppressHydrationWarning defaultChecked={index === 0} id={tab.tabId} name="destination-tab" type="radio" onChange={() => setActiveTab(tab.tabId)} />
            <label className="destination-tab-label" htmlFor={tab.tabId}>
              {tab.label}
            </label>
          </div>
        ))}
      </div>

      <div className="destination-panels">
        {tabs.map((tab, index) => (
          <section className="destination-panel" data-tab={tab.tabId} key={`${tab.tabId}-${index}`}>
            <div className="destination-result">
              <div className="destination-result-heading">
                <p className="eyebrow">{tab.title}</p>
              </div>
              <DestinationPackageScroller active={activeTab === tab.tabId}>
                {tab.items.map((item, packageIndex) => (
                  <PackageCard item={item} key={`${item.id}-${item.slug}-${packageIndex}`} />
                ))}
              </DestinationPackageScroller>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}