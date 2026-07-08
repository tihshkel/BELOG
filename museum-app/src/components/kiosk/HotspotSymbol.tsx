"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { HotspotType } from "@/lib/types";

const symbolMotion: Record<HotspotType, Variants> = {
  flag: {
    hidden: { opacity: 0, scaleX: 0.25, scaleY: 0.9, x: -48, filter: "blur(4px)" },
    show: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 180, damping: 20, delay: 0.12 },
    },
  },
  emblem: {
    hidden: { opacity: 0, scale: 0.35, rotate: -18, filter: "blur(6px)" },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 220, damping: 16, delay: 0.15 },
    },
  },
  logo: {
    hidden: { opacity: 0, scale: 0.55, y: 36 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.1 },
    },
  },
};

const ringMotion: Record<HotspotType, boolean> = {
  flag: false,
  emblem: true,
  logo: true,
};

interface HotspotSymbolProps {
  type: HotspotType;
  src: string;
}

export function HotspotSymbol({ type, src }: HotspotSymbolProps) {
  return (
    <motion.div
      className={`symbol-stage symbol-stage--${type}`}
      initial="hidden"
      animate="show"
      variants={symbolMotion[type]}
      style={type === "flag" ? { transformOrigin: "left center" } : undefined}
    >
      {ringMotion[type] && (
        <>
          <motion.span
            className="symbol-ring"
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          <motion.span
            className="symbol-ring symbol-ring--delay"
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          />
        </>
      )}

      {type === "flag" && <span className="symbol-flag-pole" aria-hidden />}

      <Image
        src={src}
        alt=""
        width={480}
        height={480}
        className={`content-visual__img symbol-img symbol-img--${type}`}
        priority
      />
    </motion.div>
  );
}
