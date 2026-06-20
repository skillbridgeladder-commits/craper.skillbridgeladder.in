'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, PLANS, PlanKey } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserPlan {
    plan: PlanKey
    quota: number
    used: number
    cycle_start?: string
    email?: string
    full_name?: string
    referral_code?: string
}

const ADMIN_EMAILS = ['contact.skillbridgeladder@gmail.com', 'skillbridgeladder@gmail.com']

export default function DashboardPage() {
    const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [plan, setPlan] = useState<UserPlan | null>(null)
    const [pendingPayment, setPendingPayment] = useState<{ plan_requested: string; created_at: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
        if (ADMIN_EMAILS.includes(user.email || '')) setIsAdmin(true)

        const { data } = await supabase.from('user_plans').select('*').eq('user_id', user.id).single()
        setPlan(data || { plan: 'free', quota: 200, used: 0 })

        // Check for pending payments
        const { data: pendingData } = await supabase.from('payment_requests')
            .select('plan_requested, created_at')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        if (pendingData) setPendingPayment(pendingData)

        setLoading(false)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
        </div>
    )

    const currentPlan = plan ? PLANS[plan.plan] || PLANS.free : PLANS.free
    const usedPercent = plan ? Math.min(100, (plan.used / plan.quota) * 100) : 0
    const remaining = plan ? plan.quota - plan.used : 200

    return (
        <div className="w-full relative z-10">
            {/* Dashboard Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
                style={{ background: 'rgba(3, 0, 20, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="Skill Scraper" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-lg font-bold tracking-tight">Skill Scraper</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <Link href="/admin" className="hidden sm:flex text-[13px] font-bold tracking-wider uppercase items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors">
                                ⚙️ Admin Panel
                            </Link>
                        )}
                        <span className="text-sm text-white/40 hidden sm:block">{user?.email}</span>
                        <button onClick={handleLogout} className="btn-ghost !py-2.5 !px-5 !text-[13px]">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="container-main" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }} className="font-black tracking-[-0.03em] mb-3">
                        Welcome Back, <span className="text-grad-cyan">{plan?.full_name || user?.email || 'Scraper'}</span>
                    </h1>
                    <p className="text-white/35 text-[16px] font-light">
                        Here&apos;s an overview of your current usage and plan details.
                    </p>
                </motion.div>

                {/* Pending Payment Banner */}
                {pendingPayment && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-2xl p-5 flex items-center gap-4 border border-yellow-500/20"
                        style={{ background: 'rgba(255, 180, 0, 0.06)' }}>
                        <div className="text-3xl">⏳</div>
                        <div className="flex-1">
                            <div className="text-yellow-400 font-semibold text-sm mb-0.5">Payment Under Review</div>
                            <p className="text-white/35 text-xs font-light">
                                Your <span className="text-white/60 font-medium">{PLANS[pendingPayment.plan_requested as keyof typeof PLANS]?.name || pendingPayment.plan_requested}</span> upgrade
                                is being verified. This usually takes 1-24 hours.
                            </p>
                        </div>
                        <div className="text-xs text-white/20 shrink-0">
                            {new Date(pendingPayment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    {/* Usage Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="md:col-span-8 glass-sm relative overflow-hidden p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="text-xs uppercase tracking-[0.2em] font-bold text-white/40 mb-6">Quota Usage</div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-7xl font-black tracking-tighter text-white">{plan?.used || 0}</span>
                            <span className="text-xl font-medium text-white/40 mb-2">/ {plan?.plan === 'enterprise' ? '∞' : plan?.quota} Leads</span>
                        </div>

                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${usedPercent}%` }} transition={{ delay: 0.4, duration: 1 }}
                                className={`h-full rounded-full relative ${usedPercent > 90 ? 'bg-[#ff0055]' : usedPercent > 70 ? 'bg-[#ffb400]' : 'bg-[#00f0ff]'}`}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </motion.div>
                        </div>

                        <div className="flex justify-between items-center text-sm font-medium text-white/35">
                            <span>{usedPercent.toFixed(1)}% Used</span>
                            <span>{plan?.plan === 'enterprise' ? 'Unlimited' : remaining} Exports Remaining</span>
                        </div>
                    </motion.div>

                    {/* Plan Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="md:col-span-4 glass-sm p-8 flex flex-col justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-[0.2em] font-bold text-white/40 mb-6">Active Plan</div>
                            <div className="text-4xl font-black text-grad-cyan mb-2 capitalize">{currentPlan.name}</div>
                            <div className="text-sm font-medium text-white/50 leading-relaxed mb-6">{currentPlan.label}</div>
                        </div>

                        {plan?.plan !== 'enterprise' ? (
                            <Link href="/upgrade" className="btn-glow w-full text-center !text-[14px] mb-4">
                                Upgrade Plan 🚀
                            </Link>
                        ) : (
                            <div className="py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold mb-4"
                                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                                ✅ Enterprise Key Active
                            </div>
                        )}

                        {plan?.plan !== 'enterprise' && (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    const code = (e.currentTarget.elements.namedItem('keycode') as HTMLInputElement).value
                                    if (!code) return
                                    const { data: { session } } = await supabase.auth.getSession()
                                    if (!session) return

                                    const res = await fetch('/api/ext/activate-key', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${session.access_token}`
                                        },
                                        body: JSON.stringify({ key_code: code })
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                        alert(data.message)
                                        window.location.reload()
                                    } else {
                                        alert(data.error || 'Failed to activate key')
                                    }
                                }}
                                className="mt-auto pt-4 border-t border-white/10"
                            >
                                <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider mb-2 block">Unlocks Full Enterprise Access</label>
                                <div className="flex gap-2">
                                    <input type="text" name="keycode" placeholder="Paste Master Key..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50" />
                                    <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">
                                        Activate
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Installation Guide */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-sm p-8">
                        <h3 className="text-xl font-bold mb-6 tracking-tight text-white">Installation Guide</h3>
                        <ul className="space-y-6">
                            {[
                                { step: '1', title: 'Download Bundle', desc: 'Get the latest version locally.' },
                                { step: '2', title: 'Developer Mode', desc: 'Visit chrome://extensions and enable it.' },
                                { step: '3', title: 'Load Unpacked', desc: 'Select the unzipped folder.' }
                            ].map((s, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center font-bold text-sm border border-[#00f0ff]/20 shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white/90 mb-1">{s.title}</div>
                                        <div className="text-sm font-light text-white/35">{s.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass-sm p-8 flex flex-col justify-center gap-4">
                        <h3 className="text-xl font-bold mb-2 tracking-tight text-white">Quick Actions</h3>

                        <a href="/skill-scraper-v2.0.0.zip" download
                            className="btn-glow w-full !justify-start !pl-6 !gap-4 !py-4 !text-[15px]"
                            style={{ boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}>
                            <span className="text-xl">⬇️</span> Download Extension Bundle (v2.0)
                        </a>
                        <Link href="/upload-payment" className="btn-ghost w-full !justify-start !pl-6 !gap-4 !text-[14px]">
                            <span className="text-xl">💳</span> Upload Payment Verification
                        </Link>
                        {plan?.plan === 'enterprise' ? (
                            <Link href="/enterprise" className="btn-glow w-full !justify-start !pl-6 !gap-4 !text-[14px]" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: '#22c55e' }}>
                                <span className="text-xl">🧠</span> Open AI Enterprise Hub
                            </Link>
                        ) : (
                            <Link href="/upgrade" className="btn-ghost w-full !justify-start !pl-6 !gap-4 !text-[14px]">
                                <span className="text-xl">🛍️</span> Browse Upgrade Packages
                            </Link>
                        )}
                    </motion.div>
                </div>

                {/* Referral Invite Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-sm mt-6 p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(0,240,255,0.03))' }} />
                    <div className="flex-1 relative z-10">
                        <h3 className="text-xl font-bold mb-2 text-white">🎁 Invite Friends, Get Skillcoins!</h3>
                        <p className="text-white/50 text-sm font-medium">
                            Share your referral link. Get <span className="text-[#00f0ff] font-bold">50 free Skillcoins</span> when they sign up.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0 relative z-10">
                        <button
                            onClick={() => {
                                const link = `https://scraper.skillbridgeladder.in/login?ref=${plan?.referral_code || user?.id?.slice(0, 8)}`
                                navigator.clipboard.writeText(link)
                                alert('Referral link copied!')
                            }}
                            className="btn-glow !py-3 !px-6 !text-[13px] whitespace-nowrap">
                            📋 Copy Referral Link
                        </button>
                        <button
                            onClick={() => {
                                const link = `https://scraper.skillbridgeladder.in/login?ref=${plan?.referral_code || user?.id?.slice(0, 8)}`
                                const text = encodeURIComponent(`Hey! I'm using Skill Scraper for my business. ${user?.email ? `It's me, ${user.email}. ` : ''}Try it out and get free Skillcoins when you sign up using my link: ${link}`)
                                window.open(`https://wa.me/?text=${text}`, '_blank')
                            }}
                            className="bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 transition-all rounded-full font-bold tracking-wider uppercase flex items-center justify-center gap-2 !py-3 !px-6 !text-[13px] whitespace-nowrap">
                            💬 Share on WhatsApp
                        </button>
                    </div>
                </motion.div>


            </div>
        </div>
    )
}
