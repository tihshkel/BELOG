"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Section, SectionTemplate } from "@/lib/types";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { TEMPLATE_ICONS, TEMPLATE_LABELS, normalizeTemplateType } from "@/lib/section-content";
import { getMediaThumbnailUrl, parseStoredMediaValue } from "@/lib/media";
import { MEDIA_KIND_ICONS } from "@/lib/media-constants";
import {
  SLOT_COUNT,
  formatSlotNumber,
  getSlotStatus,
  isEmptySlot,
  type SlotStatus,
} from "@/lib/slot-utils";

const STATUS_ICONS: Record<SlotStatus, string> = {
  published: "check_circle",
  hidden: "visibility_off",
  empty: "radio_button_unchecked",
};

export function AdminSlotNav() {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    void fetch("/api/sections")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Section[]) => setSections(data));
  }, []);

  const slotMap = new Map(sections.map((section) => [section.slotIndex, section]));

  return (
    <div className="admin-slot-nav">
      <p className="admin-slot-nav__label">Разделы</p>
      <ul className="admin-slot-nav__list">
        {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
          const section = slotMap.get(slotIndex);
          const slotLabel = formatSlotNumber(slotIndex);
          const href = `/admin/slots/${slotLabel}`;
          const isActive = pathname === href;
          const empty = !section || isEmptySlot(section);
          const title = empty ? `Слот ${slotLabel}` : section.title;
          const status = section ? getSlotStatus(section) : "empty";
          const template: SectionTemplate | null = section
            ? normalizeTemplateType(section.templateType)
            : null;

          return (
            <li key={slotIndex}>
              <Link
                href={href}
                className={[
                  "admin-slot-nav__item",
                  isActive ? "admin-slot-nav__item--active" : "",
                  empty ? "admin-slot-nav__item--empty" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="admin-slot-nav__index">{slotLabel}</span>
                {section?.coverUrl ? (
                  <CoverThumb url={section.coverUrl} />
                ) : null}
                <span className="admin-slot-nav__content">
                  <span className="admin-slot-nav__title">{title}</span>
                  <span className="admin-slot-nav__meta">
                    {template ? (
                      <>
                        <MaterialIcon name={TEMPLATE_ICONS[template]} size={14} />
                        <span>{TEMPLATE_LABELS[template]}</span>
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="add_circle" size={14} />
                        <span>Не настроен</span>
                      </>
                    )}
                  </span>
                </span>
                <MaterialIcon
                  name={STATUS_ICONS[status]}
                  size={18}
                  className={`admin-slot-nav__status admin-slot-nav__status--${status}`}
                  filled={status === "published"}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CoverThumb({ url }: { url: string }) {
  const media = parseStoredMediaValue(url);
  const thumb = media ? getMediaThumbnailUrl(media) : null;

  if (thumb) {
    return (
      <span className="admin-slot-nav__thumb">
        <Image src={thumb} alt="" fill className="object-cover" sizes="40px" unoptimized={thumb.endsWith(".svg")} />
      </span>
    );
  }

  if (media) {
    return (
      <span className="admin-slot-nav__thumb admin-slot-nav__thumb--icon">
        <MaterialIcon name={MEDIA_KIND_ICONS[media.kind]} size={18} />
      </span>
    );
  }

  return null;
}
