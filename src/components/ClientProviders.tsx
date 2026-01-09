"use client";

import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "react-hot-toast";
import { AmbientBackground } from "@/components/AmbientBackground";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SessionProvider>
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
                <Toaster position="top-right" />
            </SessionProvider>
        </ThemeProvider>
    );
}
