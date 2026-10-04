"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AnimatedInput({
  label,
  type = "text",
  value,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="group relative w-full">
      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-zinc-500">
        {label}
      </label>

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={label}
          className="peer w-full bg-transparent pb-4 pr-8 text-lg text-white outline-none placeholder:text-zinc-600"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 text-zinc-500 hover:text-white transition-colors"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: .8 }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-zinc-700"
      />

      <motion.div
        initial={{ scaleX: 0 }}
        whileFocus={{ scaleX: 1 }}
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-center bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-yellow-400/5 blur-xl opacity-0 transition duration-300 group-focus-within:opacity-100" />
    </div>
  );
}
