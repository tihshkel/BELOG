"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { HotspotType } from "@/lib/types";

const simpleMotion: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

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
  anthem: {
    hidden: { opacity: 0, scale: 0.5, y: 24 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 240, damping: 18, delay: 0.12 },
    },
  },
};

const ringMotion: Record<HotspotType, boolean> = {
  flag: false,
  emblem: true,
  logo: true,
  anthem: true,
};

interface HotspotSymbolProps {
  type: HotspotType;
  src: string;
  simple?: boolean;
}

export function HotspotSymbol({ type, src, simple = false }: HotspotSymbolProps) {
  const variants = simple ? simpleMotion : symbolMotion[type];
  const showRings = !simple && ringMotion[type];

  return (
    <motion.div
      className={`symbol-stage symbol-stage--${type}${simple ? " symbol-stage--simple" : ""}`}
      initial="hidden"
      animate="show"
      variants={variants}
      style={!simple && type === "flag" ? { transformOrigin: "left center" } : undefined}
    >
      {showRings && (
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

      {!simple && type === "flag" && <span className="symbol-flag-pole" aria-hidden />}

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
