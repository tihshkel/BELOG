"use client";

import Image from "next/image";
import type { ContentBlock } from "@/lib/section-content";

interface BlockRendererProps {
  blocks: ContentBlock[];
  orientation: "horizontal" | "vertical";
}

export function BlockRenderer({ blocks, orientation }: BlockRendererProps) {
  return (
    <div className="blocks-content">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={block.id} className="blocks-content__heading">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={block.id} className="blocks-content__paragraph">
                {block.text}
              </p>
            );
          case "quote":
            return (
              <blockquote key={block.id} className="blocks-content__quote">
                {block.text}
              </blockquote>
            );
          case "image":
            return (
              <figure key={block.id} className="blocks-content__figure">
                <div className="content-image">
                  <Image
                    src={block.url}
                    alt={block.caption ?? ""}
                    fill
                    sizes={orientation === "horizontal" ? "50vw" : "100vw"}
                    className="content-image__img"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="blocks-content__caption">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
