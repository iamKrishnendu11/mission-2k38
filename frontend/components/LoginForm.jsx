"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/ui/animated-button";

const ROLE_META = {
  player: {
    label: "Player",
    registerHref: "/register/player",
    color: "from-yellow-400/20 to-transparent",
  },
  coach: {
    label: "Coach",
    registerHref: "/register/coach",
    color: "from-yellow-400/20 to-transparent",
  },
  scout: {
    label: "Scout",
    registerHref: "/register/scout",
    color: "from-yellow-400/20 to-transparent",
  },
};

const LoginForm = ({ role }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const meta = ROLE_META[role] || ROLE_META.player;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { role, email });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-10">
      {/* Stadium background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/login/images/stadium.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-black/70" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,213,74,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[10] w-full max-w-[430px] rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,213,74,0.1), 0 24px 64px rgba(0,0,0,0.7), 0 0 80px rgba(255,213,74,0.06)",
        }}
      >
        {/* Top border glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

        {/* Inner glow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,213,74,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 p-8 md:p-10 flex flex-col gap-6">
          {/* Back button */}
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors duration-200 w-fit"
          >
            ← Back to Role Selection
          </button>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-yellow-400 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                {meta.label}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-white"
            >
              {meta.label} Login
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-sm text-white/50 leading-relaxed"
            >
              Welcome back. Sign in to continue your Mission 2K38 journey.
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col gap-1.5"
            >
              <label className="text-xs font-medium uppercase tracking-widest text-white/40">
                Email Address
              </label>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: emailFocused
                    ? "0 0 0 1.5px #FFD54A, 0 0 20px rgba(255,213,74,0.15)"
                    : "0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none rounded-xl border-none"
                  id={`${role}-email`}
                  autoComplete="email"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-white/40">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-white/30 hover:text-yellow-400 transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: passwordFocused
                    ? "0 0 0 1.5px #FFD54A, 0 0 20px rgba(255,213,74,0.15)"
                    : "0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none rounded-xl border-none"
                  id={`${role}-password`}
                  autoComplete="current-password"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.5 }}
              className="mt-2"
            >
              <AnimatedButton
                type="submit"
                className="w-full !rounded-xl !bg-yellow-400 !border-yellow-500/50 !text-black !font-bold hover:!bg-yellow-300 dark:!bg-yellow-400 dark:!text-black dark:!border-yellow-500/50"
              >
                Sign In to Mission 2K38
              </AnimatedButton>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center justify-center gap-1.5 text-xs text-white/40"
          >
            <span>New User?</span>
            <a
              href={meta.registerHref}
              className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
            >
              Register
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
