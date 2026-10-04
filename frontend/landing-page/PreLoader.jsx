"use client";
import React, { useEffect, useState } from "react";
import { FlipFadeText } from "@/components/ui/flip-fade-text";

const Preloader = ({ isLoading, setIsLoading }) => {
    const [screen, setScreen] = useState(1); // 1 = "Who are we?", 2 = "CHAMPIONS"
    const [screenVisible, setScreenVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Hide scrollbar visually but keep overflow-x:hidden so GSAP can still
        // measure the full scroll height and real element positions.
        document.documentElement.style.scrollbarWidth = "none"; // Firefox
        const styleTag = document.createElement("style");
        styleTag.id = "preloader-no-scrollbar";
        styleTag.textContent = "html::-webkit-scrollbar { display: none; } body::-webkit-scrollbar { display: none; }";
        document.head.appendChild(styleTag);

        // Fade in screen 1
        const fadeInTimer = setTimeout(() => {
            setScreenVisible(true);
        }, 100);

        // Transition to screen 2 after 2s
        const screen2Timer = setTimeout(() => {
            setScreenVisible(false);
            setTimeout(() => {
                setScreen(2);
                setScreenVisible(true);
            }, 600); // crossfade gap
        }, 2000);

        // Fade out entire loader after screen 2 shows for ~1.8s
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
                setIsLoading(false);
                // Restore scrollbar
                document.documentElement.style.scrollbarWidth = "";
                document.getElementById("preloader-no-scrollbar")?.remove();
            }, 800);
        }, 4200);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(screen2Timer);
            clearTimeout(fadeOutTimer);
            document.documentElement.style.scrollbarWidth = "";
            document.getElementById("preloader-no-scrollbar")?.remove();
        };
    }, [setIsLoading]);

    if (!isLoading) return null;

    return (
        <div
            className={`fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center transition-opacity duration-[800ms] ease-in-out ${isFadingOut ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px",
                }}
            />

            {/* Screen 1: Who are we? */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-[600ms] ease-in-out ${screen === 1 && screenVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Small label */}
                <p
                    className="text-white/40 uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-6"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    Mission 2K38
                </p>

                {/* Big animated "WHO ARE WE?" via FlipFadeText */}
                <FlipFadeText
                    words={["WHO ARE WE?"]}
                    interval={99999}
                    textClassName="text-white font-black tracking-tight text-[clamp(3rem,10vw,8rem)]"
                    className="min-h-0"
                    letterDuration={0.5}
                    staggerDelay={0.07}
                    exitStaggerDelay={0.04}
                />

                {/* Progress bar */}
                <div className="mt-8 w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white/60 rounded-full"
                        style={{
                            animation: "loaderBar 2s ease-in-out forwards",
                        }}
                    />
                </div>
            </div>

            {/* Screen 2: CHAMPIONS */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-[600ms] ease-in-out ${screen === 2 && screenVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Small eyebrow */}
                <p
                    className="text-white/40 uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-6"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    We are
                </p>

                {/* Big "CHAMPIONS" word */}
                <FlipFadeText
                    words={["CHAMPIONS"]}
                    interval={99999}
                    textClassName="text-white font-black tracking-widest text-[clamp(3.5rem,12vw,10rem)]"
                    className="min-h-0"
                    letterDuration={0.6}
                    staggerDelay={0.08}
                    exitStaggerDelay={0.04}
                />

                {/* Yellow accent dots */}
                <div className="mt-8 flex gap-2 items-center">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-1 rounded-full bg-yellow-400"
                            style={{
                                width: i === 2 ? "2.5rem" : "0.5rem",
                                opacity: 0,
                                animation: `fadeSlideIn 0.4s ease forwards`,
                                animationDelay: `${0.6 + i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes loaderBar {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Preloader;
