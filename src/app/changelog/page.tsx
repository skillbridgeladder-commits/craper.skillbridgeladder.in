'use client'

import { motion } from 'framer-motion'

const versions = [
    {
        version: 'v2.0.0',
        date: 'March 2026',
        tag: 'Latest',
        changes: [
            { type: 'new', text: 'Complete dashboard redesign with glassmorphism UI' },
            { type: 'new', text: 'Mobile-friendly hamburger navigation menu' },
            { type: 'new', text: 'Google OAuth sign-in support' },
            { type: 'new', text: 'Contact & support form with ticket tracking' },
            { type: 'new', text: 'Privacy policy and Terms of Service pages' },
            { type: 'new', text: 'SEO optimization with sitemap and Open Graph' },
            { type: 'improved', text: 'Admin panel with stats dashboard and image preview' },
            { type: 'improved', text: 'Payment flow with pending status tracking' },
            { type: 'fixed', text: 'React hooks violation in Navbar component' },
        ]
    },
    {
        version: 'v1.7.3',
        date: 'February 2026',
        changes: [
            { type: 'new', text: 'Versioned extension downloads' },
            { type: 'new', text: 'Manual credit granting in admin' },
            { type: 'improved', text: 'Extension authentication flow via JWT' },
            { type: 'fixed', text: 'Export functionality and login redirects' },
        ]
    },
    {
        version: 'v1.7.2',
        date: 'February 2026',
        changes: [
            { type: 'new', text: 'WhatsApp number extraction from business profiles' },
            { type: 'new', text: 'Email & social media discovery via website crawling' },
            { type: 'improved', text: 'Scraping speed and accuracy' },
            { type: 'improved', text: 'CSV/XLSX export with enriched data columns' },
        ]
    },
    {
        version: 'v1.0.0',
        date: 'January 2026',
        changes: [
            { type: 'new', text: 'Initial release of Skill Scraper' },
            { type: 'new', text: 'Google Maps business data extraction' },
            { type: 'new', text: 'Credit-based export system' },
            { type: 'new', text: 'Free tier with 200 monthly credits' },
        ]
    },
]

const typeConfig = {
    new: { emoji: '🆕', color: '#22c55e', label: 'New' },
    improved: { emoji: '✨', color: '#00f0ff', label: 'Improved' },
    fixed: { emoji: '🐛', color: '#f59e0b', label: 'Fixed' },
}

export default function ChangelogPage() {
    return (
        <>
            <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            What&apos;s <span className="text-grad-cyan">New</span>
                        </h1>
                        <p className="text-white/35 text-[16px] font-light max-w-[480px] mx-auto">
                            Follow our journey as we build the best Google Maps scraping tool.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="w-full" style={{ paddingBottom: '80px' }}>
                <div className="container-main" style={{ maxWidth: '740px' }}>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06] hidden sm:block" />

                        {versions.map((v, i) => (
                            <motion.div key={v.version} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="relative mb-8 sm:pl-16">

                                {/* Timeline dot */}
                                <div className="absolute left-[18px] top-7 w-3 h-3 rounded-full hidden sm:block"
                                    style={{ background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.15)', boxShadow: i === 0 ? '0 0 12px var(--accent)' : 'none' }} />

                                <div className="glass">
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className="text-xl font-black">{v.version}</span>
                                        <span className="text-xs text-white/25 font-medium">{v.date}</span>
                                        {v.tag && (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                                style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,240,255,0.2)' }}>
                                                {v.tag}
                                            </span>
                                        )}
                                    </div>
                                    <ul className="space-y-2.5">
                                        {v.changes.map((c, j) => {
                                            const cfg = typeConfig[c.type as keyof typeof typeConfig]
                                            return (
                                                <li key={j} className="flex items-start gap-2.5 text-sm">
                                                    <span className="text-xs mt-0.5">{cfg.emoji}</span>
                                                    <span className="text-white/45 font-light">{c.text}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
