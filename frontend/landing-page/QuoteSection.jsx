// "use client";

// import React, { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }

// export default function QuoteSection() {
//   const containerRef = useRef(null);
//   const scrollSectionRef = useRef(null);

//   useEffect(() => {
//     const scrollSection = scrollSectionRef.current;
//     const container = containerRef.current;
//     if (!scrollSection || !container) return;

//     let ctx = gsap.context(() => {
//       // Precise calculation of total horizontal distance to travel
//       const getScrollAmount = () => {
//         const amount = scrollSection.scrollWidth - window.innerWidth;
//         console.log("GSAP QuoteSection debugging:", {
//           scrollWidth: scrollSection.scrollWidth,
//           innerWidth: window.innerWidth,
//           scrollAmount: amount
//         });
//         return amount;
//       };

//       // 1. UNIFIED MASTER PIN & HORIZONTAL SCROLL TIMELINE
//       // All animations are bound to this single trigger to guarantee perfect scroll locking
//       const masterTl = gsap.timeline({
//         scrollTrigger: {
//           trigger: container,
//           start: "top top",
//           end: () => `+=${getScrollAmount()}`,
//           pin: true,
//           scrub: 1, // Smoothly ties the animation directly to scroll speed
//           invalidateOnRefresh: true,
//         },
//       });

//       // Move the section horizontally
//       masterTl.to(scrollSection, {
//         x: () => -getScrollAmount(),
//         ease: "none",
//       }, 0);

//       // 2. INTEGRATED PARALLAX MICRO-ANIMATIONS
//       // Added at timeline position 0 so they execute seamlessly alongside the horizontal scroll
//       masterTl.to(".parallax-star-1", {
//         rotation: 360,
//         y: -50,
//         scale: 1.15,
//         ease: "none"
//       }, 0);

//       masterTl.to(".parallax-star-2", {
//         rotation: -180,
//         x: 60,
//         y: 20,
//         ease: "none"
//       }, 0);

//       masterTl.to(".parallax-star-3", {
//         rotation: 270,
//         scale: 0.8,
//         ease: "none"
//       }, 0);

//       masterTl.to(".parallax-football-globe", {
//         rotation: 220,
//         x: -40,
//         ease: "none"
//       }, 0);

//       masterTl.to(".parallax-pill-block", {
//         rotation: 1,
//         scale: 1.04,
//         ease: "none"
//       }, 0);


//       // 3. SEPARATE ENTRANCE REVEAL (Fades container up safely on entry)
//       gsap.fromTo(
//         scrollSection,
//         { opacity: 0, y: 50 },
//         {
//           opacity: 1,
//           y: 0,
//           duration: 1.2,
//           ease: "power3.out",
//           scrollTrigger: {
//             trigger: container,
//             start: "top 85%",
//             toggleActions: "play none none none",
//           },
//         }
//       );

//       // Loop animation for the infinite subtle chevron movement
//       gsap.to(".looping-chevron", {
//         x: 30,
//         repeat: -1,
//         yoyo: true,
//         duration: 1.2,
//         ease: "power1.inOut"
//       });

//     }, container); // Scopes class queries directly to this wrapper instance

//     return () => ctx.revert();
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       className="relative z-10 w-full h-screen overflow-hidden bg-[#FBFBFB] select-none"
//     >
//       {/* Premium Cinematic Film Grain Overlay */}
//       <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noiseFilter%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/></svg>')]"></div>

//       {/* Track Layout Container */}
//       <div
//         ref={scrollSectionRef}
//         className="flex h-screen w-max items-center justify-start px-[12vw] will-change-transform"
//       >
//         {/* Generous right padding (pr-[25vw]) allows the final text and arrow to clear the screen comfortably before unpinning */}
//         <div className="flex items-center space-x-[5vw] md:space-x-[6vw] lg:space-x-[8vw] whitespace-nowrap pr-[25vw]">

//           {/* SVG 1: Sparkle Star (Yellow) */}
//           <div className="parallax-star-1 w-[7vw] h-[7vw] max-w-[90px] max-h-[90px] text-[#FFDE00] flex-shrink-0 will-change-transform">
//             <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
//               <path d="M12 0L14.8L21.2 3.8L19.2 10.8L24 15.6L16.8 16.4L12 24L7.2 16.4L0 15.6L4.8 10.8L2.8 3.8L9.2 3.8L12 0Z" />
//             </svg>
//           </div>

