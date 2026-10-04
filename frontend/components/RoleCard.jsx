"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RoleCard = ({ role, description, image, href, delay = 0 }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.03 }}
      onClick={() => router.push(href)}
      className="group relative flex flex-col cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-md shadow-2xl transition-all duration-500"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,213,74,0.08), 0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(255,213,74,0.04)",
      }}
    >
      {/* Yellow glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: "inset 0 0 40px rgba(255,213,74,0.12), 0 0 60px rgba(255,213,74,0.08)",
        }}
      />

      {/* Top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={role}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 95vw, (max-width: 1024px) 45vw, 30vw"
        />
        {/* Gradient overlay over image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3 p-6 pt-5">
        {/* Role pill */}
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
          {role}
        </span>

        {/* Description */}
        <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors duration-300">
          {description}
        </p>

        {/* CTA arrow */}
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-yellow-400/70 group-hover:text-yellow-400 transition-colors duration-300">
          Continue as {role}
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            className="inline-block"
          >
            →
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default RoleCard;
