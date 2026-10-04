"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AnimatedInput from "./AnimatedInput";
import MagneticButton from "./MagneticButton";

export default function LoginScene({ role, onBack }) {
  const root = useRef(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse query parameters for forgot-password reset token simulation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const resetToken = urlParams.get("resetToken");
      if (resetToken) {
        alert("Reset Token Detected! In a production flow this opens the password update screen.");
      }
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Direct call to Express Node.js Server via API utility
      const res = await api.post("/auth/login", { email, password, rememberMe });
      
      // Store user and tokens
      api.setTokens(res.accessToken, res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("profile", JSON.stringify(res.profile));

      // Check role mismatch warning (e.g. if player logs into scout portal, warning or allow)
      if (res.user.role !== role.id) {
        console.warn(`Logged in role (${res.user.role}) differs from selection (${role.id}). Redirecting to correct portal.`);
      }

      // Route to unified dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address in the field above to reset password.");
      return;
    }
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      alert(`Password reset simulation triggered! Link: ${res.resetLink || 'sent'}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section ref={root} className="relative flex min-h-screen overflow-hidden bg-black w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,.12),transparent_60%)]" />
      <div className="relative hidden lg:flex w-1/2 items-end justify-center overflow-hidden">
        <Image src={role.image} alt={role.title} width={900} height={1000}
          className="login-character h-[90vh] w-auto object-contain" />
      </div>

      <div className="relative flex w-full lg:w-1/2 items-center px-8 md:px-16 py-12">
        <form onSubmit={handleLogin} className="w-full max-w-xl">
          <button type="button" onClick={onBack}
            className="login-reveal mb-6 text-sm uppercase tracking-[.3em] text-zinc-400 hover:text-yellow-400 transition-colors">
            ← Back
          </button>

          <p className="login-reveal text-yellow-400 uppercase tracking-[.45em] text-xs">
            {role.title} Portal
          </p>

          <h1 className="login-reveal mt-2 text-5xl md:text-7xl font-black leading-none text-white">
            WELCOME<br />BACK
          </h1>

          <p className="login-reveal mt-4 text-zinc-400">
            Continue your football journey.
          </p>

          {error && (
            <div className="login-reveal mt-4 p-3 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="login-reveal mt-8 space-y-6">
            <AnimatedInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <AnimatedInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-reveal mt-6 flex items-center justify-between text-sm text-zinc-400">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-yellow-400 focus:ring-yellow-400"
              />
              <span>Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-yellow-400/80 hover:text-yellow-400 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <div className="login-reveal mt-8 flex flex-col sm:flex-row items-center gap-6">
            <MagneticButton type="submit" onClick={handleLogin} className={loading ? "opacity-75 pointer-events-none" : ""}>
              {loading ? "ENTERING..." : "ENTER THE PITCH"}
            </MagneticButton>
            
            <button
              type="button"
              onClick={() => router.push(`/auth/register?role=${role.id}`)}
              className="text-zinc-400 hover:text-white border-b border-dashed border-zinc-500 hover:border-white transition-all py-1"
            >
              Register as {role.title}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
