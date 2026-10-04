"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NextImage from "next/image";
import { AnimatedTitle } from "./Animated-Title";
import Image from "../public/login/images/stadium.png";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const container = useRef(null);

    useGSAP(
        () => {
            const clipAnimation = gsap.timeline({
                scrollTrigger: {
                    trigger: "#clip",
                    start: "center center",
                    end: "+=1000 center",
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                },
            });

            clipAnimation.to(".mask-clip-path", {
                width: "100%",
                height: "100%",
                borderRadius: 0,
                ease: "power2.inOut",
            });
        },
        { scope: container }
    );

    return (
        <section
            ref={container}
            id="about"
            className="min-h-screen w-full bg-white text-black"
        >
            {/* TOP CONTENT */}
            <div className="relative flex flex-col items-center justify-center gap-6 py-32 text-center text-black min-h-[50vh]">
                <p className="font-general text-sm uppercase md:text-[10px] relative z-10">
                    Welcome to Mission 2K38
                </p>

                <AnimatedTitle
                    containerClass="
    mt-8
    mx-auto
    max-w-[1500px]
    text-center
    uppercase
    font-black
    text-5xl
    sm:text-6xl
    md:text-7xl
    lg:text-[8rem]
    leading-[0.9]
    tracking-[-0.05em]
    text-black
  "
                >
                    {"Empowering India's<br /> Next Football Generation"}
                </AnimatedTitle>

                <div className="about-subtext space-y-3 text-gray-700 text-sm md:text-base max-w-2xl px-6">
                    <p>
                        Connecting players, coaches, scouts, and clubs on one platform to
                        unlock football talent across India.
                    </p>

                    <p>
                        From grassroots dreams to professional opportunities, we&apos;re building
                        the future of Indian football—one player at a time.
                    </p>
                </div>
            </div>

            {/* IMAGE SECTION */}
            <div id="clip" className="relative h-screen w-full">
                <div
                    className="
            mask-clip-path
            relative
            overflow-hidden
            rounded-[40px]
            w-[300px]
            h-[400px]
            md:w-[500px]
            md:h-[600px]
            mx-auto
          "
                >
                    <NextImage
                        src={Image}
                        alt="Gaming World"
                        className="absolute top-0 left-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/30" />
                </div>
            </div>
        </section>
    );
};

export default About;