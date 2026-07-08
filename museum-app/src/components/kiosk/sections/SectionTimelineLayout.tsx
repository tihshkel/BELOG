"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ScreenOrientation, Section } from "@/lib/types";
import { parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";

interface SectionTimelineLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionTimelineLayout({ section, orientation }: SectionTimelineLayoutProps) {
  const content = parseContent(section.contentJson, section.contentHtml, "timeline");
  const events = content.events ?? [];

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
                {event.imageUrl ? (
                  <div className="timeline-event__thumb">
                    <Image src={event.imageUrl} alt="" fill sizes="120px" className="object-cover" />
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
    </div>
  );
}
