'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, PLANS, PlanKey } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UpgradePage() {
    const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
    const [currentPlan, setCurrentPlan] = useState<PlanKey>('free')
    const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
        const { data } = await supabase.from('user_plans').select('plan').eq('user_id', user.id).single()
        if (data) setCurrentPlan(data.plan as PlanKey)
    }

    const UPI_ID = 'skillscaper@indie'

    return (
        <div className="w-full relative z-10">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
                style={{ background: 'rgba(3, 0, 20, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="Skill Scraper" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-lg font-bold tracking-tight">Skill Scraper</span>
                    </Link>
                    <Link href="/dashboard" className="btn-ghost !py-2.5 !px-5 !text-[13px]">← Dashboard</Link>
                </div>
            </nav>

            <div className="container-main" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }} className="font-black tracking-[-0.03em] mb-3">
                        Buy <span className="text-grad-cyan">Credits</span>
                    </h1>
                    <p className="text-white/35 text-[16px] font-light mb-10">
                        Purchase export credits to download your scraped leads. Credits never expire.
                    </p>
                </motion.div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {Object.entries(PLANS).map(([key, plan], i) => {
                        const planKey = key as PlanKey
                        const isCurrent = planKey === currentPlan
                        const isEnterprise = planKey === 'enterprise'
                        const isSelected = selectedPlan === planKey

                        return (
                            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className={`glass cursor-pointer transition-all duration-300 ${isSelected ? '!border-[var(--accent)] shadow-[0_0_25px_rgba(0,240,255,0.15)]' : ''} ${planKey === 'pro' ? '!border-purple-500/40' : ''} ${isCurrent ? '!border-green-500/30' : ''}`}
                                onClick={() => !isEnterprise && !isCurrent && setSelectedPlan(planKey)}>

                                {planKey === 'pro' && (
                                    <div className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full inline-block mb-3">BEST VALUE</div>
                                )}
                                {isCurrent && (
                                    <div className="text-xs font-bold text-green-400 bg-green-500/15 px-2.5 py-1 rounded-full inline-block mb-3">CURRENT</div>
                                )}

                                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                <div className="text-3xl font-black mb-1">
                                    {isEnterprise ? 'Custom' : plan.price === 0 ? 'Free' : `₹${plan.price}`}
                                </div>
                                <p className="text-xs text-white/25 mb-5">{isEnterprise ? 'Contact for pricing' : plan.quota.toLocaleString() + ' credits'}</p>

                                <ul className="space-y-2.5 mb-5">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="text-xs text-white/40 flex items-start gap-2">
                                            <span className="text-green-400 mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>

                                {isEnterprise ? (
                                    <a href="mailto:contact@skillbridgeladder.in" className="btn-ghost w-full text-center !text-sm !py-2.5 block">
                                        📧 Contact Us
                                    </a>
                                ) : isCurrent ? (
                                    <div className="text-sm py-2.5 px-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-center font-medium">
                                        ✓ Active
                                    </div>
                                ) : (
                                    <button onClick={() => setSelectedPlan(planKey)}
                                        className={isSelected ? 'btn-glow w-full !text-sm !py-2.5' : 'btn-ghost w-full !text-sm !py-2.5'}>
                                        {plan.price === 0 ? 'Current Plan' : 'Select'}
                                    </button>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Payment Section */}
                {selectedPlan && PLANS[selectedPlan].price > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass max-w-lg mx-auto !border-[var(--border-accent)] shadow-[0_0_30px_rgba(0,240,255,0.08)]">
                        <h2 className="text-xl font-bold mb-2 text-center">💳 Complete Payment</h2>
                        <p className="text-center text-white/35 text-sm mb-6">
                            Pay <span className="text-[#00f0ff] font-bold text-lg">₹{PLANS[selectedPlan].price}</span> for
                            <span className="text-white font-semibold"> {PLANS[selectedPlan].quota.toLocaleString()} credits</span>
                        </p>

                        <div className="text-center mb-6">
                            <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-3 mb-4 flex items-center justify-center">
                                <img src="/skillscraper.jpeg" alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
                            </div>
                            <p className="text-sm text-white/35 mb-1">Scan to Pay via UPI</p>
                            <p className="text-xs text-white/20">Scan with any UPI app to pay</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 mb-6 text-center">
                            <p className="text-xs text-white/25 mb-1">Or pay directly to UPI ID</p>
                            <p className="text-lg font-mono text-[#00f0ff] font-bold">{UPI_ID}</p>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-white/35 mb-4">After payment, upload your screenshot:</p>
                            <Link href={`/upload-payment?plan=${selectedPlan}`} className="btn-glow w-full text-center block">
                                📸 Upload Payment Screenshot
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
