'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const faqs = [
    {
        category: 'Getting Started',
        icon: '🚀',
        items: [
            { q: "How do I install the extension?", a: "Download the ZIP bundle from your dashboard, extract it, go to chrome://extensions, enable Developer Mode, and click 'Load Unpacked'. Select the extracted folder and you're done!" },
            { q: "Which browsers are supported?", a: "Skill Scraper works on Chrome, Brave, Edge, and any other Chromium-based browser. Firefox is not currently supported." },
            { q: "Do I need to create an account?", a: "You can search for leads without an account, but you need to login to export/download the data as CSV or Excel." },
        ]
    },
    {
        category: 'Credits & Billing',
        icon: '💳',
        items: [
            { q: "How do credits work?", a: "1 lead exported = 1 credit used. Free users get 200 credits to start. Buy more credits via the Upgrade page using UPI and upload your screenshot for verification." },
            { q: "How long does verification take?", a: "Our admin team manually verifies payment screenshots. This usually takes 1–24 hours. You'll receive an email confirmation once your credits are added." },
            { q: "Do credits expire?", a: "Purchased credits never expire. Free credits reset every 30 days." },
            { q: "What if my payment was rejected?", a: "Please ensure your screenshot clearly shows the transaction ID, amount, and recipient UPI ID. Re-upload at /upload-payment or contact support." },
        ]
    },
    {
        category: 'Enterprise',
        icon: '⚡',
        items: [
            { q: "How do I activate my enterprise key?", a: "After logging into the extension, enter your Enterprise Key in the 'Enter Enterprise Key' input field in the popup and click Activate. You'll get unlimited exports." },
            { q: "What does the Enterprise AI Hub do?", a: "The AI Hub lets you train the AI with your custom sales methods and scripts, then use it as an intelligent sales assistant that remembers your previous conversations." },
            { q: "Can I use the Enterprise plan on multiple machines?", a: "Yes. Your enterprise key is tied to your account, not a device. Log in on any machine with the extension installed." },
        ]
    },
    {
        category: 'Referrals',
        icon: '🤝',
        items: [
            { q: "How does the referral program work?", a: "Share your unique referral link from the Referrals page. When someone signs up using your link, you earn 50 Skillcoins after admin verification." },
            { q: "When do I get my referral credits?", a: "An admin must verify the referral first to prevent abuse. Once verified, 50 credits are automatically added to your account." },
            { q: "How do I find my referral link?", a: "Go to the Referrals page (scraper.skillbridgeladder.in/referrals) or click 'Copy Referral Link' in your dashboard." },
        ]
    },
    {
        category: 'Technical',
        icon: '🔧',
        items: [
            { q: "The extension shows a 404 error on the dashboard page.", a: "Go to chrome://extensions, find Skill Scraper, and click the reload icon. This refreshes the extension and clears any stale state." },
            { q: "Why do I need to log in every time?", a: "If the auto-sync is working correctly, you should stay logged in. Make sure you're visiting your dashboard at least once after each browser restart — it syncs your session automatically." },
            { q: "My leads aren't showing after scraping.", a: "Make sure you scroll down on Google Maps while the extension is running. The extension scrapes results as they appear on screen." },
            { q: "Is my data secure?", a: "Yes. Skill Scraper only stores your account info and credit balance in Supabase. The leads you scrape are downloaded directly to your computer — we never store them." },
        ]
    },
]

export default function HelpPage() {
    const [search, setSearch] = useState('')
    const [openItems, setOpenItems] = useState<Set<string>>(new Set())

    const toggleItem = (key: string) => {
        setOpenItems(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const filtered = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0)

    return (
        <>
            <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Help <span className="text-grad-cyan">Center</span>
                        </h1>
                        <p className="text-white/35 text-[16px] font-light max-w-[480px] mx-auto mb-8">
                            Find answers instantly or contact our support team.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-lg mx-auto relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all text-[15px]"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="w-full" style={{ paddingBottom: '80px' }}>
                <div className="container-main" style={{ maxWidth: '800px' }}>

                    {filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass text-center py-16">
                            <div className="text-4xl mb-4">🤷</div>
                            <p className="text-white/40">No results for &quot;{search}&quot;</p>
                            <button onClick={() => setSearch('')} className="mt-4 text-sm text-cyan-400 underline">Clear search</button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-8">
                            {filtered.map((cat, ci) => (
                                <motion.div key={ci} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <h2 className="text-lg font-bold text-white/80">{cat.category}</h2>
                                    </div>
                                    <div className="grid gap-3">
                                        {cat.items.map((item, ii) => {
                                            const key = `${ci}-${ii}`
                                            const isOpen = openItems.has(key)
                                            return (
                                                <div key={ii} className="glass !p-0 overflow-hidden cursor-pointer" onClick={() => toggleItem(key)}>
                                                    <div className="flex items-center justify-between px-6 py-4 gap-4">
                                                        <h3 className="text-[15px] font-semibold text-white/90">{item.q}</h3>
                                                        <span className="text-white/40 text-lg shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                                    </div>
                                                    <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}>
                                                                <div className="px-6 pb-5 pt-0 text-sm text-white/50 leading-relaxed border-t border-white/5">
                                                                    {item.a}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Contact CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="glass mt-12 text-center !border-[var(--border-accent)] shadow-[0_0_30px_rgba(0,240,255,0.06)]">
                        <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
                        <p className="text-white/35 font-light mb-6">Our support team usually replies within a few hours.</p>
                        <Link href="/contact" className="btn-glow !px-10">📧 Contact Support</Link>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
