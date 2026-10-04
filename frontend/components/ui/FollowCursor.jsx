"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const FollowCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" });

        const moveCursor = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference hidden md:block"
        />
    );
};

export default FollowCursor;
