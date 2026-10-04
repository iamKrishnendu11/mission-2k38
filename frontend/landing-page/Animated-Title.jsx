"use client";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export const AnimatedTitle = ({ children, containerClass }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const titleAnimation = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "100 bottom",
                    end: "center bottom",
                    toggleActions: "play none none reverse",
                },
            });

            titleAnimation.to(".animated-word", {
                opacity: 1,
                transform: "translate3d(0,0,0) rotateY(0deg) rotateX(0deg)",
                ease: "power2.inOut",
                stagger: 0.03,
                duration: 1,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`animated-title ${containerClass || ""}`}
        >
            {children
                ?.toString()
                .split("<br />")
                .map((line, index) => (
                    <h1
                        key={index}
                        className="flex flex-wrap justify-center gap-2 px-6 md:gap-3"
                    >
                        {line.split(" ").map((word, i) => (
                            <span
                                key={i}
                                className="animated-word inline-block opacity-0"
                                dangerouslySetInnerHTML={{ __html: word }}
                                style={{
                                    transform:
                                        "translate3d(10px,50px,0) rotateY(60deg) rotateX(-40deg)",
                                }}
                            />
                        ))}
                    </h1>
                ))}
        </div>
    );
};