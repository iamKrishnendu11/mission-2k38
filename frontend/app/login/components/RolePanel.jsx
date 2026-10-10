"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import BorderGlow from "../../../components/ui/BorderGlow";

export default function RolePanel({ role, index, onSelect }) {
  const titleFormatted = role.id.charAt(0).toUpperCase() + role.id.slice(1);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelect(role)}
      whileTap={{ scale: 0.98 }}
      className="w-full h-[360px] md:h-[420px] text-left group outline-none"
    >
      <BorderGlow
        glowColor="50 93 53"
        backgroundColor="#050505"
        borderRadius={24}
        className="w-full h-full shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(250,204,21,0.15)]"
        animated={false}
        colors={['#facc15', '#eab308', '#ca8a04']}
      >
        <div className="relative overflow-hidden h-[360px] md:h-[420px] flex flex-col justify-end rounded-[24px]">
          {/* Image with Mask to tone down bright edges */}
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 25%, rgba(0,0,0,0.15) 90%)',
              maskImage: 'radial-gradient(circle at 50% 45%, black 25%, rgba(0,0,0,0.15) 90%)'
            }}
          >
            <img
              src={role.image}
              alt={role.title}
              className="relative z-10 w-full h-full object-cover object-center opacity-60 group-hover:opacity-100 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
            />
            {/* Dark overlay that fades on hover */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/0 transition-colors duration-700 pointer-events-none z-20" />
            {/* Ambient overlay over image to enhance hover feel */}
            <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-colors duration-700 pointer-events-none z-20" />
          </div>
          
          {/* Content */}
          <div 
            className="relative z-30 text-left p-6 flex flex-col justify-end h-full pointer-events-none"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            <div className="mt-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] flex items-center gap-2 transition-colors duration-300 group-hover:text-yellow-400">
                {titleFormatted}
                <ChevronRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] text-yellow-400" />
              </h3>
              
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div className="overflow-hidden">
                  <p className="text-[15px] text-white/60 leading-relaxed font-medium mt-2 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 tracking-tight">
                    {role.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient overlay to make text readable */}
          <div className="absolute bottom-0 left-0 right-0 h-32 group-hover:h-56 bg-gradient-to-t from-[#050505] from-30% via-[#050505]/80 via-60% to-transparent pointer-events-none z-20 transition-all duration-500" />
        </div>
      </BorderGlow>
    </motion.button>
  );
}
