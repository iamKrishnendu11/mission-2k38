"use client";

import { useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";

const VIDEO_LINKS = {
    feature1: "/videos/kick.mp4",
    feature2: "https://93w95scdts.ufs.sh/f/AOfILeWJzqCclcn5JiTo8NUtBfpgkOmXZ2CT3DjMr19Yqlac",
    feature3: "https://93w95scdts.ufs.sh/f/AOfILeWJzqCcbZvH6O7fXDrfMZ6S457EQsgoxTCIz1kjlnVd",
    feature4: "https://93w95scdts.ufs.sh/f/AOfILeWJzqCcSrGHFCyiMbxBtTacUmFzn4dZpwVYNfvR6WLg",
    feature5: "/videos/bts-gp.mp4",
};

const BentoTilt = ({ children, className = "" }) => {
    const itemRef = useRef(null);

    const handleMouseMove = (e) => {
        const item = itemRef.current;
        if (!item) return;

        const { left, top, width, height } = item.getBoundingClientRect();

        const relativeX = (e.clientX - left) / width;
        const relativeY = (e.clientY - top) / height;

        const tiltX = (relativeY - 0.5) * 5;
        const tiltY = (relativeX - 0.5) * -5;

        item.style.transform = `
            perspective(700px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale3d(0.98,0.98,0.98)
        `;
    };

    const handleMouseLeave = () => {
        const item = itemRef.current;
        if (!item) return;
        item.style.transform = "";
    };

    return (
        <div
            ref={itemRef}
            className={`transition-transform duration-300 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

const BentoCard = ({ src, title, description }) => {
    return (
        <article className="relative h-full w-full overflow-hidden rounded-3xl">
            <video
                src={src}
                loop
                muted
                autoPlay
                playsInline
                className="absolute top-0 left-0 h-full w-full object-cover"
            />

            <div className="relative z-10 flex h-full flex-col justify-between bg-black/50 p-6 text-white">
                <div>
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-wide leading-snug">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-3 max-w-xs text-xs md:text-sm text-gray-300 font-medium leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
};

const Features = () => {
    return (
        <section className="bg-black pb-40 text-white">
            <div className="mx-auto max-w-[1400px] px-4 md:px-10">
                {/* TOP TEXT */}
                <div className="py-20 md:py-28">
                    <span className="text-yellow-400 text-xs md:text-sm font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                        MISSION 2K38 ECOSYSTEM
                    </span>

                    <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tight leading-[0.95] text-white max-w-5xl">
                        REVOLUTIONIZING <span className="text-yellow-400">FOOTBALL</span> WITH AI INTELLIGENCE
                    </h1>

                    <p className="mt-6 max-w-3xl text-base md:text-xl text-gray-300 font-normal leading-relaxed">
                        Empowering Indian grassroots football with real-time computer vision match tracking, dynamic FIFA-style scout cards, and personalized AI coaching.
                    </p>
                </div>

                {/* BIG CARD */}
                <BentoTilt className="mb-8 h-[70vh] overflow-hidden rounded-3xl border border-white/10">
                    <BentoCard
                        src={VIDEO_LINKS.feature1}
                        title={
                            <>
                                AI-Powered Football <span className="text-yellow-400">Performance Analysis</span>
                            </>
                        }
                        description="Computer vision and MediaPipe tracking to analyze match highlights, shot speed, sprint velocity, and player movement."
                    />
                </BentoTilt>

                {/* GRID */}
                <div className="grid auto-rows-[300px] grid-cols-1 gap-7 md:grid-cols-2">
                    <BentoTilt className="md:row-span-2 h-[620px] overflow-hidden rounded-3xl border border-white/10">
                        <BentoCard
                            src={VIDEO_LINKS.feature2}
                            title={
                                <>
                                    Performance Trend & <span className="text-amber-400">Progress Analytics</span>
                                </>
                            }
                            description="Track your career statistics, ELO growth, match history, goals, assists, and skill radar development over time."
                        />
                    </BentoTilt>

                    <BentoTilt className="overflow-hidden rounded-3xl border border-white/10">
                        <BentoCard
                            src={VIDEO_LINKS.feature3}
                            title={
                                <>
                                    AI-Based Digital <span className="text-yellow-400">Player Card & Scouting</span>
                                </>
                            }
                            description="Generate FIFA-style dynamic scout cards and connect directly with verified scouts and academies across India."
                        />
                    </BentoTilt>

                    <BentoTilt className="overflow-hidden rounded-3xl border border-white/10">
                        <BentoCard
                            src={VIDEO_LINKS.feature4}
                            title={
                                <>
                                    Personalized AI Coach & <span className="text-amber-400">Training Recommendations</span>
                                </>
                            }
                            description="Custom AI-tailored tactical drills, feedback, and skill development plans based on your pitch performance."
                        />
                    </BentoTilt>

                    <BentoTilt className="flex min-h-[300px] items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 p-8">
                        <div className="flex h-full w-full flex-col justify-between">
                            <h1 className="special-font max-w-xs text-4xl font-black uppercase text-black md:text-5xl">
                                <b>M<span className="text-white">o</span>re co
                                    <span className="text-white">m</span>ing so
                                    <span className="text-white">o</span>n!</b>
                            </h1>

                            <TiLocationArrow className="self-end text-7xl text-black" />
                        </div>
                    </BentoTilt>

                    <BentoTilt className="overflow-hidden rounded-3xl border border-white/10">
                        <video
                            src={VIDEO_LINKS.feature5}
                            loop
                            muted
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                        />
                    </BentoTilt>
                </div>
            </div>
        </section>
    );
};

export default Features;