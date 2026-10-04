"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function BackgroundEffects() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".stadium-bg", {
        scale: 1.08,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".light-left", {
        x: 120,
        opacity: 0.8,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".light-right", {
        x: -120,
        opacity: 0.7,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <Image
        src="/login/images/stadium.jpg"
        alt="Stadium Background"
        fill
        priority
        className="stadium-bg object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />

      <div className="light-left absolute -left-40 top-0 h-full w-[32rem] rotate-12 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent blur-3xl" />

      <div className="light-right absolute -right-40 top-0 h-full w-[32rem] -rotate-12 bg-gradient-to-l from-transparent via-yellow-400/10 to-transparent blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.12),transparent_60%)]" />

      <div className="absolute inset-0 shadow-[inset_0_0_220px_rgba(0,0,0,0.95)]" />

      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
    </div>
  );
}
