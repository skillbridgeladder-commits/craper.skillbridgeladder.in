'use client'

import { motion } from 'framer-motion'

export default function PrivacyPage() {
    return (
        <>
            <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Privacy <span className="text-grad-cyan">Policy</span>
                        </h1>
                        <p className="text-white/35 text-[16px] font-light">Last updated: March 2026</p>
                    </motion.div>
                </div>
            </section>

            <section className="w-full" style={{ paddingBottom: '80px' }}>
                <div className="container-main" style={{ maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="glass">
                        <div className="space-y-8 text-white/40 text-sm leading-relaxed font-light">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                                <p className="mb-2">We collect the following information when you use Skill Scraper:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong className="text-white/60">Account data:</strong> Email address and password (encrypted)</li>
                                    <li><strong className="text-white/60">Usage data:</strong> Credit balance and export counts</li>
                                    <li><strong className="text-white/60">Payment data:</strong> Transaction IDs and payment screenshots</li>
                                    <li><strong className="text-white/60">Support data:</strong> Messages submitted through the contact form</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">2. What We Don&apos;t Collect</h2>
                                <p>We do <strong className="text-white/60">NOT</strong> store the leads, phone numbers, emails, or business data you scrape. All scraped data is downloaded directly to your computer and never passes through our servers.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>To authenticate your account and manage your subscription</li>
                                    <li>To process and verify your payments</li>
                                    <li>To respond to support requests</li>
                                    <li>To prevent fraud and abuse</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">4. Data Storage & Security</h2>
                                <p>Your data is stored securely on Supabase (powered by PostgreSQL) with encryption at rest. Passwords are hashed using industry-standard algorithms. We use HTTPS for all data transmission.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong className="text-white/60">Supabase:</strong> Authentication and database</li>
                                    <li><strong className="text-white/60">Vercel:</strong> Website hosting</li>
                                    <li><strong className="text-white/60">Google Fonts:</strong> Typography (Outfit font)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">6. Cookies</h2>
                                <p>We use essential cookies for authentication only. We do not use tracking cookies, analytics cookies, or advertising cookies.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
                                <p className="mb-2">You have the right to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Request a copy of your data</li>
                                    <li>Request deletion of your account and all associated data</li>
                                    <li>Opt out of any communications</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">8. Data Retention</h2>
                                <p>We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">9. Contact</h2>
                                <p>For privacy-related inquiries, email us at <a href="mailto:contact.skillbridgeladder@gmail.com" className="text-[#00f0ff] hover:underline">contact.skillbridgeladder@gmail.com</a></p>
                            </section>
                        </div>
                    </motion.div>

                    <p className="mt-8 text-center text-[11px] text-white/15 font-light">
                        © 2026 Skill Scraper by SkillBridge Ladder. All rights reserved.
                    </p>
                </div>
            </section>
        </>
    )
}
