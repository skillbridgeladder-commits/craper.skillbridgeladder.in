'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, PLANS, PlanKey } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function UploadPaymentContent() {
    const [user, setUser] = useState<{ id?: string; email?: string } | null>(null)
    const [transactionId, setTransactionId] = useState('')
    const [screenshot, setScreenshot] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const planRequested = (searchParams.get('plan') as PlanKey) || 'starter'

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)
    }

    function handleFileChange(file: File | null) {
        setScreenshot(file)
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        } else {
            setPreviewUrl(null)
        }
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (!screenshot || !transactionId || !user) return
        setUploading(true)
        setError('')

        try {
            const fileExt = screenshot.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, screenshot)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(fileName)

            const { error: insertError } = await supabase.from('payment_requests').insert({
                user_id: user.id,
                user_email: user.email || '',
                plan_requested: planRequested,
                amount: PLANS[planRequested]?.price || 0,
                transaction_id: transactionId,
                screenshot_url: urlData.publicUrl,
                status: 'pending'
            })

            if (insertError) throw insertError
            setSuccess(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full relative z-10">
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
                    style={{ background: 'rgba(3, 0, 20, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                    <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img src="/logo.png" alt="Skill Scraper" className="w-9 h-9 object-contain" />
                            <span className="text-lg font-bold tracking-tight">Skill Scraper</span>
                        </Link>
                    </div>
                </nav>
                <div className="container-main flex items-center justify-center" style={{ paddingTop: '160px', paddingBottom: '80px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass max-w-md w-full text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-3">Payment Submitted!</h2>
                        <p className="text-white/35 font-light mb-6">
                            We&apos;ll verify your payment and upgrade your account within 24 hours. You&apos;ll receive an email confirmation.
                        </p>
                        <Link href="/dashboard" className="btn-glow w-full text-center block">Go to Dashboard</Link>
                    </motion.div>
                </div>
            </div>
        )
    }

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
                    <Link href="/upgrade" className="btn-ghost !py-2.5 !px-5 !text-[13px]">← Back</Link>
                </div>
            </nav>

            <div className="container-main" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '560px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,240,255,0.03), transparent)' }} />
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-2">📸 Upload Payment Proof</h1>
                        <p className="text-white/35 text-sm mb-6">
                            Submit your payment screenshot for
                            <span className="text-[#00f0ff] font-semibold"> {PLANS[planRequested]?.name || 'Starter'}</span> credits
                            (₹{PLANS[planRequested]?.price || 199})
                        </p>

                        <form onSubmit={handleUpload} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-white/70 font-medium px-1">Transaction ID / UPI Reference</label>
                                <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                                    placeholder="e.g. 412345678901" required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-white/70 font-medium px-1">Payment Screenshot</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-[var(--accent)]/30 transition cursor-pointer"
                                    onClick={() => document.getElementById('fileInput')?.click()}>
                                    {previewUrl ? (
                                        <div>
                                            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-2 object-contain" />
                                            <div className="text-green-400 text-sm mb-1">✓ {screenshot?.name}</div>
                                            <div className="text-xs text-white/25">{screenshot ? (screenshot.size / 1024).toFixed(1) + ' KB' : ''}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-3xl mb-2">📁</div>
                                            <p className="text-sm text-white/40">Click to upload screenshot</p>
                                            <p className="text-xs text-white/20">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
                                    <input id="fileInput" type="file" accept="image/*" className="hidden"
                                        onChange={e => handleFileChange(e.target.files?.[0] || null)} required />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button type="submit" disabled={uploading || !screenshot || !transactionId}
                                className="btn-glow w-full !py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {uploading ? '⏳ Uploading...' : '🚀 Submit Payment Proof'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function UploadPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div></div>}>
            <UploadPaymentContent />
        </Suspense>
    )
}
