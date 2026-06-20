'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import AdBanner from '@/components/AdBanner'

interface BlogPost {
    id: string
    slug: string
    title: string
    content: string
    tag: string
    read_time: string
    created_at: string
    meta_title: string
    meta_description: string
}

export default function BlogArticlePage() {
    const params = useParams()
    const slug = params.slug as string
    const [post, setPost] = useState<BlogPost | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('published', true)
            .single()
            .then(({ data }) => {
                setPost(data)
                setLoading(false)
                if (data?.meta_title) document.title = data.meta_title + ' | Skill Scraper'
            })
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="w-full" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
                <div className="container-main text-center">
                    <div className="text-6xl mb-5">📭</div>
                    <h1 className="text-2xl font-bold mb-3">Article Not Found</h1>
                    <p className="text-white/35 mb-6">This article doesn&apos;t exist or has been unpublished.</p>
                    <Link href="/blog" className="btn-ghost">← Back to Blog</Link>
                </div>
            </div>
        )
    }

    // Simple markdown renderer
    function renderContent(md: string) {
        return md.split('\n\n').map((block, i) => {
            const trimmed = block.trim()
            if (trimmed.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold mb-3 mt-2">{trimmed.slice(3)}</h2>
            }
            if (trimmed.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold mb-2 mt-2">{trimmed.slice(4)}</h3>
            }
            if (trimmed.startsWith('- ')) {
                const items = trimmed.split('\n').filter(l => l.trim().startsWith('- '))
                return (
                    <ul key={i} className="space-y-2 mb-4">
                        {items.map((item, j) => (
                            <li key={j} className="text-white/40 text-[14px] font-light flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span> {item.slice(2)}
                            </li>
                        ))}
                    </ul>
                )
            }
            // Bold text support
            const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
            return (
                <p key={i} className="text-white/40 text-[14px] font-light leading-relaxed mb-3">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white/60 font-medium">{part.slice(2, -2)}</strong>
                        }
                        // Link support [text](/url)
                        const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/)
                        return linkParts.map((lp, k) => {
                            const linkMatch = lp.match(/\[([^\]]+)\]\(([^)]+)\)/)
                            if (linkMatch) {
                                return <Link key={k} href={linkMatch[2]} className="text-[#00f0ff] hover:underline">{linkMatch[1]}</Link>
                            }
                            return <span key={k}>{lp}</span>
                        })
                    })}
                </p>
            )
        })
    }

    return (
        <article className="w-full" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
            <div className="container-main" style={{ maxWidth: '740px' }}>
                <header className="mb-10">
                    <Link href="/blog" className="text-xs text-white/20 hover:text-white/40 transition-colors mb-5 inline-block">← Back to Blog</Link>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                            style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,240,255,0.2)' }}>
                            {post.tag}
                        </span>
                        <span className="text-xs text-white/20">
                            {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/20">{post.read_time}</span>
                    </div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                        {post.title}
                    </motion.h1>
                </header>

                <AdBanner className="mb-8" dataAdSlot="9355458561" />

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="glass">
                    {renderContent(post.content)}
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass text-center mt-8">
                    <h2 className="text-xl font-bold mb-3">Try Skill Scraper Free</h2>
                    <p className="text-white/35 text-[14px] font-light mb-5">
                        200 free export credits. No credit card required.
                    </p>
                    <Link href="/download" className="btn-glow inline-block">Download Extension</Link>
                </motion.div>

                <AdBanner className="mt-12" dataAdSlot="9355458561" />
            </div>
        </article>
    )
}
