"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { HiMenuAlt4 } from "react-icons/hi";
import Image from "next/image";

const Navbar = () => {
    const router = useRouter();
    const navContainerRef = useRef(null);
    const menuRef = useRef(null);
    const tl = useRef(null);

    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ===== TOGGLE YOUTUBE VIDEO SOUND =====
    const toggleAudioIndicator = () => {
        const player = window.ytPlayer;
        if (player) {
            if (player.isMuted()) {
                player.unMute();
                setIsAudioPlaying(true);
            } else {
                player.mute();
                setIsAudioPlaying(false);
            }
        }
    };

    // ===== SCROLL EFFECT =====
    useEffect(() => {
        let lastScrollValue = 0;
        let isCurrentlyVisible = true;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY === 0) {
                if (!isCurrentlyVisible) {
                    setIsNavVisible(true);
                    isCurrentlyVisible = true;
                }
            } else if (currentScrollY > lastScrollValue) {
                if (isCurrentlyVisible) {
                    setIsNavVisible(false);
                    isCurrentlyVisible = false;
                }
            } else {
                if (!isCurrentlyVisible) {
                    setIsNavVisible(true);
                    isCurrentlyVisible = true;
                }
            }

            lastScrollValue = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // ===== GSAP NAVBAR ANIMATION =====
    useEffect(() => {
        gsap.to(navContainerRef.current, {
            y: isNavVisible ? 0 : -100,
            opacity: isNavVisible ? 1 : 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }, [isNavVisible]);

    // ===== GSAP FULLSCREEN MENU ANIMATION =====
    useEffect(() => {
        tl.current = gsap.timeline({ paused: true });

        // Animate overlay in
        tl.current.to(menuRef.current, {
            autoAlpha: 1, // handles visibility and opacity
            duration: 0.5,
            ease: "power3.inOut",
        });

        // Stagger text animation
        tl.current.fromTo(
            ".menu-item",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
            "-=0.2"
        );
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            tl.current.play();
        } else {
            tl.current.reverse();
        }
    }, [isMenuOpen]);

    return (
        <>
            {/* ===== MAIN NAVBAR ===== */}
            <header
                ref={navContainerRef}
                className="fixed top-0 left-0 z-[100] w-full px-6 py-6"
            >
                <nav className="mx-auto flex w-full items-center justify-between">
                    
                    {/* ===== LEFT LOGO SECTION ===== */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center drop-shadow-md">
                            <Image src="/logo.png" alt="Mission 2K38" width={48} height={48} className="object-contain" />
                        </div>
                        <div className="flex flex-col text-white text-[10px] uppercase leading-tight drop-shadow-md">
                            <span className="font-medium tracking-widest opacity-80">presented by</span>
                            <span className="font-bold tracking-[0.2em]">algo rhythm</span>
                        </div>
                    </div>

                    {/* ===== RIGHT CONTROLS ===== */}
                    <div className="flex items-center gap-3">
                        {/* Login Button */}
                        <button
                            onClick={() => router.push("/login")}
                            className="hidden items-center justify-center rounded-full bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20 transition-all hover:bg-white hover:text-black md:flex"
                        >
                            Login
                        </button>

                        {/* Audio Toggle */}
                        <button
                            onClick={toggleAudioIndicator}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105"
                            title={isAudioPlaying ? "Mute Video" : "Unmute Video"}
                            aria-label={isAudioPlaying ? "Mute Video" : "Unmute Video"}
                        >
                            {isAudioPlaying ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
                        </button>

                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105"
                        >
                            <HiMenuAlt4 size={24} />
                        </button>
                    </div>
                </nav>
            </header>

            {/* ===== FULL SCREEN MENU OVERLAY ===== */}
            <div
                ref={menuRef}
                className="fixed inset-0 z-[200] flex flex-col bg-[#e5e5e5] px-6 py-6 md:px-12 md:py-8 invisible"
            >
                {/* Menu Header */}
                <div className="flex w-full items-center justify-between text-black">
                    <span className="text-sm font-bold uppercase tracking-widest">
                        Mission 2K38
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
                    >
                        Close
                    </button>
                </div>

                {/* Menu Links */}
                <div className="flex h-full flex-col justify-center gap-2 pt-10">
                    {["About", "History", "Pricing", "Login"].map((item, idx) => (
                        <a
                            key={idx}
                            href={item === "Login" ? "/login" : `#${item.toLowerCase()}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="menu-item text-6xl font-serif uppercase tracking-tighter text-black transition-transform hover:translate-x-4 md:text-[8rem] lg:text-[10rem] xl:text-[11rem] leading-[0.85]"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Watermark */}
                <div className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm">
                    Mission 2K38
                </div>
            </div>
        </>
    );
};

export default Navbar;