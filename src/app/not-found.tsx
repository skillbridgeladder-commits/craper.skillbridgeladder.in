'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
    return (
        <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
            <div className="container-main flex flex-col items-center text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="text-8xl mb-6" style={{ filter: 'grayscale(0.3)' }}>🌌</div>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }} className="font-black tracking-[-0.04em] mb-4">
                        <span className="text-grad">404</span>
                    </h1>
                    <p className="text-xl font-medium text-white/50 mb-2">Page Not Found</p>
                    <p className="text-white/25 font-light max-w-[400px] mx-auto mb-10">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/" className="btn-glow">Go Home</Link>
                        <Link href="/contact" className="btn-ghost">Contact Support</Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
