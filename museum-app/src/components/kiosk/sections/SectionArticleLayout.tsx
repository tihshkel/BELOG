"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ScreenOrientation, Section } from "@/lib/types";
import { imageSizeClass, parseContent } from "@/lib/section-content";
import { getDisplayBgSrc } from "@/lib/screen-specs";
import { SectionHeader } from "./SectionHeader";

interface SectionArticleLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionArticleLayout({ section, orientation }: SectionArticleLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const displayBg = getDisplayBgSrc(orientation);
  const content = parseContent(section.contentJson, section.contentHtml, "article");
  const heroUrl = content.heroImage ?? section.coverUrl;
  const hasVisual = Boolean(heroUrl);
  const heroSize = content.heroSize ?? "large";
  const intro = content.intro?.trim();
  const body = content.body?.trim();

  const layoutClass = [
    "article-layout",
    isHorizontal ? "article-layout--horizontal" : "article-layout--vertical",
    !hasVisual ? "article-layout--text-only" : "",
    hasVisual ? imageSizeClass(heroSize, "article-layout") : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className={`article-body flex-1 min-h-0 ${layoutClass}`}>
        {hasVisual && heroUrl ? (
          <aside className={`article-visual ${imageSizeClass(heroSize, "article-visual")}`}>
            <Image src={displayBg} alt="" fill sizes="40vw" className="article-visual__bg" />
            <div className="article-visual__inner">
              <Image
                src={heroUrl}
                alt={section.title}
                fill
                sizes={isHorizontal ? "40vw" : "100vw"}
                className="article-visual__img"
              />
            </div>
          </aside>
        ) : null}

        {(intro || body) ? (
          <section className="article-reader">
            <div className="article-reader__scroll">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="article-reader__inner"
              >
                {intro ? <p className="article-lead">{intro}</p> : null}
                {body ? <div className="article-body-text">{body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div> : null}
              </motion.div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
