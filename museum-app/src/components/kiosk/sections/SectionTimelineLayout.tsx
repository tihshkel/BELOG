"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScreenOrientation, Section } from "@/lib/types";
import { parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";
import { MediaTile } from "../media/MediaTile";
import { MediaPreviewOverlay } from "../media/MediaPreviewOverlay";

interface SectionTimelineLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionTimelineLayout({ section, orientation }: SectionTimelineLayoutProps) {
  const content = parseContent(section.contentJson, section.contentHtml, "timeline");
  const events = content.events ?? [];
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewEvent = events.find((e) => e.id === previewId);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className="timeline-layout flex-1 min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`timeline-track timeline-track--${orientation}`}
        >
          {events.map((event, index) => (
            <article key={event.id} className="timeline-event">
              <div className="timeline-event__rail">
                <span className="timeline-event__year">{event.year || "—"}</span>
                <span className="timeline-event__dot" />
                {index < events.length - 1 ? <span className="timeline-event__line" /> : null}
              </div>

              <div className="timeline-event__card">
                {event.media?.url ? (
                  <div className="timeline-event__thumb">
                    <MediaTile
                      media={event.media}
                      title={event.title}
                      className="timeline-event__media-tile"
                      sizes="120px"
                      onClick={() => setPreviewId(event.id)}
                      asButton
                    />
                  </div>
                ) : null}
                <div className="timeline-event__body">
                  {event.title ? <h2 className="timeline-event__title">{event.title}</h2> : null}
                  {event.text ? (
                    <div className="timeline-event__text">
                      {event.text.split("\n\n").map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>

      {previewEvent?.media?.url ? (
        <MediaPreviewOverlay
          items={[{ media: previewEvent.media, title: previewEvent.title }]}
          index={0}
          onClose={() => setPreviewId(null)}
        />
      ) : null}
    </div>
  );
}
