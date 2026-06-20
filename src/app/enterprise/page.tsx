'use client'

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
interface ScrapedLead { id: string; data: any; created_at: string }
interface UserPlan { plan: string; quota: number; used: number }

const PROVIDERS = {
    openai: { label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], url: 'https://api.openai.com/v1/chat/completions' },
    groq: { label: 'Groq', models: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'], url: 'https://api.groq.com/openai/v1/chat/completions' },
    gemini: { label: 'Gemini', models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp'], url: '' },
}

const COLORS = ['#00f0ff', '#7c3aed', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];

export default function EnterpriseDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-t-2 border-[#00f0ff] animate-spin" /></div>}>
            <EnterpriseInner />
        </Suspense>
    )
}

function EnterpriseInner() {
    const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
    const [plan, setPlan] = useState<UserPlan | null>(null)
    const [leads, setLeads] = useState<ScrapedLead[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || 'overview'

    // Settings
    const [aiProvider, setAiProvider] = useState("openai")
    const [aiModel, setAiModel] = useState("gpt-4o-mini")
    const [aiApiKey, setAiApiKey] = useState("")
    const [settingsSaved, setSettingsSaved] = useState(false)
    const [dynamicModels, setDynamicModels] = useState<string[]>([])
    const [fetchingModels, setFetchingModels] = useState(false)

    // Chat
    const [messages, setMessages] = useState<ChatMessage[]>([{
        role: 'assistant',
        content: '👋 Hello! I\'m Skill AI, your personal data-driven assistant.\n\nI am connected to your live lead database. You can ask me to:\n✨ Write cold call scripts for specific industries\n✨ Draft personalized outreach emails\n✨ Identify high-value targets (like leads with no website)\n✨ Summarize your current pipeline\n\nHow can I help you today?'
    }])
    const [chatInput, setChatInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Training
    const [trainingData, setTrainingData] = useState<string>("")
    const [savingTraining, setSavingTraining] = useState(false)

    // AI Insights
    const [aiInsights, setAiInsights] = useState<string>("")
    const [generatingInsights, setGeneratingInsights] = useState(false)

    useEffect(() => { checkAuth() }, [])
    useEffect(() => {
        if (currentTab === 'ai') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isTyping, currentTab])

    async function fetchGeminiModels() {
        if (!aiApiKey) return alert("Please enter your API Key first");
        setFetchingModels(true);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${aiApiKey}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            
            const models = data.models
                .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
                .map((m: any) => m.name.replace('models/', ''));
            
            if (models.length > 0) {
                setDynamicModels(models);
                setAiModel(models[0]);
                alert(`Successfully fetched ${models.length} supported models!`);
            } else {
                alert("No models found that support generateContent.");
            }
        } catch (err: any) {
            alert(`Error fetching models: ${err.message}`);
        } finally {
            setFetchingModels(false);
        }
    }


    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) { router.push('/login'); return }
        setUser(session.user)

        const { data: planData } = await supabase.from('user_plans').select('*').eq('user_id', session.user.id).single()
        if (!planData || planData.plan !== 'enterprise') { router.push('/dashboard'); return }
        setPlan(planData)

        // Fetch real leads from DB
        const { data: leadsData } = await supabase
            .from('scraped_leads')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1500)
        setLeads(leadsData || [])

        // Fetch Training Data & Chat History
        try {
            const { data: trainData } = await supabase.from('ai_training_data').select('content').eq('user_id', session.user.id).maybeSingle()
            if (trainData?.content) setTrainingData(trainData.content)

            const { data: chatData } = await supabase.from('ai_chats').select('messages').eq('user_id', session.user.id).maybeSingle()
            if (chatData && chatData.messages && chatData.messages.length > 0) setMessages(chatData.messages)
        } catch (e) {
            console.warn("Training/Chat tables might not exist yet:", e)
        }

        // Load saved settings
        let savedModel = localStorage.getItem('skill_ai_model') || 'gpt-4o-mini';
        // Auto-upgrade legacy models
        if (savedModel === 'gemini-1.5-flash') savedModel = 'gemini-1.5-flash-latest';
        if (savedModel === 'gemini-1.5-pro') savedModel = 'gemini-1.5-pro-latest';

        const saved = {
            provider: localStorage.getItem('skill_ai_provider') || 'openai',
            model: savedModel,
            key: localStorage.getItem('skill_ai_key') || '',
        }
        setAiProvider(saved.provider)
        setAiModel(saved.model)
        setAiApiKey(saved.key)
        setLoading(false)
    }

    function handleSaveSettings() {
        localStorage.setItem('skill_ai_provider', aiProvider)
        localStorage.setItem('skill_ai_model', aiModel)
        localStorage.setItem('skill_ai_key', aiApiKey)
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 3000)
    }

    async function toggleCalled(leadId: string, currentData: any) {
        const updatedData = { ...currentData, called: !currentData.called };
        
        // Optimistic UI update
        setLeads(leads.map(l => l.id === leadId ? { ...l, data: updatedData } : l));

        // Supabase update
        await supabase
            .from('scraped_leads')
            .update({ data: updatedData })
            .eq('id', leadId);
    }

    function getRelevantLeads(query: string) {
        if (leads.length === 0) return []
        const lowerQuery = query.toLowerCase()
        const keywords = lowerQuery.split(' ').filter(w => w.length > 2)
        
        let scoredLeads = leads.map(l => {
            let score = 0;
            const dataStr = JSON.stringify(l.data).toLowerCase()
            keywords.forEach(kw => { if (dataStr.includes(kw)) score += 1 })
            return { ...l, score }
        })

        scoredLeads.sort((a, b) => b.score - a.score)
        return scoredLeads.filter(l => l.score > 0).slice(0, 30)
    }

    function buildLeadContext(query: string) {
        if (leads.length === 0) return "No leads scraped yet."
        let relevantLeads = getRelevantLeads(query)
        if (relevantLeads.length === 0) relevantLeads = leads.slice(0, 30).map(l => ({ ...l, score: 0 }))
        const noWebsite = leads.filter(l => !l.data?.website).length
        const withPhone = leads.filter(l => l.data?.phone).length
        const withEmail = leads.filter(l => l.data?.email).length
        const industries = [...new Set(leads.map(l => l.data?.category).filter(Boolean))].slice(0, 10)
        
        return `User has ${leads.length} total leads synced.
Stats: ${withPhone} have phone, ${withEmail} have email, ${noWebsite} have NO website.
Industries found: ${industries.join(', ')}.
Context leads retrieved for this query (${relevantLeads.length} leads):
${relevantLeads.map(l => `- ${l.data?.name || 'Unknown'} | Phone: ${l.data?.phone || 'N/A'} | Email: ${l.data?.email || 'N/A'} | Website: ${l.data?.website || 'None'} | Address: ${l.data?.address || 'N/A'} | Category: ${l.data?.category || 'N/A'} | Called: ${l.data?.called ? 'Yes' : 'No'}`).join('\n')}`
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!chatInput.trim() || !aiApiKey) return

        const userMsg = chatInput.trim()
        const updatedMessagesWithUser = [...messages, { role: 'user', content: userMsg }] as ChatMessage[]
        setMessages(updatedMessagesWithUser)
        setChatInput("")
        setIsTyping(true)

        // Save to DB (optimistic)
        try { supabase.from('ai_chats').upsert({ user_id: user?.id, messages: updatedMessagesWithUser }).then() } catch (e) {}

        try {
            const systemPrompt = `You are Skill AI, an elite sales assistant for Skill Scraper Enterprise. You help with lead generation, cold outreach, and sales strategy.
User: ${user?.email} | Plan: Enterprise | Credits used: ${plan?.used} of ${plan?.quota === 0 ? 'Unlimited' : plan?.quota}

${trainingData ? `\nCUSTOM TRAINING / SALES METHODS:\n${trainingData}\n` : ''}

LIVE LEAD DATA (Retrieved via RAG):
${buildLeadContext(userMsg)}

Be concise, actionable and specific. When writing scripts, use real data from the leads above.`

            let result = ''
            if (aiProvider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${aiApiKey}`
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: systemPrompt }] },
                            ...messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                            { role: 'user', parts: [{ text: userMsg }] }
                        ]
                    })
                })
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
            } else {
                const providerUrl = PROVIDERS[aiProvider as keyof typeof PROVIDERS]?.url || PROVIDERS.openai.url
                const res = await fetch(providerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
                    body: JSON.stringify({
                        model: aiModel,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...messages.map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: userMsg }
                        ]
                    })
                })
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                result = data.choices[0].message.content
            }
            
            const finalMessages = [...updatedMessagesWithUser, { role: 'assistant', content: result }] as ChatMessage[]
            setMessages(finalMessages)
            try { supabase.from('ai_chats').upsert({ user_id: user?.id, messages: finalMessages }).then() } catch (e) {}

        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }])
        } finally {
            setIsTyping(false)
        }
    }

    async function generateAiInsights() {
        if (!aiApiKey) {
            alert("Please configure your AI API Key in the Settings tab first.");
            return;
        }
        setGeneratingInsights(true);
        try {
            const statsContext = `Total Leads: ${leads.length}. With Phone: ${leads.filter(l=>l.data?.phone).length}. With Email: ${leads.filter(l=>l.data?.email).length}. No Website: ${leads.filter(l=>!l.data?.website).length}. Leads Called: ${leads.filter(l=>l.data?.called).length}. Top Industries: ${Object.keys(industriesMap).slice(0,5).join(', ')}.`;
            const systemPrompt = `You are an expert Data Analyst. Analyze the following lead generation metrics and provide a 3-bullet point executive summary highlighting opportunities, trends, and next steps for the sales team. Keep it highly professional and brief. Data: ${statsContext}`;
            
            let result = '';
            if (aiProvider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${aiApiKey}`
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] })
                })
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                result = data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated."
            } else {
                const providerUrl = PROVIDERS[aiProvider as keyof typeof PROVIDERS]?.url || PROVIDERS.openai.url
                const res = await fetch(providerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
                    body: JSON.stringify({ model: aiModel, messages: [{ role: 'user', content: systemPrompt }] })
                })
                const data = await res.json()
                if (data.error) throw new Error(data.error.message)
                result = data.choices[0].message.content
            }
            setAiInsights(result);
        } catch (err: any) {
            setAiInsights(`Failed to generate insights: ${err.message}`);
        } finally {
            setGeneratingInsights(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin" />
        </div>
    )

    const noWebsiteCount = leads.filter(l => !l.data?.website).length
    const withPhoneCount = leads.filter(l => l.data?.phone).length
    const withEmailCount = leads.filter(l => l.data?.email).length
    const calledCount = leads.filter(l => l.data?.called).length

    // Prepare chart data: Top Industries
    const industriesMap: Record<string, number> = {}
    leads.forEach(l => {
        if (l.data?.category) {
            industriesMap[l.data.category] = (industriesMap[l.data.category] || 0) + 1
        }
    })
    const indChartData = Object.entries(industriesMap)
        .map(([name, count]) => ({ name: name.split(',')[0].substring(0, 15), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

    // Prepare chart data: Contact Methods Pie
    const pieData = [
        { name: 'Phone Only', value: leads.filter(l => l.data?.phone && !l.data?.email).length },
        { name: 'Email Only', value: leads.filter(l => !l.data?.phone && l.data?.email).length },
        { name: 'Both', value: leads.filter(l => l.data?.phone && l.data?.email).length },
        { name: 'Neither', value: leads.filter(l => !l.data?.phone && !l.data?.email).length },
    ].filter(d => d.value > 0);

    // Prepare chart data: Timeline
    const timeMap: Record<string, number> = {};
    leads.forEach(l => {
        const d = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeMap[d] = (timeMap[d] || 0) + 1;
    });
    const timeChartData = Object.entries(timeMap).map(([date, count]) => ({ date, count })).reverse();

    return (
        <div className="w-full min-h-screen text-white relative overflow-x-hidden" style={{ background: '#0a0f1a' }}>
            {/* Navbars - Z-index structured to avoid overlaps */}
            <nav className="fixed left-0 right-0 z-40 border-b border-white/[0.06]"
                style={{ top: '72px', background: 'rgba(10, 15, 26, 0.95)', backdropFilter: 'blur(20px)' }}>
                <div className="container-main flex flex-wrap gap-4 items-center justify-between py-4" style={{ minHeight: '60px' }}>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#00f0ff)', boxShadow: '0 0 12px rgba(0,240,255,0.25)' }}>
                                <span className="text-sm">⚡</span>
                            </div>
                            <span className="font-bold tracking-wide">ENTERPRISE BI</span>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto shrink-0 pb-1 sm:pb-0">
                            <Link href="/enterprise?tab=overview" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentTab === 'overview' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                📊 Power BI Analytics
                            </Link>
                            <Link href="/enterprise?tab=ai" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentTab === 'ai' ? 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                🤖 Skill AI RAG
                            </Link>
                            <Link href="/enterprise?tab=training" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentTab === 'training' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                🧠 AI Training
                            </Link>
                            <Link href="/enterprise?tab=settings" 
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                ⚙️ Settings
                            </Link>
                        </div>
                    </div>
                    <Link href="/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-semibold uppercase tracking-wider transition-colors shrink-0">
                        ← Back
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container-main pb-12" style={{ paddingTop: '160px' }}>
                {currentTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight mb-2">Global Revenue & Data</h2>
                                <p className="text-white/40">Real-time intelligence extracted from {leads.length} sources.</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="px-3 py-1.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
                                    Live Sync
                                </div>
                                <button onClick={generateAiInsights} disabled={generatingInsights} className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded text-sm font-semibold transition-colors disabled:opacity-50">
                                    {generatingInsights ? 'Analyzing...' : 'Generate AI Report'}
                                </button>
                            </div>
                        </div>

                        {aiInsights && (
                            <div className="p-6 rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/5">
                                <h3 className="text-[#a78bfa] font-bold mb-3 flex items-center gap-2">
                                    <span>🧠</span> Executive AI Insights
                                </h3>
                                <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-sm">
                                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Total Extracted</div>
                                <div className="text-4xl font-black text-white">{leads.length}</div>
                            </div>
                            <div className="glass-sm">
                                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">With Direct Phone</div>
                                <div className="text-4xl font-black text-[#00f0ff]">{withPhoneCount}</div>
                            </div>
                            <div className="glass-sm">
                                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">No Website (High Value)</div>
                                <div className="text-4xl font-black text-[#f59e0b]">{noWebsiteCount}</div>
                            </div>
                            <div className="glass-sm">
                                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Sales Outreach</div>
                                <div className="text-4xl font-black text-[#22c55e]">{calledCount}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Chart 1: Industry Penetration */}
                            <div className="glass-sm h-[350px] flex flex-col min-w-0 relative">
                                <h3 className="text-white font-semibold mb-4 shrink-0">Industry Penetration</h3>
                                <div className="flex-1 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={indChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)' }} cursor={{ fill: '#ffffff05' }} />
                                            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                                                {indChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: Timeline */}
                            <div className="glass-sm h-[350px] flex flex-col min-w-0 relative">
                                <h3 className="text-white font-semibold mb-4 shrink-0">Extraction Timeline</h3>
                                <div className="flex-1 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={timeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)' }} />
                                            <Area type="monotone" dataKey="count" stroke="#00f0ff" fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentTab === 'ai' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-220px)] flex flex-col glass !p-0 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] relative z-10">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-xl">🤖</div>
                                <div>
                                    <h3 className="font-bold text-white">Skill AI Assistant</h3>
                                    <p className="text-xs text-[#00f0ff]">Connected to Live DB • {aiModel}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href="/enterprise?tab=settings" className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors border border-white/10">Configure AI</Link>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {!aiApiKey && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm flex items-center justify-between">
                                    <span>⚠️ AI is not configured. You need to add your API key in settings.</span>
                                    <Link href="/enterprise?tab=settings" className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition-colors">Go to Settings</Link>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-[#00f0ff]/10 text-[#d4e4fa] border border-[#00f0ff]/20 rounded-tr-sm' : 'bg-white/5 text-white/80 border border-white/10 rounded-tl-sm'}`}>
                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 text-white/40 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask Skill AI to analyze leads, draft emails, or summarize data..."
                                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-full py-4 pl-6 pr-16 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00f0ff]/50 transition-colors shadow-inner"
                                    disabled={!aiApiKey || isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || !aiApiKey || isTyping}
                                    className="absolute right-2 top-2 bottom-2 w-10 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:hover:bg-[#7c3aed] text-white rounded-full flex items-center justify-center transition-colors"
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {currentTab === 'training' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
                        <div className="glass shadow-2xl relative z-10">
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                <span className="text-[#22c55e]">🧠</span> AI Training & Methods
                            </h2>
                            <p className="text-white/40 text-sm mb-6">
                                Fine-tune your AI assistant. Paste your best sales methods, cold call scripts, company knowledge, or any specific instructions here. The AI will strictly follow these methods when responding to your chats.
                            </p>

                            <div className="space-y-4">
                                <textarea
                                    value={trainingData}
                                    onChange={(e) => setTrainingData(e.target.value)}
                                    placeholder="Example: 'Always keep emails under 3 sentences. Use the PAS (Problem-Agitation-Solution) framework. When targeting real estate leads, emphasize our 24/7 responsiveness...'"
                                    className="w-full h-[400px] bg-[#0a0f1a] border border-white/10 rounded-lg p-4 text-sm text-white/90 placeholder-white/20 focus:border-[#22c55e]/50 focus:outline-none resize-none"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={async () => {
                                            setSavingTraining(true)
                                            try { await supabase.from('ai_training_data').upsert({ user_id: user?.id, content: trainingData }) } catch(e){}
                                            setTimeout(() => setSavingTraining(false), 1000)
                                        }}
                                        disabled={savingTraining}
                                        className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {savingTraining ? 'Saving...' : '💾 Save Training Data'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentTab === 'settings' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
                        <div className="glass shadow-2xl relative z-10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span>⚙️</span> AI Model Configuration
                            </h2>
                            <p className="text-white/40 text-sm mb-8">
                                Skill Scraper Enterprise allows you to connect your own AI models. Your API keys are stored entirely locally in your browser and are never sent to our servers.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">AI Provider</label>
                                    <select 
                                        value={aiProvider} 
                                        onChange={(e) => {
                                            setAiProvider(e.target.value);
                                            setAiModel(PROVIDERS[e.target.value as keyof typeof PROVIDERS].models[0]);
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f0ff]/50 outline-none"
                                    >
                                        {Object.entries(PROVIDERS).map(([key, p]) => (
                                            <option key={key} value={key} className="bg-[#0f172a]">{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Model</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={aiModel} 
                                            onChange={(e) => setAiModel(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f0ff]/50 outline-none"
                                        >
                                            {(dynamicModels.length > 0 && aiProvider === 'gemini' ? dynamicModels : PROVIDERS[aiProvider as keyof typeof PROVIDERS].models).map(m => (
                                                <option key={m} value={m} className="bg-[#0f172a]">{m}</option>
                                            ))}
                                        </select>
                                        {aiProvider === 'gemini' && (
                                            <button 
                                                onClick={fetchGeminiModels}
                                                disabled={fetchingModels || !aiApiKey}
                                                className="px-4 py-3 bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-[#7c3aed]/30 disabled:opacity-50 transition-colors"
                                            >
                                                {fetchingModels ? '...' : 'Auto-Fetch'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">API Key</label>
                                    <input 
                                        type="password" 
                                        value={aiApiKey}
                                        onChange={(e) => setAiApiKey(e.target.value)}
                                        placeholder={`sk-...`}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f0ff]/50 outline-none placeholder-white/20"
                                    />
                                    <p className="text-xs text-white/30 mt-2">Required for the AI Assistant and Auto-Insights to function.</p>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button 
                                        onClick={handleSaveSettings}
                                        className="w-full py-3 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-[#002022] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {settingsSaved ? '✅ Saved Successfully' : 'Save Configuration'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
