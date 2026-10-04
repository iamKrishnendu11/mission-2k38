"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function MagneticButton({
  children,
  className = "",
  onClick,
  type = "button",
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();

    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;

    x.set(mx * 0.18);
    y.set(my * 0.18);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      style={{
        x: springX,
        y: springY,
      }}
      className={`group relative overflow-hidden rounded-full border border-yellow-400/40 bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 font-bold uppercase tracking-[0.25em] text-black shadow-[0_0_40px_rgba(250,204,21,0.25)] transition-all duration-300 ${className}`}
    >
      <span className="relative z-20 flex items-center justify-center gap-3">
        {children}
        <motion.span
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          →
        </motion.span>
      </span>

      <motion.div
        className="absolute inset-0 z-10 bg-white/20"
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.8 }}
      />

      <div className="absolute inset-0 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 bg-yellow-300/40" />
    </motion.button>
  );
}
