"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-400/10 blur-[120px] dark:bg-primary-600/5"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -80, 0],
                    y: [0, 100, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-600/5"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 50, 0],
                    y: [0, -70, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[110px] dark:bg-indigo-600/5"
            />
        </div>
    );
}
