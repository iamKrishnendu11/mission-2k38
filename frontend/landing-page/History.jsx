"use client";

import React from 'react';
import { motion } from 'framer-motion';

// --- FadeIn Component Configurations ---
const variants = {
    hidden: (y) => ({
        opacity: 0,
        y,
    }),
    visible: (y) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1],
        },
    }),
};

// --- FadeIn Component ---
function FadeIn({
    children,
    delay = 0,
    duration = 0.7,
    x = 0,
    y = 30,
    className,
    style,
    as = 'div',
}) {
    const Component = React.useMemo(() => motion.create ? motion.create(as) : motion(as), [as]);

    return (
        <Component
            variants={{
                hidden: { opacity: 0, x, y },
                visible: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: { duration, ease: [0.25, 0.1, 0.25, 1], delay },
                },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "50px", amount: 0 }}
            className={className}
            style={style}
        >
            {children}
        </Component>
    );
}

// --- History Data ---
const history = [
    {
        number: '01',
        name: 'Inaugural Asian Games Gold (1951)',
        description: 'India won the first-ever football gold medal at the inaugural Asian Games hosted in New Delhi, defeating Iran 1–0 in the final.',
    },
    {
        number: '02',
        name: 'Olympic Semi-Finalists (1956)',
        description: 'The Blue Tigers achieved their greatest global feat by finishing fourth at the Melbourne Summer Olympics, highlighted by Neville D Souza becoming the first Asian player to score an Olympic hat-trick.',
    },
    {
        number: '03',
        name: 'Second Asian Games Gold (1962)',
        description: 'Under coach Syed Abdul Rahim, India claimed its second continental gold medal by defeating powerhouse South Korea 2–1 in the Jakarta final amidst intense pressure.',
    },
    {
        number: '04',
        name: 'AFC Asian Cup Runners-Up (1964)',
        description: 'In their maiden appearance at the continental championship hosted in Israel, India finished as runners-up in a round-robin format, securing their highest-ever finish.',
    },
    {
        number: '05',
        name: 'AFC Challenge Cup Triumph (2008)',
        description: 'Sparking a modern revival under coach Bob Houghton, India won the 2008 AFC Challenge Cup in Hyderabad—powered by a Sunil Chhetri hat-trick in the final—to end a 27-year absence from the AFC Asian Cup.',
    },
    {
        number: '06',
        name: 'Record 9th SAFF Championship Victory (2023)',
        description: 'Cementing regional dominance, India captured their 9th SAFF Championship title by edging out guest team Kuwait in a dramatic penalty shootout at Sree Kanteerava Stadium.',
    },
    {
        number: '07',
        name: 'Minerva Academy Stuns Liverpool 6–0 (2026)',
        description: 'Minerva Academy U-15 side delivered a historic performance by thrashing Liverpool FC youth team 6–0 at the Mediterranean International Cup in Spain, showcasing the immense potential of Indian grassroots football.',
    },
];

// --- Main History Section Component ---
export default function HistorySection() {
    return (
        <section
            className="flex flex-col px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]"
            style={{ backgroundColor: '#FFFFFF' }}
        >
            <h2
                className="font-black uppercase leading-none tracking-tight text-center w-full mb-16 sm:mb-20 md:mb-28"
                style={{ fontSize: 'clamp(3rem, 12vw, 160px)', color: '#0C0C0C' }}
            >
                History
            </h2>

            <div className="flex flex-col w-full items-center">
                {history.map((item, i) => (
                    <FadeIn
                        key={item.number}
                        delay={i * 0.1}
                        y={30}
                        className="flex flex-col items-center w-full max-w-5xl"
                    >
                        {i > 0 && (
                            <div
                                className="w-full"
                                style={{ borderTop: '1px solid rgba(12, 12, 12, 0.15)' }}
                            />
                        )}
                        <div className="flex items-start gap-6 sm:gap-8 md:gap-10 py-8 sm:py-10 md:py-12 w-full">
                            <span
                                className="font-black uppercase leading-none flex-shrink-0"
                                style={{ fontSize: 'clamp(3rem, 10vw, 140px)', color: '#0C0C0C' }}
                            >
                                {item.number}
                            </span>

                            <div className="flex flex-col gap-2 sm:gap-4 md:gap-5 pt-1">
                                <span
                                    className="font-medium uppercase"
                                    style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)', color: '#0C0C0C' }}
                                >
                                    {item.name}
                                </span>
                                <p
                                    className="leading-relaxed opacity-80"
                                    style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#0C0C0C' }}
                                >
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}