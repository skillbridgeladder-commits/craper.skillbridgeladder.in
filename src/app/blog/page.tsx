'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdBanner from '@/components/AdBanner'

interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    tag: string
    read_time: string
    created_at: string
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('blog_posts')
            .select('id, slug, title, excerpt, tag, read_time, created_at')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setPosts(data || [])
                setLoading(false)
            })
    }, [])

    return (
        <>
            <section className="w-full" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
                <div className="container-main text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-black tracking-[-0.03em] mb-4">
                            Lead Generation <span className="text-grad-cyan">Blog</span>
                        </h1>
                        <p className="text-white/35 text-[16px] font-light max-w-[520px] mx-auto">
                            Tips, tutorials, and strategies to grow your business with Google Maps data extraction.
                        </p>
                    </motion.div>
                </div>
            </section>

            <AdBanner className="my-8" dataAdSlot="9355458561" />

            <section className="w-full" style={{ paddingBottom: '100px' }}>
                <div className="container-main" style={{ maxWidth: '820px' }}>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#00f0ff] animate-spin"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="glass text-center py-12">
                            <div className="text-4xl mb-3">📝</div>
                            <p className="text-white/35 font-light">No articles published yet. Stay tuned!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {posts.map((post, i) => (
                                <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}>
                                    <Link href={`/blog/${post.slug}`} className="glass block group hover:!border-[var(--accent)]/30 transition-all">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
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
                                        <h2 className="text-xl font-bold mb-2 group-hover:text-[#00f0ff] transition-colors">{post.title}</h2>
                                        <p className="text-white/35 text-[14px] font-light leading-relaxed">{post.excerpt}</p>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
