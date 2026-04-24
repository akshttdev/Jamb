"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type MotionWrapperProps = {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly className?: string;
};

export function MotionWrapper({
  children,
  delay = 0,
  duration = 0.6,
  className,
}: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once: true, margin: "-64px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
