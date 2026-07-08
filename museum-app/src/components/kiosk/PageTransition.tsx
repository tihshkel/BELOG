"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = 1 | -1;

interface PageTransitionProps {
  children: ReactNode;
  direction: Direction;
}

const spring = { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.9 };

export function PageTransition({ children, direction }: PageTransitionProps) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-transparent"
      custom={direction}
      variants={{
        enter: (d: Direction) => ({
          x: `${d * 100}%`,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (d: Direction) => ({
          x: `${d * -30}%`,
          opacity: 0,
        }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
