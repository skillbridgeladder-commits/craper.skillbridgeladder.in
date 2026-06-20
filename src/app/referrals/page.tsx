'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ReferralsPage() {
    const [referralLink, setReferralLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [stats, setStats] = useState({ total: 0, verified: 0, coins: 0 })
    const [shareClaimed, setShareClaimed] = useState(false)
    const [claiming, setClaiming] = useState(false)

    useEffect(() => {
        loadReferralData()
    }, [])

    async function loadReferralData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: plan } = await supabase
            .from('user_plans')
            .select('referral_code')
            .eq('user_id', user.id)
            .single()

        const code = plan?.referral_code || user.id.slice(0, 8).toUpperCase()
        setReferralLink(`https://scraper.skillbridgeladder.in/login?ref=${code}`)

        const { data: refs } = await supabase
            .from('referrals')
            .select('status, referred_email')
            .eq('referrer_id', user.id)

        if (refs) {
            const isClaimed = refs.some(r => r.referred_email === 'SHARED_REWARD')
            setShareClaimed(isClaimed)
            
            const actualRefs = refs.filter(r => r.referred_email !== 'SHARED_REWARD')
            const verified = actualRefs.filter(r => r.status === 'verified').length
            setStats({ total: actualRefs.length, verified, coins: verified * 50 })
        }
    }

    function handleCopy() {
        if (!referralLink) return
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleWhatsApp() {
        if (!referralLink) return
        const msg = encodeURIComponent(`🚀 Try Skill Scraper - the best B2B lead scraping tool!\n\nSign up free with my link and get started: ${referralLink}`)
        window.open(`https://wa.me/?text=${msg}`, '_blank')
    }

    async function handleClaimReward() {
        if (shareClaimed || claiming) return
        setClaiming(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/claim-share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: session.access_token })
            })
            const data = await res.json()
            if (data.success) {
                setShareClaimed(true)
                alert('🎉 Successfully claimed 20 Free Skillcoins!')
            } else {
                alert(data.error || 'Failed to claim reward.')
            }
        } catch (e) {
            alert('An error occurred while claiming.')
        } finally {
            setClaiming(false)
        }
    }

    return (
        <>
            <section className="w-full text-center" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Refer Friends, Earn <span className="text-grad-cyan">Skillcoins</span>
                        </h1>
                        <p className="text-white/50 text-[16px] font-light max-w-[520px] mx-auto leading-relaxed">
                            Share your unique Skill Scraper link with your network and earn <strong className="text-white">50 free credits</strong> for every successful signup.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="w-full" style={{ paddingBottom: '100px' }}>
                <div className="container-main" style={{ maxWidth: '900px' }}>
                
                    {/* Share Claim Banner */}
                    {referralLink && !shareClaimed && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                            className="glass-sm mb-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-[#7c3aed]/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6">
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                        🎁 Quick Claim: 20 Free Credits
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                        Click 'Share on WhatsApp' or copy your link to instantly claim 20 free credits right now!
                                    </p>
                                </div>
                                <button 
                                    onClick={handleClaimReward}
                                    disabled={claiming}
                                    className="btn-glow shrink-0 whitespace-nowrap !px-8"
                                >
                                    {claiming ? 'Claiming...' : 'Claim 20 Credits'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats Row */}
                    {referralLink && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                            {[
                                { label: 'Total Clicks/Referrals', value: stats.total, color: '#00f0ff' },
                                { label: 'Verified Signups', value: stats.verified, color: '#22c55e' },
                                { label: 'Credits Earned', value: stats.coins, color: '#a78bfa' },
                            ].map((s, i) => (
                                <div key={i} className="glass-sm text-center p-6 hover:-translate-y-1 transition-all">
                                    <div className="text-4xl font-black mb-2" style={{ color: s.color }}>{s.value}</div>
                                    <div className="text-sm text-white/50 font-medium uppercase tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Steps */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { step: '1', title: 'Share Your Link', desc: 'Copy your unique referral link below and send it to colleagues.' },
                            { step: '2', title: 'They Sign Up', desc: 'When they create a free account, our system tracks it.' },
                            { step: '3', title: 'You Get Rewarded', desc: 'Once verified, you automatically receive 50 Skillcoins!' }
                        ].map((s, i) => (
                            <div key={i} className="glass-sm p-8 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.03] text-[#00f0ff] flex items-center justify-center font-bold text-2xl border border-white/10 group-hover:border-[#00f0ff]/50 mb-5 shadow-inner transition-colors">
                                    {s.step}
                                </div>
                                <h3 className="font-bold text-white mb-3 text-lg">{s.title}</h3>
                                <p className="text-sm font-medium text-white/50 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Referral Link Box */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="glass p-10 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(124,58,237,0.1), transparent 70%)' }} />
                        <div className="relative z-10 w-full flex flex-col items-center">
                            <h2 className="text-3xl font-bold mb-3">Your Referral Link</h2>
                            <p className="text-white/50 text-base mb-8 text-center max-w-[500px]">
                                This is your unique tracking link. Share it everywhere.
                            </p>

                            {referralLink ? (
                                <>
                                    {/* Link Display */}
                                    <div className="w-full bg-[#05050A] border border-white/10 rounded-xl px-6 py-5 flex items-center justify-between gap-4 mb-8 max-w-2xl shadow-inner">
                                        <span className="text-[#00f0ff] text-base font-mono truncate flex-1 tracking-tight">{referralLink}</span>
                                        <button onClick={handleCopy}
                                            className="shrink-0 text-sm font-bold px-4 py-2 rounded-lg border transition-all"
                                            style={copied
                                                ? { background: 'rgba(34,197,94,0.15)', borderColor: '#22c55e', color: '#22c55e' }
                                                : { background: 'rgba(0,240,255,0.1)', borderColor: 'rgba(0,240,255,0.3)', color: '#00f0ff' }
                                            }>
                                            {copied ? '✓ Copied!' : '📋 Copy'}
                                        </button>
                                    </div>

                                    {/* Share Buttons */}
                                    <div className="flex gap-4 flex-wrap justify-center w-full max-w-2xl">
                                        <button onClick={handleCopy}
                                            className="btn-glow flex-1 !py-4 !text-[16px]">
                                            📋 Copy Link
                                        </button>
                                        <button onClick={handleWhatsApp}
                                            className="btn-ghost flex-1 !py-4 !text-[16px]"
                                            style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
                                            💬 WhatsApp
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-5">
                                    <p className="text-white/50">Login to generate your unique referral tracking link.</p>
                                    <Link href="/login" className="btn-glow !py-3 !px-10 !text-[16px]">
                                        Login Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </section>
        </>
    )
}

