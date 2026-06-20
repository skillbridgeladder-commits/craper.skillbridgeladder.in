'use client'

import { motion } from 'framer-motion'

export default function TermsPage() {
    return (
        <>
            <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Terms & <span className="text-grad">Conditions</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            <section className="w-full" style={{ paddingBottom: '80px' }}>
                <div className="container-main" style={{ maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="glass">
                        <div className="space-y-8 text-white/40 text-sm leading-relaxed font-light">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                                <p>By using Skill Scraper, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
                                <p>Skill Scraper is a lead generation tool that allows users to extract business information from Google Maps. We provide both a browser extension and an online dashboard.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">3. User Responsibilities</h2>
                                <p>Users are responsible for how they use the data extracted. You must comply with all local and international laws regarding data privacy, spam, and telemarketing.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
                                <p>The Skill Scraper software, including code, design, and logos, is the exclusive property of SkillBridge Ladder. Unauthorized copying, reverse engineering, or redistribution is strictly prohibited and protected by law.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">5. Credit System & Payments</h2>
                                <p>Payments for credit packs are final. Credits are added to your account after manual verification of your payment screenshot. We reserve the right to refuse service to anyone suspected of fraudulent activity.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability</h2>
                                <p>Skill Scraper is provided &quot;as is&quot;. We are not responsible for any data loss, account suspension by third-party platforms (like Google), or business damages resulting from the use of our tool.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
                                <p>For legal inquiries, contact us at contact.skillbridgeladder@gmail.com</p>
                            </section>
                        </div>
                    </motion.div>

                    <p className="mt-8 text-center text-[11px] text-white/15 font-light">
                        © 2026 Skill Scraper. Last updated: March 2026
                    </p>
                </div>
            </section>
        </>
    )
}
