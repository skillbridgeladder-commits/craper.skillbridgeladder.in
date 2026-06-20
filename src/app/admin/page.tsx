'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, PLANS, PlanKey } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'

interface PaymentRequest {
    id: string
    user_id: string
    plan_requested: PlanKey
    amount: number
    transaction_id: string
    screenshot_url: string
    status: string
    created_at: string
    user_email?: string
}

interface UserPlan {
    id: string
    user_id: string
    plan: string
    quota: number
    used: number
    is_banned: boolean
    email?: string
    full_name?: string
    referral_code?: string
    created_at: string
}

interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string
    tag: string
    read_time: string
    meta_title: string
    meta_description: string
    meta_keywords: string[]
    published: boolean
    created_at: string
}

interface DashStats {
    totalUsers: number
    totalPayments: number
    pendingPayments: number
    totalRevenue: number
    activeKeys: number
}

interface EnterpriseKey {
    id: string
    key_code: string
    label: string
    quota: number
    used: number
    activated_by: string | null
    activated_email: string | null
    activated_at: string | null
    is_active: boolean
    created_at: string
}

interface Referral {
    id: string
    referrer_id: string
    referred_user_id: string
    referred_email: string
    status: string
    created_at: string
}

// ADMIN EMAILS - strict access
const ADMIN_EMAILS = ['contact.skillbridgeladder@gmail.com', 'skillbridgeladder@gmail.com']

