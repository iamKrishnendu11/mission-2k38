// "use client";

// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { FaArrowRight } from "react-icons/fa";

// gsap.registerPlugin(ScrollTrigger);

// const Footer = () => {
//     const footerRef = useRef(null);
//     const marqueeRef = useRef(null);

//     useEffect(() => {
//         // Continuous marquee animation
//         gsap.to(marqueeRef.current, {
//             xPercent: -50,
//             repeat: -1,
//             duration: 10,
//             ease: "linear",
//         });

//         // Entrance animation for the giant text (Cinematic floor reveal)
//         gsap.fromTo(
//             ".footer-text-char",
//             { y: "150%" },
//             {
//                 y: "0%",
//                 stagger: 0.04,
//                 duration: 1,
//                 ease: "power2.inOut",
//                 scrollTrigger: {
//                     trigger: footerRef.current,
//                     start: "top 60%",
//                     toggleActions: "play none none reverse",
//                 },
//             }
//         );

//         // Entrance animation for the overlay button
//         gsap.fromTo(
//             ".footer-contact-btn",
//             { scale: 0, opacity: 0 },
//             {
//                 scale: 1,
//                 opacity: 1,
//                 duration: 0.8,
//                 delay: 0.2,
//                 ease: "sine.inOut",
//                 scrollTrigger: {
//                     trigger: footerRef.current,
//                     start: "top 60%",
//                     toggleActions: "play none none reverse",
//                 },
//             }
//         );
//     }, []);

//     const giantText = "MISSION 2K38".split("");

//     return (
//         <footer
//             ref={footerRef}
//             className="relative bg-black text-white w-full flex flex-col justify-between pt-10 z-20 rounded-t-[40px]"
//             style={{ minHeight: "100vh" }}
//         >
//             {/* Top accent line */}
//             <div className="absolute top-0 left-0 w-full h-px bg-white/10" />

//             <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-10">
//                 <p className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-6">Ready to work?</p>

//                 {/* Giant Text */}
//                 <div className="relative flex justify-center items-center w-full max-w-[1400px] mx-auto mt-10 md:mt-16">
//                     <h1 className="text-[14vw] md:text-[13vw] whitespace-nowrap leading-none text-yellow-400 font-semibold uppercase flex transform scale-y-[1.8] tracking-tighter">
//                         {giantText.map((char, index) => (
//                             <span key={index} className="footer-text-char inline-block origin-bottom">
//                                 {char === " " ? "\u00A0" : char}
//                             </span>
//                         ))}
//                     </h1>

//                     {/* Overlay Button */}
//                     <button
//                         onClick={() => window.open('mailto:05rajprithvi@gmail.com')}
//                         className="footer-contact-btn absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 bg-black border-2 border-white/20 rounded-full pl-6 md:pl-10 pr-2 py-2 group hover:border-yellow-400 transition-colors z-20 cursor-pointer"
//                     >
//                         <span className="text-xl md:text-4xl font-light tracking-wide uppercase">Contact</span>
//                         <div className="bg-yellow-400 text-black p-2 md:p-4 rounded-full group-hover:scale-110 group-hover:bg-white group-hover:-rotate-45 transition-all duration-300">
//                             <FaArrowRight size={24} />
//                         </div>
//                     </button>
//                 </div>

//                 {/* Links */}
//                 <div className="mt-12 flex gap-4 md:gap-8 text-xs md:text-base font-semibold uppercase tracking-wider text-gray-300">
//                     <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
//                     <span className="text-yellow-400">✦</span>
//                     <a href="#" className="hover:text-yellow-400 transition-colors">About</a>
//                     <span className="text-yellow-400">✦</span>
//                     <a href="#" className="hover:text-yellow-400 transition-colors">Projects</a>
//                     <span className="text-yellow-400">✦</span>
//                     <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
//                 </div>
//             </div>

//             {/* Bottom Section */}
//             <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2">
//                 <div className="p-8 md:p-12 flex items-center justify-center md:justify-start">
//                     <p className="text-xs md:text-sm text-gray-400 max-w-sm uppercase leading-relaxed text-center md:text-left">
//                         Got some exciting ideas? Let's connect and create something extraordinary together!
//                     </p>
//                 </div>

//                 {/* Marquee */}
//                 <div className="overflow-hidden flex items-center relative h-full min-h-[100px] md:min-h-[150px]">
//                     <div ref={marqueeRef} className="flex whitespace-nowrap opacity-80">
//                         {Array.from({ length: 4 }).map((_, i) => (
//                             <h1 key={i} className="special-font text-5xl md:text-7xl px-4 uppercase">
//                                 <b>MISSION 2K38</b> <span className="text-yellow-400 mx-4 font-sans text-3xl md:text-5xl">✦</span>
//                             </h1>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Very Bottom */}
//             <div className="w-full px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
//                 <div className="flex items-center gap-2">
//                     <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center opacity-70">
//                         <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                     </div>
//                 </div>

//                 <div className="flex flex-wrap justify-center gap-3 md:gap-4">
//                     {['Behance', 'LinkedIn', 'Instagram', 'X'].map((social) => (
//                         <a key={social} href="#" className="border border-white/30 rounded-full px-4 md:px-6 py-2 hover:bg-white hover:text-black transition-colors">
//                             {social}
//                         </a>
//                     ))}
//                 </div>

