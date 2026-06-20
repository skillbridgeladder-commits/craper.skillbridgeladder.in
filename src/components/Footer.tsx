'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
    const pathname = usePathname()

    // Hide footer on dashboard pages
    const hideOn = ['/dashboard', '/admin', '/upload-payment']
    if (hideOn.some(p => pathname.startsWith(p))) return null

    return (
        <footer className="w-full border-t border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="container-main" style={{ paddingTop: '44px', paddingBottom: '24px' }}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                    <Link href="/" className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="Skill Scraper" className="w-7 h-7 object-contain opacity-60" />
                        <span className="text-base font-bold text-white/60">Skill Scraper</span>
                    </Link>
                    <div className="flex flex-wrap justify-center gap-6 text-[13px] text-white/35 font-medium">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/download" className="hover:text-white transition-colors">Download</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/help" className="hover:text-white transition-colors">Help</Link>
                        <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
                    </div>
                </div>
                <p className="mt-8 text-center text-[11px] text-white/15 font-light">
                    © {new Date().getFullYear()} SkillBridge Ladder. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
