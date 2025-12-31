"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps extends Omit<HTMLMotionProps<"div">, "viewport"> {
    children: ReactNode;
    type?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom";
    delay?: number;
    duration?: number;
    viewport?: boolean;
    className?: string;
}

const variants: Record<string, Variants> = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    "slide-up": {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    },
    "slide-down": {
        hidden: { opacity: 0, y: -30 },
        visible: { opacity: 1, y: 0 },
    },
    "slide-left": {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0 },
    },
    "slide-right": {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 },
    },
    zoom: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    },
};

export function Motion({
    children,
    type = "fade",
    delay = 0,
    duration = 0.5,
    viewport = true,
    ...props
}: MotionProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView={viewport ? "visible" : undefined}
            animate={!viewport ? "visible" : undefined}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            variants={variants[type]}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({
    children,
    delayChildren = 0,
    staggerChildren = 0.1,
    className,
    ...props
}: {
    children: ReactNode;
    delayChildren?: number;
    staggerChildren?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren,
                        delayChildren,
                    },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