//                 <p>Crafted by <span className="text-yellow-400 font-bold">ALGO RHYTHM</span></p>
//             </div>
//         </footer>
//     );
// };

// export default Footer;




"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaArrowRight } from "react-icons/fa";
import { FaInstagram, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { Mail } from "lucide-react";
import CursorGrid from "@/components/ui/CursorGrid";

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: FaInstagram, href: "https://www.instagram.com/__algo.rhythm__?igsh=bHg3dDRrcm1xMGlz", label: "Instagram" },
  { icon: FaXTwitter, href: "https://x.com/algo_rhythm_onX", label: "X" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/company/algo-rhythm006/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:algorhythm006@gmail.com", label: "Email" }
];

const Footer = () => {
    const footerRef = useRef(null);
    const marqueeRef = useRef(null);

    useEffect(() => {
        // Continuous marquee animation
        gsap.to(marqueeRef.current, {
            xPercent: -50,
            repeat: -1,
            duration: 10,
            ease: "linear",
        });

        // Entrance animation for the giant text
        gsap.fromTo(
            ".footer-text-char",
            { y: "150%" },
            {
                y: "0%",
                stagger: 0.04,
                duration: 1,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
            }
        );

        // Entrance animation for the overlay button
        gsap.fromTo(
            ".footer-contact-btn",
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                delay: 0.2,
                ease: "sine.inOut",
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    }, []);

    const giantText = "MISSION 2K38".split("");

    return (
        <footer
            ref={footerRef}
            className="relative overflow-hidden bg-black text-white w-full flex flex-col justify-between pt-10 z-20 rounded-t-[40px]"
            style={{ minHeight: "100vh" }}
        >
            {/* Cursor Grid Background */}
            <div className="absolute inset-0 z-0">
                <CursorGrid
                    className="absolute inset-0 w-full h-full"
                    cellSize={70}
                    color="#808080"
                    radius={140}
                    falloff="smooth"
                    holdTime={400}
                    fadeDuration={800}
                    lineWidth={1.2}
                    maxOpacity={1}
                    fillOpacity={0}
                    gridOpacity={0.12}
                    cellRadius={0}
                    clickPulse
                    pulseSpeed={1500}
                />
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-white/10 z-10" />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-10">
                <p className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-6">
                    Ready to work?
                </p>

                {/* Giant Text */}
                <div className="relative flex justify-center items-center w-full max-w-[1400px] mx-auto mt-10 md:mt-16">
                    <h1 className="text-[14vw] md:text-[13vw] whitespace-nowrap leading-none text-yellow-400 font-semibold uppercase flex transform scale-y-[1.8] tracking-tighter">
                        {giantText.map((char, index) => (
                            <span
                                key={index}
                                className="footer-text-char inline-block origin-bottom"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        ))}
                    </h1>

                    {/* Overlay Button */}
                    <button
                        onClick={() => window.open("mailto:algorhythm006@gmail.com")}
                        className="footer-contact-btn absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 bg-black border-2 border-white/20 rounded-full pl-6 md:pl-10 pr-2 py-2 group hover:border-yellow-400 transition-colors z-20 cursor-pointer"
                    >
                        <span className="text-xl md:text-4xl font-light tracking-wide uppercase">
                            Contact
                        </span>

                        <div className="bg-yellow-400 text-black p-2 md:p-4 rounded-full group-hover:scale-110 group-hover:bg-white group-hover:-rotate-45 transition-all duration-300">
                            <FaArrowRight size={24} />
                        </div>
                    </button>
                </div>

                {/* Links */}
                <div className="mt-12 flex gap-4 md:gap-8 text-xs md:text-base font-semibold uppercase tracking-wider text-gray-300">
                    <a href="#" className="hover:text-yellow-400 transition-colors">
                        Home
                    </a>
                    <span className="text-yellow-400">✦</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">
                        About
                    </a>
                    <span className="text-yellow-400">✦</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">
                        Projects
                    </a>
                    <span className="text-yellow-400">✦</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">
                        Contact
                    </a>
                </div>
            </div>



            {/* Bottom Section */}
            <div className="relative z-10 w-full mt-8 grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex items-center justify-center md:justify-start">
                    <p className="text-xs md:text-sm text-gray-400 max-w-sm uppercase leading-relaxed text-center md:text-left">
                        Got some exciting ideas? Let&apos;s connect and create something
                        extraordinary together!
                    </p>
                </div>

                {/* Marquee */}
                <div className="overflow-hidden flex items-center relative h-full min-h-[100px] md:min-h-[150px]">
                    <div ref={marqueeRef} className="flex whitespace-nowrap opacity-80">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <h1
                                key={i}
                                className="special-font text-5xl md:text-7xl px-4 uppercase"
                            >
                                <b>MISSION 2K38</b>
                                <span className="text-yellow-400 mx-4 font-sans text-3xl md:text-5xl">
                                    ✦
                                </span>
                            </h1>
                        ))}
                    </div>
                </div>
            </div>

            {/* Very Bottom */}
            <div className="relative z-10 w-full px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center opacity-70">
                        <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 border border-white/30 rounded-full px-4 md:px-6 py-2 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all font-semibold"
                            >
                                <Icon size={16} />
                                <span>{social.label}</span>
                            </a>
                        );
                    })}
                </div>

                <p>
                    Crafted by{" "}
                    <span className="text-yellow-400 font-bold">ALGO RHYTHM</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;