//           {/* Text: Gali se */}
//           <h2 className="font-serif font-light uppercase text-[11vw] md:text-[13vw] lg:text-[15vw] tracking-tight text-[#111111] leading-none">
//             Gali se
//           </h2>

//           {/* SVG 2: Modernist Cross/Star (Black) */}
//           <div className="parallax-star-2 w-[5vw] h-[5vw] max-w-[65px] max-h-[65px] text-black flex-shrink-0 will-change-transform">
//             <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
//               <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z" />
//             </svg>
//           </div>

//           {/* Highlighted Styled block: ग्लोबल */}
//           <div className="parallax-pill-block inline-block bg-[#FFDE00] text-black font-serif font-medium uppercase text-[10vw] md:text-[12vw] lg:text-[14vw] tracking-tight leading-none px-[6vw] py-[2.5vh] rounded-[2.5rem] md:rounded-[4.5rem] lg:rounded-[6rem] rotate-[-1deg] shadow-[0_15px_35px_rgba(255,222,0,0.25)] will-change-transform transform-gpu">
//             ग्लोबल
//           </div>

//           {/* SVG 3: Wireframe Tactical Football/Globe */}
//           <div className="parallax-football-globe w-[9vw] h-[9vw] max-w-[125px] max-h-[125px] text-black flex-shrink-0 will-change-transform">
//             <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full opacity-90">
//               <circle cx="50" cy="50" r="45" />
//               <path d="M50 5C68 20 68 80 50 95" />
//               <path d="M50 5C32 20 32 80 50 95" />
//               <path d="M5 50H95" />
//               <path d="M12 25C25 38 75 38 88 25" />
//               <path d="M12 75C25 62 75 62 88 75" />
//             </svg>
//           </div>

//           {/* Text: tak */}
//           <h2 className="font-serif font-light uppercase text-[11vw] md:text-[13vw] lg:text-[15vw] tracking-tight text-[#111111] leading-none">
//             tak
//           </h2>

//           {/* SVG 4: Mini Star Burst */}
//           <div className="parallax-star-3 w-[4vw] h-[4vw] max-w-[50px] max-h-[50px] text-black opacity-40 flex-shrink-0 will-change-transform">
//             <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
//               <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
//             </svg>
//           </div>

