"use client";

import Image from "next/image";
import type { Section, ScreenOrientation } from "@/lib/types";
import { MAX_SECTIONS } from "@/lib/constants";
import { useUniformSectionTitleSize } from "@/hooks/useUniformSectionTitleSize";

interface SectionsGridProps {
  orientation: ScreenOrientation;
  sections: Section[];
  onSelect: (index: number) => void;
}

const BUTTON_SHAPE_LEFT = "/assets/section-button-right.svg";
const BUTTON_SHAPE_RIGHT = "/assets/section-button-left.svg";

function formatSlotNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function SectionSlot({
  slotIndex,
  section,
  side,
  onSelect,
}: {
  slotIndex: number;
  section: Section | null;
  side: "left" | "right";
  onSelect: (index: number) => void;
}) {
  const isEmpty = !section;
  const positionInCol = slotIndex % 5;
  const title = section?.title ?? "Название раздела";

  return (
    <button
      type="button"
      disabled={isEmpty}
      onClick={() => section && onSelect(slotIndex)}
      className={[
        "sections-hub__slot",
        `sections-hub__slot--${side}`,
        `sections-hub__slot--pos-${positionInCol}`,
        isEmpty ? "sections-hub__slot--empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={section?.title ?? `Слот ${formatSlotNumber(slotIndex)}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={side === "left" ? BUTTON_SHAPE_LEFT : BUTTON_SHAPE_RIGHT}
        alt=""
        aria-hidden
        className="sections-hub__slot-shape"
      />
      <span className="sections-hub__slot-content">
        <span className="sections-hub__num">{formatSlotNumber(slotIndex)}</span>
        <span className="sections-hub__name">
          {title}
        </span>
      </span>
    </button>
  );
}

export function SectionsGrid({ orientation, sections, onSelect }: SectionsGridProps) {
  const isHorizontal = orientation === "horizontal";
  const slotMap = new Map(sections.map((section) => [section.slotIndex, section]));
  const slots = Array.from({ length: MAX_SECTIONS }, (_, i) => slotMap.get(i) ?? null);
  const leftSlots = slots.slice(0, 5);
  const rightSlots = slots.slice(5, 10);
  const referenceTitle = sections[0]?.title ?? "Название раздела";
  const hubRef = useUniformSectionTitleSize(referenceTitle);

  return (
    <div
      ref={hubRef}
      className={`sections-hub ${isHorizontal ? "sections-hub--horizontal" : "sections-hub--vertical"}`}
    >
      <div className="sections-hub__col sections-hub__col--left">
        {leftSlots.map((section, i) => (
          <SectionSlot
            key={i}
            slotIndex={i}
            section={section}
            side="left"
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="sections-hub__logo">
        <Image
          src="/assets/logo-belog.png"
          alt="Белорусское общество глухих"
          width={400}
          height={400}
          className="sections-hub__logo-img"
          priority
        />
      </div>

      <div className="sections-hub__col sections-hub__col--right">
        {rightSlots.map((section, i) => (
          <SectionSlot
            key={i + 5}
            slotIndex={i + 5}
            section={section}
            side="right"
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
