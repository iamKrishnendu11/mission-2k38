"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            autoResize: true,
            prevent: (node) => {
                return (
                    node.classList?.contains("overflow-y-auto") ||
                    node.classList?.contains("overflow-auto") ||
                    node.tagName === "CANVAS" ||
                    node.getAttribute("data-lenis-prevent") !== null
                );
            }
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const animId = requestAnimationFrame(raf);

        // Observe DOM height changes to dynamically update scroll height
        const resizeObserver = new ResizeObserver(() => {
            lenis.resize();
        });

        if (typeof document !== "undefined" && document.body) {
            resizeObserver.observe(document.body);
        }

        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