export default function AdminPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([])
    const [users, setUsers] = useState<(UserPlan & { email?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [tab, setTab] = useState<'overview' | 'payments' | 'users' | 'blog' | 'keys' | 'referrals'>('overview')
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [stats, setStats] = useState<DashStats>({ totalUsers: 0, totalPayments: 0, pendingPayments: 0, totalRevenue: 0, activeKeys: 0 })
    const [revenueData, setRevenueData] = useState<{ date: string, revenue: number }[]>([])
    const [userGrowthData, setUserGrowthData] = useState<{ date: string, users: number }[]>([])
    const [previewImg, setPreviewImg] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [editQuota, setEditQuota] = useState('')
    const [editUsed, setEditUsed] = useState('')
    const [editPlan, setEditPlan] = useState('')
    const [manualEmail, setManualEmail] = useState('')
    const [manualCredits, setManualCredits] = useState('')
    const [manualMsg, setManualMsg] = useState('')
    // Blog state
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [blogEditing, setBlogEditing] = useState<BlogPost | null>(null)
    const [blogForm, setBlogForm] = useState({ slug: '', title: '', excerpt: '', content: '', tag: 'Guide', read_time: '5 min read', meta_title: '', meta_description: '', meta_keywords: '', published: true })
    const [blogMsg, setBlogMsg] = useState('')
    // Keys state
    const [keys, setKeys] = useState<EnterpriseKey[]>([])
    const [keyForm, setKeyForm] = useState({ label: '', quota: '1000000', code: '' })
    const [keyMsg, setKeyMsg] = useState('')
    // Referrals state
    const [referrals, setReferrals] = useState<Referral[]>([])
    const router = useRouter()

    useEffect(() => { checkAdmin() }, [])

    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        if (!ADMIN_EMAILS.includes(user.email || '')) { router.push('/dashboard'); return }
        setIsAdmin(true)
        fetchPayments()
        fetchStats()
        fetchUsers()
        fetchBlogPosts()
        fetchKeys()
        fetchReferrals()
    }

    async function fetchStats() {
        const { count: userCount } = await supabase.from('user_plans').select('*', { count: 'exact', head: true })
        const { data: allPayments } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: true })
        const pending = allPayments?.filter(p => p.status === 'pending').length || 0
        const revenue = allPayments?.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        const { count: activeKeys } = await supabase.from('enterprise_keys').select('*', { count: 'exact', head: true }).eq('is_active', true)

        // Compute revenue over time
        const revMap: Record<string, number> = {}
        allPayments?.filter(p => p.status === 'approved').forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            revMap[date] = (revMap[date] || 0) + p.amount
        })
        setRevenueData(Object.keys(revMap).map(date => ({ date, revenue: revMap[date] })))

        // Compute user growth
        const { data: allUsers } = await supabase.from('user_plans').select('created_at').order('created_at', { ascending: true })
        const usrMap: Record<string, number> = {}
        let runningTotal = 0
        allUsers?.forEach(u => {
            const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            runningTotal += 1
            usrMap[date] = runningTotal
        })
        setUserGrowthData(Object.keys(usrMap).map(date => ({ date, users: usrMap[date] })))

        setStats({
            totalUsers: userCount || 0,
            totalPayments: allPayments?.length || 0,
            pendingPayments: pending,
            totalRevenue: revenue,
            activeKeys: activeKeys || 0
        })
    }

    async function fetchPayments() {
        let query = supabase.from('payment_requests').select('*').order('created_at', { ascending: false })
        if (filter !== 'all') query = query.eq('status', filter)
        const { data } = await query
        if (data) {
            setPayments(data.map(p => ({ ...p, user_email: p.user_email || 'Unknown' })))
        }
        setLoading(false)
    }

    async function fetchUsers() {
        const { data } = await supabase.from('user_plans').select('*').order('created_at', { ascending: false })
        if (data) {
            // Try to get emails from payment_requests for each user as fallback
            const { data: allPayments } = await supabase.from('payment_requests').select('user_id, user_email')
            const emailMap: Record<string, string> = {}
            allPayments?.forEach(p => { if (p.user_email) emailMap[p.user_id] = p.user_email })
            setUsers(data.map(u => ({ ...u, email: u.email || emailMap[u.user_id] || '' })))
        }
    }

    async function fetchReferrals() {
        const { data } = await supabase.from('referrals').select('*').order('created_at', { ascending: false })
        if (data) setReferrals(data)
    }

    useEffect(() => { if (isAdmin) fetchPayments() }, [filter, isAdmin])

    async function handleApprove(payment: PaymentRequest) {
        if (!confirm(`Approve ₹${payment.amount} for ${payment.plan_requested} plan?`)) return
        await supabase.from('payment_requests').update({ status: 'approved' }).eq('id', payment.id)
        const plan = PLANS[payment.plan_requested]
        if (plan) {
            const { data: currentPlan } = await supabase.from('user_plans').select('*').eq('user_id', payment.user_id).single()
            const newQuota = (currentPlan?.quota || 200) + plan.quota
            await supabase.from('user_plans').upsert({
                user_id: payment.user_id,
                plan: payment.plan_requested,
                quota: newQuota,
                used: currentPlan?.used || 0
            })
        }
        // Send approval email notification
        try {
            await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'payment_approved',
                    email: payment.user_email,
                    plan: payment.plan_requested,
                    amount: payment.amount,
                    credits: PLANS[payment.plan_requested]?.quota || 0
                })
            })
        } catch (_) { /* silent */ }
        fetchPayments()
        fetchStats()
        fetchUsers()
    }

    async function handleRevert(payment: PaymentRequest) {
        if (!confirm('Revert this payment to pending? This will deduct the Skillcoins granted.')) return
        await supabase.from('payment_requests').update({ status: 'pending' }).eq('id', payment.id)
        const plan = PLANS[payment.plan_requested]
        if (plan) {
            const { data: currentPlan } = await supabase.from('user_plans').select('*').eq('user_id', payment.user_id).single()
            if (currentPlan) {
                const newQuota = Math.max(0, currentPlan.quota - plan.quota)
                await supabase.from('user_plans').update({ quota: newQuota }).eq('user_id', payment.user_id)
            }
        }
        fetchPayments()
        fetchStats()
        fetchUsers()
    }

    async function handleReject(payment: PaymentRequest) {
        if (!confirm('Reject this payment?')) return
        await supabase.from('payment_requests').update({ status: 'rejected' }).eq('id', payment.id)
        // Send rejection email notification
        try {
            await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'payment_rejected',
                    email: payment.user_email,
                    plan: payment.plan_requested,
                    amount: payment.amount
                })
            })
        } catch (_) { /* silent */ }
        fetchPayments()
        fetchStats()
    }

    async function handleEditUser(userId: string) {
        const quota = parseInt(editQuota)
        const used = parseInt(editUsed)
        if (isNaN(quota) || isNaN(used)) return

        await supabase.from('user_plans').update({
            plan: editPlan,
            quota,
            used
        }).eq('user_id', userId)

        setEditingUser(null)
        fetchUsers()
        fetchStats()
    }

    async function handleAddSkillcoins(userId: string, currentQuota: number) {
        const extra = prompt('How many Skillcoins to add?')
        if (!extra) return
        const num = parseInt(extra)
        if (isNaN(num) || num <= 0) return

        await supabase.from('user_plans').update({ quota: currentQuota + num }).eq('user_id', userId)
        fetchUsers()
        fetchStats()
    }

    async function handleBanUser(userId: string, currentBan: boolean) {
        if (!confirm(currentBan ? 'Unban this user? They will be able to scrape again.' : 'Ban this user? They will lose access to the scraper.')) return
        await supabase.from('user_plans').update({ is_banned: !currentBan }).eq('user_id', userId)
        fetchUsers()
    }

    async function handleManualSkillcoins() {
        if (!manualEmail || !manualCredits) return
        setManualMsg('')
        const credits = parseInt(manualCredits)
        if (isNaN(credits) || credits <= 0) { setManualMsg('❌ Enter valid Skillcoin amount'); return }

        // Find user_id from payment_requests by email
        const { data: pmt } = await supabase.from('payment_requests')
            .select('user_id')
            .eq('user_email', manualEmail)
            .limit(1)
            .single()

        if (!pmt?.user_id) {
            // Try to find from user_plans (if we have them)
            setManualMsg('❌ User not found. They must have at least one payment on record.')
            return
        }

        const { data: currentPlan } = await supabase.from('user_plans').select('*').eq('user_id', pmt.user_id).single()
        const newQuota = (currentPlan?.quota || 200) + credits
        await supabase.from('user_plans').upsert({
            user_id: pmt.user_id,
            plan: currentPlan?.plan || 'custom',
            quota: newQuota,
            used: currentPlan?.used || 0
        })

        setManualMsg(`✅ Added ${credits} Skillcoins to ${manualEmail} (total: ${newQuota})`)
        setManualEmail('')
        setManualCredits('')
        fetchUsers()
        fetchStats()
    }

    // ===== BLOG FUNCTIONS =====
    async function fetchBlogPosts() {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
        if (data) setBlogPosts(data)
    }

    function resetBlogForm() {
        setBlogForm({ slug: '', title: '', excerpt: '', content: '', tag: 'Guide', read_time: '5 min read', meta_title: '', meta_description: '', meta_keywords: '', published: true })
        setBlogEditing(null)
        setBlogMsg('')
    }

    function startEditPost(post: BlogPost) {
        setBlogEditing(post)
        setBlogForm({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            tag: post.tag,
            read_time: post.read_time,
            meta_title: post.meta_title || '',
            meta_description: post.meta_description || '',
            meta_keywords: (post.meta_keywords || []).join(', '),
            published: post.published
        })
    }

    async function handleSaveBlog() {
        if (!blogForm.slug || !blogForm.title || !blogForm.content) {
            setBlogMsg('❌ Slug, title, and content are required'); return
        }
        const payload = {
            slug: blogForm.slug,
            title: blogForm.title,
            excerpt: blogForm.excerpt,
            content: blogForm.content,
            tag: blogForm.tag,
            read_time: blogForm.read_time,
            meta_title: blogForm.meta_title || blogForm.title,
            meta_description: blogForm.meta_description || blogForm.excerpt,
            meta_keywords: blogForm.meta_keywords.split(',').map(k => k.trim()).filter(Boolean),
            published: blogForm.published,
            updated_at: new Date().toISOString()
        }

        if (blogEditing) {
            await supabase.from('blog_posts').update(payload).eq('id', blogEditing.id)
            setBlogMsg('✅ Article updated!')
        } else {
            const { error } = await supabase.from('blog_posts').insert(payload)
            if (error) { setBlogMsg('❌ ' + error.message); return }
            setBlogMsg('✅ Article created!')
        }
        resetBlogForm()
        fetchBlogPosts()
    }

    // ===== ENTEPRISE KEYS FUNCTIONS =====
    async function fetchKeys() {
        const { data } = await supabase.from('enterprise_keys').select('*').order('created_at', { ascending: false })
        if (data) setKeys(data)
    }

    async function handleCreateKey() {
        const quota = parseInt(keyForm.quota) || 1000000
        const code = keyForm.code.trim() || `SKILL-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        const { error } = await supabase.from('enterprise_keys').insert({
            key_code: code,
            label: keyForm.label || 'Standard Enterprise Key',
            quota: quota
        })

        if (error) {
            setKeyMsg('❌ Error creating key: ' + error.message)
            return
        }

        setKeyMsg('✅ Key created successfully!')
        setKeyForm({ label: '', quota: '1000000', code: '' })
        fetchKeys()
        fetchStats()
    }

    async function handleRevokeKey(id: string) {
        if (!confirm('Revoke this key? It will block the user from using it.')) return
        await supabase.from('enterprise_keys').update({ is_active: false }).eq('id', id)
        fetchKeys()
        fetchStats()
    }

    async function handleApproveReferral(ref: Referral) {
        if (!confirm('Approve this referral and grant 50 Skillcoins to the referrer?')) return
        await supabase.from('referrals').update({ status: 'verified' }).eq('id', ref.id)

        const referrer = users.find(u => u.user_id === ref.referrer_id)
        if (referrer) {
            await supabase.from('user_plans').update({ quota: referrer.quota + 50 }).eq('user_id', ref.referrer_id)
        } else {
            const { data: rp } = await supabase.from('user_plans').select('quota').eq('user_id', ref.referrer_id).single()
            if (rp) {
                await supabase.from('user_plans').update({ quota: rp.quota + 50 }).eq('user_id', ref.referrer_id)
            }
        }

        fetchReferrals()
        fetchUsers()
    }

    async function handleRejectReferral(id: string) {
        if (!confirm('Reject this referral?')) return
        await supabase.from('referrals').update({ status: 'rejected' }).eq('id', id)
        fetchReferrals()
    }

    async function handleDeletePost(id: string) {
        if (!confirm('Delete this article permanently?')) return
        await supabase.from('blog_posts').delete().eq('id', id)
        fetchBlogPosts()
    }

    async function handleTogglePublish(post: BlogPost) {
        await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
        fetchBlogPosts()
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="w-full relative z-10">
            {/* Image Preview Modal */}
            {previewImg && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
                    onClick={() => setPreviewImg(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full max-h-[80vh] relative">
                        <img src={previewImg} alt="Payment Screenshot" className="w-full h-full object-contain rounded-xl" />
                        <button onClick={() => setPreviewImg(null)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-lg hover:bg-black/80">
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Admin Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
                style={{ background: 'rgba(3, 0, 20, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-lg font-bold text-white">A</div>
                        <span className="text-lg font-bold tracking-tight" style={{ color: '#ff6b35' }}>Admin Panel</span>
                    </Link>
                    <Link href="/dashboard" className="btn-ghost !py-2.5 !px-5 !text-[13px]">← Dashboard</Link>
                </div>
            </nav>

            <div className="container-main flex flex-col md:flex-row gap-8" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                {/* Sidebar Selection */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <div className="glass !p-4 mb-4">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-bold mb-3">Admin Menu</div>
                        <div className="flex flex-col gap-1.5">
                            <button onClick={() => setTab('overview')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'overview' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">📊</span> Overview & Charts
                            </button>
                            <button onClick={() => setTab('payments')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'payments' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">💳</span> Payments & Upgrades
                            </button>
                            <button onClick={() => setTab('users')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'users' ? 'bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">👥</span> User Management
                            </button>
                            <button onClick={() => setTab('blog')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'blog' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">📝</span> Blog & Content
                            </button>
                            <button onClick={() => setTab('keys')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'keys' ? 'bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">🔑</span> Enterprise Keys
                            </button>
                            <button onClick={() => setTab('referrals')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${tab === 'referrals' ? 'bg-[#ec4899]/10 text-[#ec4899] border border-[#ec4899]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-lg">🤝</span> Referrals
                            </button>
                            <Link href="/admin/tracking"
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 text-white/40 hover:text-white hover:bg-white/5 mt-2 border border-white/5 hover:border-cyan-500/30">
                                <span className="text-lg">👁️</span> Tracking & Logs
                            </Link>
                        </div>
                    </div>

                    {/* Stats Summary in Sidebar */}
                    <div className="glass !p-5">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-bold mb-4">Quick Stats</div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-white/40 mb-1">Total Users</div>
                                <div className="text-xl font-bold text-white">{stats.totalUsers}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 mb-1">Pending Payments</div>
                                <div className="text-xl font-bold text-yellow-400">{stats.pendingPayments}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 mb-1">Total Revenue</div>
                                <div className="text-xl font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 mb-1">Active Keys</div>
                                <div className="text-xl font-bold text-cyan-400">{stats.activeKeys}</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">

                    {tab === 'overview' ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-bold mb-5">📈 Platform Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="glass !p-6 h-[350px]">
                                    <h3 className="text-lg font-semibold mb-6">Revenue Growth</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${v}`} />
                                            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="glass !p-6 h-[350px]">
                                    <h3 className="text-lg font-semibold mb-6">User Acquisition</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                            <Line type="monotone" dataKey="users" stroke="#00f0ff" strokeWidth={3} dot={{ fill: '#00f0ff', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    ) : tab === 'payments' ? (
                        <>
                            {/* Manual Credits */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="glass mb-8">
                                <h3 className="text-lg font-semibold mb-4">🎁 Manual Credit Grant</h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                                        placeholder="User email"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    <input type="number" value={manualCredits} onChange={e => setManualCredits(e.target.value)}
                                        placeholder="Credits"
                                        className="w-full sm:w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    <button onClick={handleManualSkillcoins}
                                        className="btn-glow !py-3 !px-6 !text-[14px] whitespace-nowrap">
                                        Grant Skillcoins
                                    </button>
                                </div>
                                {manualMsg && <p className="mt-3 text-sm">{manualMsg}</p>}
                            </motion.div>

                            {/* Payment Requests */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <h2 className="text-2xl font-bold mb-5">🔧 Payment Requests</h2>

                                <div className="flex gap-2 mb-6 flex-wrap">
                                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                                        <button key={f} onClick={() => setFilter(f)}
                                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all capitalize
                                            ${filter === f
                                                    ? 'bg-gradient-to-r from-[var(--accent2)] to-[var(--accent)] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60'}`}>
                                            {f === 'pending' ? `⏳ ${f}` : f === 'approved' ? `✅ ${f}` : f === 'rejected' ? `❌ ${f}` : `📋 ${f}`}
                                        </button>
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="glass text-center py-12">
                                        <div className="text-4xl mb-3">📭</div>
                                        <p className="text-white/35 font-light">No {filter === 'all' ? '' : filter} payment requests</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {payments.map((p, i) => (
                                            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="glass !p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">

                                                {/* Screenshot thumbnail */}
                                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer border border-white/10 hover:border-[var(--accent)]/40 transition-all"
                                                    onClick={() => p.screenshot_url && setPreviewImg(p.screenshot_url)}>
                                                    {p.screenshot_url ? (
                                                        <img src={p.screenshot_url} alt="Payment" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/20">📷</div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                                                        ${p.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                                                                p.status === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                            {p.status.toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-white/50 font-medium">{p.user_email}</span>
                                                    </div>
                                                    <div className="text-sm mb-1">
                                                        <span className="text-white font-semibold">₹{p.amount}</span>
                                                        <span className="text-white/20"> → </span>
                                                        <span className="text-[#00f0ff] font-semibold">{p.plan_requested}</span>
                                                        <span className="text-white/20"> ({PLANS[p.plan_requested]?.quota.toLocaleString()} Skillcoins)</span>
                                                    </div>
                                                    <div className="text-xs text-white/20 flex flex-wrap gap-x-3">
                                                        <span>TXN: <span className="text-white/40">{p.transaction_id}</span></span>
                                                        <span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    {p.screenshot_url && (
                                                        <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer"
                                                            className="text-xs text-[#00f0ff]/60 hover:text-[#00f0ff] mt-1 inline-block transition-colors">
                                                            🔗 Open full image
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                                    {p.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleApprove(p)}
                                                                className="text-sm py-2 px-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all font-medium">
                                                                ✅ Approve
                                                            </button>
                                                            <button onClick={() => handleReject(p)}
                                                                className="text-sm py-2 px-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium">
                                                                ❌ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {p.status !== 'pending' && (
                                                        <button onClick={() => handleRevert(p)}
                                                            className="text-sm py-2 px-4 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                                            ↩️ Revert to Pending
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    ) : tab === 'users' ? (
                        /* ===== USERS TAB ===== */
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-bold mb-5">👥 User Management</h2>
                            <p className="text-white/30 text-sm font-light mb-6">Manage user plans, Skillcoins, and usage. Click Edit to modify any user&apos;s data.</p>

                            {users.length === 0 ? (
                                <div className="glass text-center py-12">
                                    <div className="text-4xl mb-3">👤</div>
                                    <p className="text-white/35 font-light">No users registered yet</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {users.map((u, i) => (
                                        <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="glass !p-5">

                                            {editingUser === u.user_id ? (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white/50 mb-3">
                                                        ✏️ Editing: <span className="text-white">{u.email || u.user_id.slice(0, 12) + '...'}</span>
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                        <div>
                                                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Plan</label>
                                                            <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                                                                {Object.keys(PLANS).map(k => <option key={k} value={k}>{PLANS[k as PlanKey].name}</option>)}
                                                                <option value="custom">Custom</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Total Skillcoins (Quota)</label>
                                                            <input type="number" value={editQuota} onChange={e => setEditQuota(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Used Skillcoins</label>
                                                            <input type="number" value={editUsed} onChange={e => setEditUsed(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditUser(u.user_id)}
                                                            className="text-sm py-2 px-5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all font-medium">
                                                            💾 Save
                                                        </button>
                                                        <button onClick={() => setEditingUser(null)}
                                                            className="text-sm py-2 px-5 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="text-sm font-semibold text-white">
                                                                {u.full_name ? `${u.full_name} (${u.email})` : (u.email || u.user_id.slice(0, 16) + '...')}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                            ${u.plan === 'free' ? 'bg-white/5 text-white/40' :
                                                                    u.plan === 'starter' ? 'bg-blue-500/15 text-blue-400' :
                                                                        u.plan === 'pro' ? 'bg-purple-500/15 text-purple-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                                                {u.plan}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-white/35 flex flex-wrap gap-x-4">
                                                            <span>Quota: <span className="text-white/60 font-medium">{u.quota.toLocaleString()}</span></span>
                                                            <span>Used: <span className="text-white/60 font-medium">{u.used.toLocaleString()}</span></span>
                                                            <span>Remaining: <span className="text-[#00f0ff] font-medium">{(u.quota - u.used).toLocaleString()}</span></span>
                                                            <span>Referral Code: <span className="text-[#00f0ff] font-medium">{u.referral_code || u.user_id.slice(0, 8).toUpperCase()}</span></span>
                                                            {u.is_banned && <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full flex items-center">BANNED</span>}
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                            <div className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${Math.min(100, (u.used / u.quota) * 100)}%`,
                                                                    background: u.used / u.quota > 0.8 ? '#ef4444' : 'linear-gradient(90deg, var(--accent2), var(--accent))'
                                                                }} />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                                        <button onClick={() => handleBanUser(u.user_id, u.is_banned)}
                                                            className={`text-sm py-2 px-4 rounded-full border transition-all font-medium ${u.is_banned ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}>
                                                            {u.is_banned ? '🟢 Unban' : '🚫 Ban'}
                                                        </button>
                                                        <button onClick={() => handleAddSkillcoins(u.user_id, u.quota)}
                                                            className="text-sm py-2 px-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all font-medium">
                                                            ➕ Add Skillcoins
                                                        </button>
                                                        <button onClick={() => {
                                                            setEditingUser(u.user_id)
                                                            setEditPlan(u.plan)
                                                            setEditQuota(u.quota.toString())
                                                            setEditUsed(u.used.toString())
                                                        }}
                                                            className="text-sm py-2 px-4 rounded-full bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                                            ✏️ Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* ===== BLOG TAB ===== */
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-bold mb-5">📝 Blog Management</h2>

                            {/* Article Form */}
                            <div className="glass mb-8">
                                <h3 className="text-lg font-semibold mb-4">{blogEditing ? '✏️ Edit Article' : '➕ New Article'}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Title *</label>
                                        <input type="text" value={blogForm.title}
                                            onChange={e => setBlogForm(f => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))}
                                            placeholder="How to Scrape Google Maps..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Slug (URL) *</label>
                                        <input type="text" value={blogForm.slug}
                                            onChange={e => setBlogForm(f => ({ ...f, slug: e.target.value }))}
                                            placeholder="how-to-scrape-google-maps"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Excerpt (Short Description)</label>
                                    <input type="text" value={blogForm.excerpt}
                                        onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))}
                                        placeholder="Learn how to extract business data from Google Maps..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                </div>
                                <div className="mb-3">
                                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Content (Markdown) *</label>
                                    <textarea value={blogForm.content}
                                        onChange={e => setBlogForm(f => ({ ...f, content: e.target.value }))}
                                        placeholder="## Introduction&#10;&#10;Write your article content here using Markdown...&#10;&#10;## Step 1&#10;&#10;**Bold text** and [links](/url) are supported."
                                        rows={12}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Tag</label>
                                        <select value={blogForm.tag} onChange={e => setBlogForm(f => ({ ...f, tag: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                                            <option value="Guide">Guide</option>
                                            <option value="Tutorial">Tutorial</option>
                                            <option value="Comparison">Comparison</option>
                                            <option value="News">News</option>
                                            <option value="Tips">Tips</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Read Time</label>
                                        <input type="text" value={blogForm.read_time}
                                            onChange={e => setBlogForm(f => ({ ...f, read_time: e.target.value }))}
                                            placeholder="5 min read"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer py-3">
                                            <input type="checkbox" checked={blogForm.published}
                                                onChange={e => setBlogForm(f => ({ ...f, published: e.target.checked }))}
                                                className="w-5 h-5 rounded bg-white/5 border border-white/20 accent-[#00f0ff]" />
                                            <span className="text-sm text-white/50">Published</span>
                                        </label>
                                    </div>
                                </div>
                                {/* SEO Fields */}
                                <details className="mb-4">
                                    <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors mb-3">🔍 SEO Settings (optional)</summary>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input type="text" value={blogForm.meta_title}
                                            onChange={e => setBlogForm(f => ({ ...f, meta_title: e.target.value }))}
                                            placeholder="SEO Title (defaults to article title)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                                        <input type="text" value={blogForm.meta_description}
                                            onChange={e => setBlogForm(f => ({ ...f, meta_description: e.target.value }))}
                                            placeholder="SEO Description (defaults to excerpt)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                                        <input type="text" value={blogForm.meta_keywords}
                                            onChange={e => setBlogForm(f => ({ ...f, meta_keywords: e.target.value }))}
                                            placeholder="Keywords (comma separated): google maps scraper, lead gen"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm" />
                                    </div>
                                </details>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={handleSaveBlog}
                                        className="btn-glow !py-3 !px-6 !text-[14px]">
                                        {blogEditing ? '💾 Update Article' : '🚀 Publish Article'}
                                    </button>
                                    {blogEditing && (
                                        <button onClick={resetBlogForm}
                                            className="text-sm py-3 px-6 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                {blogMsg && <p className="mt-3 text-sm">{blogMsg}</p>}
                            </div>

                            {/* Article List */}
                            <h3 className="text-lg font-semibold mb-4">📋 All Articles ({blogPosts.length})</h3>
                            {blogPosts.length === 0 ? (
                                <div className="glass text-center py-12">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-white/35 font-light">No articles yet. Create your first one above!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {blogPosts.map((post, i) => (
                                        <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="glass !p-5">
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${post.published ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                                            {post.published ? 'LIVE' : 'DRAFT'}
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 text-white/30">
                                                            {post.tag}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-white mb-1">{post.title}</h4>
                                                    <p className="text-xs text-white/25 truncate">/blog/{post.slug}</p>
                                                    <p className="text-xs text-white/20 mt-1">
                                                        {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {post.read_time}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                                                        className="text-sm py-2 px-3 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                                        👁️ View
                                                    </a>
                                                    <button onClick={() => handleTogglePublish(post)}
                                                        className={`text-sm py-2 px-3 rounded-full border transition-all font-medium
                                                        ${post.published ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}>
                                                        {post.published ? '📥 Unpublish' : '🚀 Publish'}
                                                    </button>
                                                    <button onClick={() => startEditPost(post)}
                                                        className="text-sm py-2 px-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-medium">
                                                        ✏️ Edit
                                                    </button>
                                                    <button onClick={() => handleDeletePost(post.id)}
                                                        className="text-sm py-2 px-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                    {tab === 'keys' && (
                        /* ===== ENTERPRISE KEYS TAB ===== */
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-bold mb-5">🔑 Enterprise Keys</h2>
                            <p className="text-white/30 text-sm font-light mb-6">Create keys to give agencies/teams unrestricted or bulk API access. When activated, the user gets an Enterprise Plan automatically.</p>

                            <div className="glass mb-8">
                                <h3 className="text-lg font-semibold mb-4">➕ Generate Key</h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input type="text" value={keyForm.label} onChange={e => setKeyForm({ ...keyForm, label: e.target.value })}
                                        placeholder="Label (e.g. Acme Corp)"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    <input type="text" value={keyForm.code} onChange={e => setKeyForm({ ...keyForm, code: e.target.value })}
                                        placeholder="Custom Code (Auto-generates if empty)"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    <input type="number" value={keyForm.quota} onChange={e => setKeyForm({ ...keyForm, quota: e.target.value })}
                                        placeholder="Quota"
                                        className="w-full sm:w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all" />
                                    <button onClick={handleCreateKey}
                                        className="btn-glow !py-3 !px-6 !text-[14px] whitespace-nowrap">
                                        Create Key
                                    </button>
                                </div>
                                {keyMsg && <p className="mt-3 text-sm">{keyMsg}</p>}
                            </div>

                            {keys.length === 0 ? (
                                <div className="glass text-center py-12">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-white/35 font-light">No enterprise keys generated</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {keys.map((k, i) => (
                                        <motion.div key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className={`glass !p-5 ${!k.is_active ? 'opacity-50' : ''}`}>
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${k.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                            {k.is_active ? 'ACTIVE' : 'REVOKED'}
                                                        </span>
                                                        {k.activated_by ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400">
                                                                USED BY {k.activated_email || 'UNKNOWN'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400">
                                                                UNUSED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-lg font-mono text-white mb-1 select-all">{k.key_code}</h4>
                                                    <div className="text-sm text-white/35 flex flex-wrap gap-x-4">
                                                        <span>Label: <span className="text-white/60 font-medium">{k.label}</span></span>
                                                        <span>Quota: <span className="text-white/60 font-medium">{k.quota.toLocaleString()}</span></span>
                                                        <span>Created: <span className="text-white/60">{new Date(k.created_at).toLocaleDateString()}</span></span>
                                                    </div>
                                                </div>
                                                {k.is_active && (
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        <button onClick={() => { navigator.clipboard.writeText(k.key_code); alert('Key copied to clipboard!') }}
                                                            className="text-sm py-2 px-4 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all font-medium">
                                                            📋 Copy
                                                        </button>
                                                        <button onClick={() => handleRevokeKey(k.id)}
                                                            className="text-sm py-2 px-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium">
                                                            🚫 Revoke
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                    {tab === 'referrals' && (
                        /* ===== REFERRALS TAB ===== */
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-bold mb-5">🤝 Referrals</h2>
                            <p className="text-white/30 text-sm font-light mb-6">Manage user referrals. Approve them to automatically grant 50 credits to the referrer.</p>

                            {referrals.length === 0 ? (
                                <div className="glass text-center py-12">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-white/35 font-light">No referrals found</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {referrals.map((r, i) => (
                                        <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="glass !p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${r.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                                                            r.status === 'verified' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                        {r.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 text-white/30">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-white mb-1">
                                                    Referred: <span className="text-[#00f0ff]">{r.referred_email}</span>
                                                </h4>
                                                <p className="text-xs text-white/40">
                                                    By: <code>{r.referrer_id.slice(0, 12)}...</code>
                                                    {users.find(u => u.user_id === r.referrer_id)?.email && (
                                                        <span className="ml-2 text-white/60">({users.find(u => u.user_id === r.referrer_id)?.email})</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                                {r.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApproveReferral(r)}
                                                            className="text-sm py-2 px-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all font-medium">
                                                            ✅ Approve (+50)
                                                        </button>
                                                        <button onClick={() => handleRejectReferral(r.id)}
                                                            className="text-sm py-2 px-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium">
                                                            ❌ Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    )
}
