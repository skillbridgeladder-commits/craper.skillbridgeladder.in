'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DownloadPage() {
    return (
        <div className="w-full min-h-screen relative overflow-hidden" style={{ background: '#0a0f1a' }}>
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'linear-gradient(to right, #00f0ff, #7c3aed)' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #7c3aed, #00f0ff)' }} />

            {/* Header */}
            <section className="w-full relative z-10" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Install in <span className="text-grad-cyan">3 Steps</span>
                        </h1>
                        <p className="text-white/50 text-[16px] font-light max-w-[460px] mx-auto leading-relaxed">
                            Your lead generation machine is one click away.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps */}
            <section className="w-full relative z-10" style={{ paddingBottom: '60px' }}>
                <div className="container-main" style={{ maxWidth: '960px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { num: '01', title: 'Download ZIP', desc: 'Click the button below to get the extension bundle.', icon: '📥' },
                            { num: '02', title: 'Developer Mode', desc: 'Open chrome://extensions and toggle "Developer mode" on.', icon: '🔧' },
                            { num: '03', title: 'Load Extension', desc: 'Click "Load Unpacked" and select the unzipped folder.', icon: '🚀' },
                        ].map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                                className="glass-sm p-8 text-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                                <div className="absolute -top-3 -right-1 text-[80px] font-black select-none leading-none transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.02)' }}>
                                    {step.num}
                                </div>
                                <div className="relative z-10">
                                    <div className="text-4xl mb-5">{step.icon}</div>
                                    <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                                    <p className="text-white/50 font-medium text-[14px] leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download CTA */}
            <section className="w-full relative z-10" style={{ paddingBottom: '120px' }}>
                <div className="container-main" style={{ maxWidth: '640px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="glass-sm p-12 sm:p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,240,255,0.03), transparent)' }} />
                        <div className="relative z-10">
                            <div className="text-5xl mb-6" style={{ animation: 'float-up 3s ease-in-out infinite' }}>⬇️</div>
                            <h3 className="text-3xl font-bold mb-4 text-white">Ready to scrape?</h3>
                            <p className="text-white/50 font-medium mb-10 text-[16px]">
                                Free to install. Latest fixes included.
                            </p>
                            <a href="/skill-scraper-v2.0.0.zip" download className="btn-glow !text-[17px] !py-4 !px-12 w-full sm:w-auto">
                                Download Extension (v2.0.0) - Latest
                            </a>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h4 className="text-[14px] text-white/50 mb-3 font-medium">Previous Versions</h4>
                                <div className="flex flex-col gap-2 w-full max-w-[240px] mx-auto">
                                    <a href="/skill-scraper-v1.7.4.zip" download className="text-[13px] py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-white/5 flex justify-between items-center">
                                        <span>v1.7.4</span>
                                        <span className="text-[11px] opacity-50">.zip</span>
                                    </a>
                                    <a href="/skill-scraper-v1.7.3.zip" download className="text-[13px] py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-white/5 flex justify-between items-center">
                                        <span>v1.7.3</span>
                                        <span className="text-[11px] opacity-50">.zip</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Requirements */}
                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { label: 'Browser', val: 'Chrome, Edge, Brave' },
                            { label: 'OS', val: 'Win / Mac / Linux' },
                            { label: 'Size', val: '< 2 MB' },
                        ].map((r, i) => (
                            <div key={i} className="glass-sm p-5 text-center">
                                <div className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">{r.label}</div>
                                <div className="text-[14px] text-white/90 font-semibold">{r.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
