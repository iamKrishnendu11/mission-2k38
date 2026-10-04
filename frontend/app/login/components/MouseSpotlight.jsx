"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

const MouseSpotlight = forwardRef(function MouseSpotlight(_, ref) {
  return (
    <>
      <motion.div
        ref={ref}
        className="mouse-light pointer-events-none fixed left-0 top-0 z-50 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/10 blur-[120px]"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-40 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/40"
        style={{
          x: 0,
          y: 0,
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.15)_70%,rgba(0,0,0,.45)_100%)]" />
    </>
  );
});

export default MouseSpotlight;
