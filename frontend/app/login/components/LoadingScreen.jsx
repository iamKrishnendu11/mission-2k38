"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoadingScreen({ onComplete }) {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      tl.from(".who", {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "power4.out",
      })
        .to(".who", {
          opacity: 0,
          y: -30,
          duration: 0.4,
          delay: 0.3,
        })
        .to(root.current, {
          opacity: 0,
          duration: 0.4,
          pointerEvents: "none",
        });
    }, root);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,.08),transparent_70%)]" />

      <div className="relative text-center">
        <p className="who text-5xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white">
          SELECT YOUR ROLE
        </p>
      </div>
    </div>
  );
}
