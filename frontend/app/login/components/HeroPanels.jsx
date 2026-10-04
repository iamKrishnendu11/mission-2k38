"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import RolePanel from "./RolePanel";
import LoginScene from "./LoginScene";
import MouseSpotlight from "./MouseSpotlight";
import FloatingParticles from "./FloatingParticles";
import BackgroundEffects from "./BackgroundEffects";
import { roles } from "../data/roles";

gsap.registerPlugin(ScrollTrigger);

export default function HeroPanels() {
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);
  const panelsRef = useRef([]);

  const [activeRole, setActiveRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-panel",
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: "power4.out",
        }
      );

      gsap.to(".character-image", {
        y: -18,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.35,
          ease: "power3.out",
        });
      }

      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      gsap.to(".character-image", {
        x,
        y,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to(".stadium-bg", {
        x: x * 0.25,
        y: y * 0.25,
        duration: 1.5,
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleSelect = (role) => {
    const tl = gsap.timeline({
      onComplete: () => setSelectedRole(role),
    });

    tl.to(".hero-panel", {
      opacity: 0.2,
      scale: 0.95,
      duration: 0.7,
      ease: "power3.inOut",
    });

    tl.to(
      `[data-role="${role.id}"]`,
      {
        opacity: 1,
        scale: 1.12,
        duration: 1,
        ease: "power4.out",
      },
      "<"
    );
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-black"
    >
      <BackgroundEffects />
      <FloatingParticles />
      <MouseSpotlight ref={spotlightRef} />

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="roles"
            className="relative z-20 flex h-screen"
            exit={{ opacity: 0 }}
          >
            {roles.map((role, index) => (
              <div
                key={role.id}
                ref={(el) => (panelsRef.current[index] = el)}
                data-role={role.id}
                className="hero-panel flex-1 overflow-hidden"
              >
                <RolePanel
                  role={role}
                  isActive={activeRole === role.id}
                  onHover={() => setActiveRole(role.id)}
                  onLeave={() => setActiveRole(null)}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <LoginScene
            key="login"
            role={selectedRole}
            onBack={() => {
              setSelectedRole(null);
              setActiveRole(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
