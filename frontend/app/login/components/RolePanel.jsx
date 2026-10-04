"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function RolePanel({
  role,
  isActive,
  onHover,
  onLeave,
  onSelect,
}) {
  return (
    <motion.div
      layout
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => onSelect(role)}
      transition={{ layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
      className={`relative h-screen overflow-hidden cursor-pointer ${isActive ? "flex-[1.8]" : "flex-1"
        }`}
    >
      <div className="absolute inset-0 bg-black/50 panel-overlay z-10" />
      <div className={`absolute inset-0 bg-gradient-to-t ${role.accent} opacity-20 z-20`} />

      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.7 }}
        transition={{ duration: .6 }}
        className="background-light absolute -bottom-48 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-yellow-400/20 blur-[180px] z-20"
      />

      <motion.div
        animate={{ scale: isActive ? 1.08 : .95, y: isActive ? -20 : 0 }}
        transition={{ duration: .8 }}
        className="absolute inset-0 z-30 flex items-end justify-center"
      >
        <Image
          src={role.image}
          alt={role.title}
          width={900}
          height={1000}
          priority
          draggable={false}
          className="character-image h-[88vh] w-auto object-contain select-none pointer-events-none"
        />
      </motion.div>

      <div className="absolute inset-x-0 top-8 z-30 px-8">
        <p className="hero-subtitle text-xs uppercase tracking-[0.45em] text-yellow-400">
          MISSION 2K38
        </p>
        <h2 className="hero-title mt-2 text-6xl md:text-8xl xl:text-9xl font-black text-white/10">
          {role.title}
        </h2>
      </div>

      <motion.div
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 50 }}
        transition={{ duration: .55 }}
        className="absolute bottom-12 left-8 z-40 max-w-sm"
      >
        <h3 className="text-4xl font-black text-white leading-tight">
          {role.subtitle}
        </h3>

        <p className="mt-5 text-zinc-300 leading-7">
          {role.description}
        </p>

        <motion.button
          whileHover={{ x: 8 }}
          whileTap={{ scale: .96 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-yellow-400/40 bg-white/5 px-6 py-3 text-yellow-400 backdrop-blur-md"
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>

      <motion.div
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-0 border border-yellow-400/40 z-40"
      />

      <motion.div
        animate={{ x: isActive ? "170%" : "-170%" }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent z-50"
      />
    </motion.div>
  );
}
