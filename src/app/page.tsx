"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import AdBanner from '@/components/AdBanner'

export default function Home() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden" style={{ background: '#0a0f1a' }}>
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-30 pointer-events-none" style={{ background: 'linear-gradient(to right, #00f0ff, #7c3aed)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'linear-gradient(to left, #7c3aed, #00f0ff)' }} />

      {/* ━━━ HERO ━━━ */}
      <section className="w-full relative z-10" style={{ paddingTop: '180px', paddingBottom: '100px' }}>
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full text-[13px] font-bold"
              style={{
                border: '1px solid rgba(0,240,255,0.3)',
                background: 'rgba(0,240,255,0.08)',
                color: '#00f0ff',
                boxShadow: '0 0 20px rgba(0,240,255,0.15)'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse bg-[#00f0ff]" style={{ boxShadow: '0 0 10px #00f0ff' }} />
              Enterprise V2.0 is Live — Scrape Unlimited Leads
            </motion.div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }} className="font-black tracking-tighter leading-[1.05] mb-8 text-white">
              The Ultimate B2B<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#7c3aed] to-[#ec4899]">
                Lead Generation Engine
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/50 max-w-[650px] mb-12 font-medium leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
              Extract direct phone numbers, WhatsApp, and verified emails directly into our secure cloud. Harness the power of our new <strong>Power BI Analytics</strong> and <strong>Skill RAG AI</strong> to close more deals.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <Link href="/download" className="btn-glow text-lg py-4 px-10 gap-3">
                🚀 Download Free Extension
              </Link>
              <Link href="/pricing" className="btn-ghost text-lg py-4 px-10">
                View Enterprise Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ad Space */}
      <div className="container-main relative z-10"><AdBanner className="my-10 opacity-80" dataAdSlot="9355458561" /></div>

      {/* ━━━ DASHBOARD PREVIEW ━━━ */}
      <section className="w-full relative z-10 py-12">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1a] z-10 top-[50%]" />
            <div className="bg-[#111827] w-full h-[400px] sm:h-[600px] flex flex-col">
              <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0a0f1a]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 p-8 grid grid-cols-3 gap-6 opacity-80">
                <div className="col-span-3 flex gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="flex-1 h-24 rounded-xl border border-white/5 bg-white/[0.02]" />)}
                </div>
                <div className="col-span-2 h-64 rounded-xl border border-white/5 bg-white/[0.02]" />
                <div className="col-span-1 h-64 rounded-xl border border-white/5 bg-white/[0.02]" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section className="w-full relative z-10" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
        <div className="container-main">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-5 text-white">
              Enterprise Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7c3aed]">For Everyone</span>
            </motion.h2>
            <p className="text-white/40 text-lg font-medium max-w-[500px] mx-auto">
              We handle the complex data extraction, hosting, and AI analytics. You focus on closing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Unlimited Scraping', desc: 'No limits on your queries. Pinpoint leads by country, state, and city forever.' },
              { icon: '☁️', title: 'Secure Cloud Sync', desc: 'All extracted leads are securely synced to your cloud dashboard automatically in real-time.' },
              { icon: '🤖', title: 'Skill RAG AI Engine', desc: 'Chat with your data! Generate custom cold calling scripts and emails based on your live DB.' },
              { icon: '📊', title: 'Power BI Analytics', desc: 'Access highly dense executive dashboards to monitor your data pipeline and hit rates.' },
              { icon: '⚡', title: 'Serverless Architecture', desc: 'Runs natively in your browser. No proxy IPs, no complex installations, no heavy downloads.' },
              { icon: '✅', title: 'CRM Capabilities', desc: 'Track outreach status with one-click "Mark Called" syncing across your entire organization.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}
                className="glass-sm group hover:-translate-y-2 cursor-default">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-6 bg-white/[0.03] border border-white/10 group-hover:border-[#00f0ff]/50 group-hover:bg-[#00f0ff]/10 transition-all shadow-inner">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#00f0ff] transition-colors">{f.title}</h3>
                <p className="text-white/50 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ━━━ SOCIAL PROOF STATS ━━━ */}
      <section className="w-full relative z-10 py-16 border-y border-white/5 bg-[#111827]">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-12 text-center">
            {[
              { num: '5M+', label: 'Leads Extracted' },
              { num: '2,500+', label: 'Active Teams' },
              { num: 'Unlimited', label: 'Export Quota' },
              { num: '4.9★', label: 'Chrome Rating' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="text-4xl sm:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7c3aed]">{s.num}</div>
                <div className="text-sm uppercase tracking-[0.2em] text-white/30 font-bold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA BANNER ━━━ */}
      <section className="w-full relative z-10 py-32">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-[#111827] to-[#0a0f1a] border border-[#00f0ff]/20 rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden shadow-[0_0_100px_rgba(0,240,255,0.1)]">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #00f0ff 0%, transparent 70%)' }} />
            <h2 className="text-4xl sm:text-5xl font-black mb-6 relative z-10 text-white">Dominate Your Market Today.</h2>
            <p className="text-white/50 text-xl font-medium mb-10 max-w-[600px] mx-auto relative z-10">
              Join thousands of elite sales professionals using Skill Scraper Enterprise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
              <Link href="/download" className="btn-glow text-lg py-4 px-10 gap-2">
                Start Scraping For Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
