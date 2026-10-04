
"use client";

import { useEffect, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
    const [isMuted, setIsMuted] = useState(true);

    useGSAP(() => {
        gsap.set("#video-frame", {
            clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
            borderRadius: "0% 0% 40% 10%",
        });

        gsap.from("#video-frame", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            borderRadius: "0% 0% 0% 0%",
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: "#hero",
                start: "center center",
                end: "bottom center",
                scrub: true,
            },
        });
    });

    useEffect(() => {
        if (document.getElementById("yt-api-script")) return;

        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            window.ytPlayer = new window.YT.Player("yt-player", {
                events: {
                    onReady: (event) => {
                        event.target.mute();
                        event.target.playVideo();
                    },
                },
            });
        };
    }, []);

    return (
        <section
            id="hero"
            className="relative h-screen w-full bg-white"
        >
            <div
                id="video-frame"
                className="relative h-screen w-full overflow-hidden bg-white"
            >
                {/* Background Video */}
                <iframe
                    id="yt-player"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: "177.78vh",
                        height: "56.25vw",
                        minWidth: "100%",
                        minHeight: "100%",
                    }}
                    src="https://www.youtube.com/embed/JnwB4w18Xoo?enablejsapi=1&autoplay=1&mute=1&controls=0&loop=1&playlist=JnwB4w18Xoo&modestbranding=1&rel=0&showinfo=0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Left Content */}
                <div className="absolute top-24 left-5 sm:top-32 sm:left-10 z-10 flex flex-col justify-start">
                    <h1 className="special-font text-6xl uppercase leading-none text-white md:text-[10rem]">
                        <b>MISSION</b>
                    </h1>

                    <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-white md:text-lg">
                        Enter the Metagame Layer
                        <br />
                        Unleash the Play Economy
                    </p>

                    <button className="mt-8 flex w-fit items-center gap-2 rounded-full bg-yellow-300 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all duration-300 hover:scale-105">
                        <TiLocationArrow size={18} />
                        Learn More
                    </button>
                </div>

                {/* Bottom Right Text */}
                <h1 className="special-font absolute bottom-5 right-5 z-10 select-none text-6xl uppercase leading-none text-white/80 sm:bottom-10 sm:right-10 md:text-[10rem]">
                    <b>2K38</b>
                </h1>
            </div>
        </section>
    );
};

export default HeroSection;