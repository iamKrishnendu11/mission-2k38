"use client";

import { useEffect, useRef } from "react";

export default function FloatingParticles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const particles = containerRef.current?.children || [];

    let frame;

    const animate = () => {
      Array.from(particles).forEach((particle, i) => {
        const speed = Number(particle.dataset.speed);
        const top = parseFloat(particle.dataset.top);

        const next = (top + speed) % 110;

        particle.dataset.top = next;

        particle.style.transform = `translate3d(0, ${next}vh, 0)`;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  const dots = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 6,
    opacity: 0.08 + Math.random() * 0.18,
    speed: 0.015 + Math.random() * 0.03,
    top: Math.random() * 100,
  }));

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden z-10"
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          data-speed={dot.speed}
          data-top={dot.top}
          style={{
            left: `${dot.left}%`,
            width: dot.size,
            height: dot.size,
            opacity: dot.opacity,
          }}
          className="absolute -top-10 rounded-full bg-yellow-300 blur-[1px]"
        />
      ))}
    </div>
  );
}
