'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV_LINKS = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/enterprise', label: 'Enterprise' },
    { href: '/referrals', label: 'Referrals' },
    { href: '/download', label: 'Download' },
    { href: '/contact', label: 'Support' },
]

export default function Navbar() {
    const [hidden, setHidden] = useState(false)
    const [lastY, setLastY] = useState(0)
    const [atTop, setAtTop] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()

    // Pages where we DON'T show the public navbar
    const hideOn = ['/dashboard', '/admin', '/upload-payment', '/upgrade']
    const shouldHide = hideOn.some(p => pathname.startsWith(p))

    useEffect(() => {
        const handle = () => {
            const y = window.scrollY
            setAtTop(y < 20)
            setHidden(y > lastY && y > 100)
            setLastY(y)
        }
        window.addEventListener('scroll', handle, { passive: true })
        return () => window.removeEventListener('scroll', handle)
    })

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const [user, setUser] = useState<{ email?: string } | null>(null)

    // Check user auth state
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: any) => {
            setUser(user ? { email: user.email } : null)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ? { email: session.user.email } : null)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (shouldHide) return null

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
                style={{
                    transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
                    background: atTop && !mobileOpen ? 'transparent' : 'rgba(3, 0, 20, 0.85)',
                    backdropFilter: atTop && !mobileOpen ? 'none' : 'blur(20px)',
                    WebkitBackdropFilter: atTop && !mobileOpen ? 'none' : 'blur(20px)',
                    borderBottom: atTop && !mobileOpen ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div className="container-main flex items-center justify-between" style={{ height: '72px' }}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Skill Scraper Home">
                        <img src="/logo.png" alt="Skill Scraper" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-lg font-bold tracking-tight">Skill Scraper</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-5">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-white' : 'text-white/45 hover:text-white'}`}>
                                {link.label}
                            </Link>
                        ))}
                        {user ? (
                            <Link href="/dashboard" className="btn-glow !py-2.5 !px-5 !text-[13px]">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login"
                                    className="text-sm font-medium text-white/45 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link href="/login" className="btn-glow !py-2.5 !px-5 !text-[13px]">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Dashboard + Hamburger */}
                    <div className="flex items-center gap-3 md:hidden">
                        <Link href={user ? "/dashboard" : "/login"} className="btn-glow !py-2 !px-4 !text-[12px]">
                            {user ? "Dashboard" : "Log In"}
                        </Link>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileOpen}
                        >
                            <div className="flex flex-col gap-[5px]">
                                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                                <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-400 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ background: 'rgba(3, 0, 20, 0.97)', backdropFilter: 'blur(30px)' }}
            >
                <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8" style={{ paddingTop: '80px' }}>
                    {NAV_LINKS.map((link, i) => (
                        <Link key={link.href} href={link.href}
                            className={`text-2xl font-semibold transition-all duration-300 ${pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'}`}
                            style={{
                                transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                                opacity: mobileOpen ? 1 : 0,
                                transitionDelay: `${i * 60}ms`,
                            }}>
                            {link.label}
                        </Link>
                    ))}

                    <div className="w-16 h-[1px] bg-white/10 my-2" />

                    {!user && (
                        <Link href="/login"
                            className="text-lg font-medium text-white/50 hover:text-white transition-colors"
                            style={{
                                transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                                opacity: mobileOpen ? 1 : 0,
                                transitionDelay: `${NAV_LINKS.length * 60}ms`,
                            }}>
                            Log In
                        </Link>
                    )}

                    <Link href={user ? "/dashboard" : "/login"}
                        className="btn-glow !py-4 !px-10 !text-[16px] mt-4"
                        style={{
                            transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                            opacity: mobileOpen ? 1 : 0,
                            transitionDelay: `${(NAV_LINKS.length + 1) * 60}ms`,
                        }}>
                        {user ? "Go to Dashboard" : "Sign Up"}
                    </Link>
                </div>
            </div>
        </>
    )
}
