"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const GAP_PX = 4;

const SPRING_SLIDE = { type: "spring", stiffness: 300, damping: 28 };
const SPRING_ROTATE = { type: "spring", stiffness: 200, damping: 30 }; // Increased damping to make it more "stable"

// Adapted gradient to match the gold/yellow theme of the app
const ICON_STYLE = {
  background: "linear-gradient(to top, #facc15, #eab308)",
  boxShadow:
    "0 2px 8px 0 rgba(250,204,21,0.35), 0 1.5px 0 0 rgba(255,255,255,0.25) inset, 0 -2px 8px 0 rgba(202,138,4,0.5) inset, 0 0 0 1px rgba(0,0,0,0.08)",
};

const SHIMMER_STYLE = {
  background:
    "linear-gradient(180deg,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0) 80%,transparent 100%)",
  filter: "blur(0.5px)",
};

const INNER_SHADOW_STYLE = {
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.15) inset, 0 1.5px 0 0 rgba(255,255,255,0.2) inset, 0 -2px 4px 0 rgba(202,138,4,0.2) inset",
};

const BOX_SHADOW = {
  default:
    "inset 0 2px 3px 0 rgba(255,255,255,0.15), inset 0 -3px 6px 0 rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)",
  outline:
    "inset 0 2px 4px 0 rgba(0,0,0,0.12), inset 0 -2px 2px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(0,0,0,0.06)",
};

export const SlidingButton = React.forwardRef(
  (
    { children, className, variant = "default", iconPosition = "right", ...props },
    externalRef
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [travelDistance, setTravelDistance] = React.useState(0);

    const mergedRef = React.useCallback(
      (node) => {
        if (typeof externalRef === "function") externalRef(node);
        else if (externalRef) externalRef.current = node;

        if (!node) return;

        const measure = () => {
          const iconSize = node.clientHeight - 8; // 8px for p-1 top/bottom
          setTravelDistance(node.clientWidth - iconSize - GAP_PX * 2);
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(node);
      },
      [externalRef]
    );

    const slideX = isHovered
      ? iconPosition === "right"
        ? -travelDistance
        : travelDistance
      : 0;
    
    return (
      <button
        ref={mergedRef}
        aria-label={children?.toString()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative h-12 w-fit cursor-pointer overflow-hidden rounded-xl p-1 text-sm font-bold text-white bg-zinc-900 transition-all duration-500 flex items-center active:scale-[0.98]",
          iconPosition === "right"
            ? "ps-6 pe-14 hover:ps-14 hover:pe-6"
            : "ps-14 pe-6 hover:ps-6 hover:pe-14",
          className
        )}
        style={{ boxShadow: BOX_SHADOW[variant] }}
        {...props}
      >
        <span
          className="relative z-10 transition-all duration-500 font-bold tracking-tight text-shadow-black/10 flex-1 text-center"
        >
          {children}
        </span>

        <motion.div
          aria-hidden
          className={cn(
            "absolute z-20 flex aspect-square h-[calc(100%-8px)] items-center justify-center rounded-lg text-black",
            iconPosition === "right" ? "right-1" : "left-1"
          )}
          style={ICON_STYLE}
          animate={{ x: slideX }}
          transition={SPRING_SLIDE}
        >
          <span
            className="pointer-events-none absolute left-1/2 top-0 z-20 h-2/5 w-[80%] -translate-x-1/2 rounded-t-[inherit]"
            style={SHIMMER_STYLE}
          />
          <span
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
            style={INNER_SHADOW_STYLE}
          />
          <motion.span
            className="relative z-30 flex items-center justify-center drop-shadow-sm w-[50%] h-[50%]"
            initial={{ rotate: -15 }} // A bit upside tilted
            animate={{ rotate: isHovered ? 45 : -15 }} 
            transition={SPRING_ROTATE}
          >
            <ArrowUpRight strokeWidth={2.5} className="w-full h-full" /> 
          </motion.span>
        </motion.div>
      </button>
    );
  }
);

SlidingButton.displayName = "SlidingButton";
