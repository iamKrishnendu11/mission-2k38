"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import RolePanel from "./RolePanel";
import LoginScene from "./LoginScene";
import StrokeText from "../../../ui/masked-text";
import { roles } from "../data/roles";

export default function HeroPanels() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <section className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="roles"
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4 } }}
            className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 h-full flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-10 relative z-10 w-full flex flex-col items-center shrink-0"
            >
              <div className="w-full max-w-[700px]">
                <StrokeText 
                  text="Select Your Role"
                  strokeColor="#facc15"
                  fillColor="transparent"
                  strokeWidth={1.4}
                  drawDuration={1.6}
                  fillDelay={0.2}
                  stagger={0.05}
                  ease="power2.out"
                  trigger="mount"
                  fillMode="none"
                  fontSize={100}
                  fontWeight={800}
                  letterSpacing={-4}
                  reverse={false}
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                  className="w-full"
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 relative z-10 w-full shrink-0">
              {roles.map((role, index) => (
                <RolePanel
                  key={role.id}
                  role={role}
                  index={index}
                  onSelect={setSelectedRole}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 w-full sm:w-fit h-fit p-3 sm:p-4 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl mx-auto shadow-2xl relative z-10 shrink-0"
            >
              <p className="text-[15px] text-white/60 text-center font-medium tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <strong className="text-yellow-400 mr-1 font-semibold">Choose Your Role:</strong> Select
                Player to track progress, Coach to manage players, or Scout to recruit talent.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <LoginScene
            key="login"
            role={selectedRole}
            onBack={() => {
              setSelectedRole(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
