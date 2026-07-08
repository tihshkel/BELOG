"use client";

import { motion } from "framer-motion";
import type { ScreenOrientation } from "@/lib/types";

interface SectionHeaderProps {
  title: string;
  orientation: ScreenOrientation;
}

export function SectionHeader({ title, orientation }: SectionHeaderProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={`article-header shrink-0 ${isHorizontal ? "px-[4%] py-[3%]" : "px-5 py-4"}`}>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="font-display font-semibold leading-[1.15] text-blue-dark"
        style={{ fontSize: "clamp(1.4rem, 5.5cqw, 2.5rem)" }}
      >
        {title}
      </motion.h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="accent-line mt-4 origin-left"
      />
    </div>
  );
}