//           {/* SVG 5: Campaign Directional Chevron Arrow */}
//           <div className="looping-chevron w-[8vw] h-[8vw] max-w-[100px] max-h-[100px] text-black flex-shrink-0">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
//               <line x1="5" y1="12" x2="19" y2="12"></line>
//               <polyline points="12 5 19 12 12 19"></polyline>
//             </svg>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function QuoteSection() {
  const containerRef = useRef(null);
  const scrollSectionRef = useRef(null);

  useEffect(() => {
    const scrollSection = scrollSectionRef.current;
    const container = containerRef.current;
    if (!scrollSection || !container) return;

    let ctx = gsap.context(() => {
      // Dynamic mathematical calculation of the exact scroll track length
      const getScrollAmount = () => {
        return scrollSection.scrollWidth - window.innerWidth;
      };

      // 1. THE BULLETPROOF MASTER TIMELINE
      // Pinning true + pinSpacing true forces the browser to freeze vertical movement
      // until this exact timeline completely exhausts its scroll width distance.
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          pinSpacing: true,
          scrub: 1, // Smooth 1-second catchup delay for buttery kinetic tracking
          invalidateOnRefresh: true, // Recalculates dynamically if screen resizes
        },
      });

      // Horizontal track translation linked to the master timeline
      masterTl.to(scrollSection, {
        x: () => -getScrollAmount(),
        ease: "none",
      }, 0);

      // 2. TIMELINE-LINKED PARALLAX VECTOR ANIMATIONS
      // All inserted at position 0 so they scale perfectly relative to the main scrollbar
      masterTl.to(".parallax-star-yellow", {
        rotation: 360,
        y: -60,
        scale: 1.15,
        ease: "none"
      }, 0);

      masterTl.to(".parallax-star-black", {
        rotation: -180,
        x: 50,
        y: 20,
        ease: "none"
      }, 0);

      masterTl.to(".parallax-football-globe", {
        rotation: 240,
        x: -40,
        ease: "none"
      }, 0);

      masterTl.to(".parallax-pill-block", {
        rotation: 2,
        scale: 1.05,
        ease: "none"
      }, 0);

      masterTl.to(".parallax-star-mini", {
        rotation: 180,
        scale: 0.75,
        ease: "none"
      }, 0);

      // 3. INFINITE LOOP INTERACTION (Independent of scroll positioning)
      gsap.to(".looping-chevron", {
        x: 25,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: "power1.inOut"
      });

    }, container); // Scopes class lookups strictly to this container element layout

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full h-screen overflow-hidden bg-[#FBFBFB] select-none"
    >
      {/* Premium Cinematic Film Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noiseFilter%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/></svg>')]"></div>

      {/* Track Layout Container */}
      <div
        ref={scrollSectionRef}
        className="flex h-screen w-max items-center justify-start px-[12vw] will-change-transform"
      >
        {/* Massive right padding buffer (pr-[40vw]) ensures the complete layout sequence 
            is completely exposed, readable, and clear before the page can unpin vertically.
        */}
        <div className="flex items-center space-x-[5vw] md:space-x-[6vw] lg:space-x-[8vw] whitespace-nowrap pr-[40vw]">

          {/* SVG 1: Sparkle Star (Yellow) */}
          <div className="parallax-star-yellow w-[7vw] h-[7vw] max-w-[90px] max-h-[90px] text-[#FFDE00] flex-shrink-0 will-change-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
              <path d="M12 0L14.8L21.2 3.8L19.2 10.8L24 15.6L16.8 16.4L12 24L7.2 16.4L0 15.6L4.8 10.8L2.8 3.8L9.2 3.8L12 0Z" />
            </svg>
          </div>

          {/* Text: Gali se */}
          <h2 className="font-serif font-light uppercase text-[11vw] md:text-[13vw] lg:text-[15vw] tracking-tight text-[#111111] leading-none">
            Gali   se
          </h2>

          {/* SVG 2: Modernist Cross/Star (Black) */}
          <div className="parallax-star-black w-[5vw] h-[5vw] max-w-[65px] max-h-[65px] text-black flex-shrink-0 will-change-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z" />
            </svg>
          </div>

          {/* Highlighted Styled block: ग्लोबल */}
          <div className="parallax-pill-block inline-block bg-[#FFDE00] text-black font-serif font-medium uppercase text-[10vw] md:text-[12vw] lg:text-[14vw] tracking-tight leading-none px-[6vw] py-[2.5vh] rounded-[2.5rem] md:rounded-[4.5rem] lg:rounded-[6rem] rotate-[-1deg] shadow-[0_15px_35px_rgba(255,222,0,0.25)] will-change-transform transform-gpu">
            ग्लोबल
          </div>

          {/* SVG 3: Wireframe Tactical Football/Globe */}
          <div className="parallax-football-globe w-[9vw] h-[9vw] max-w-[125px] max-h-[125px] text-black flex-shrink-0 will-change-transform">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full opacity-90">
              <circle cx="50" cy="50" r="45" />
              <path d="M50 5C68 20 68 80 50 95" />
              <path d="M50 5C32 20 32 80 50 95" />
              <path d="M5 50H95" />
              <path d="M12 25C25 38 75 38 88 25" />
              <path d="M12 75C25 62 75 62 88 75" />
            </svg>
          </div>

          {/* Text: tak */}
          <h2 className="font-serif font-light uppercase text-[11vw] md:text-[13vw] lg:text-[15vw] tracking-tight text-[#111111] leading-none">
            tak
          </h2>

          {/* SVG 4: Mini Star Burst */}
          <div className="parallax-star-mini w-[4vw] h-[4vw] max-w-[50px] max-h-[50px] text-black opacity-40 flex-shrink-0 will-change-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
            </svg>
          </div>

          {/* SVG 5: Campaign Directional Chevron Arrow */}
          <div className="looping-chevron w-[8vw] h-[8vw] max-w-[100px] max-h-[100px] text-black flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}