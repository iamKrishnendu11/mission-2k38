"use client";

import { useState, useEffect } from "react";
import Navbar from "@/landing-page/Navbar";
import HeroSection from "@/landing-page/HeroSection";
import About from "@/landing-page/About";
import Features from "@/landing-page/Features";
import HistorySection from "@/landing-page/History";
import Pricing from "@/landing-page/Pricing";
import QuoteSection from "@/landing-page/QuoteSection";
import Footer01 from "@/landing-page/footer/Footer01";
import Preloader from "@/landing-page/PreLoader";
import FollowCursor from "@/components/ui/FollowCursor";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // After the preloader exits, force GSAP ScrollTrigger to
  // recalculate all positions on the now-fully-visible page.
  useEffect(() => {
    if (!isLoading) {
      // Small delay to let the DOM fully paint at natural size
      const t = setTimeout(() => {
        if (typeof window !== "undefined") {
          // Dynamically import so GSAP is never loaded on the server
          import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
            ScrollTrigger.refresh();
          });
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  return (
    <>
      <Preloader isLoading={isLoading} setIsLoading={setIsLoading} />
      <FollowCursor />

      {/*
        IMPORTANT – no scale/transform here.
        A CSS transform on a parent creates a new stacking context and
        shifts every child's getBoundingClientRect, causing GSAP to record
        wrong trigger offsets. We only toggle visibility so the page
        occupies its real layout space while hidden.
      */}
      <main
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 600ms ease",
        }}
      >
        <Navbar />
        <HeroSection />
        <About />
        <Features />
        <HistorySection />
        <Pricing />
        <QuoteSection />
        <Footer01 />
      </main>
    </>
  );
}