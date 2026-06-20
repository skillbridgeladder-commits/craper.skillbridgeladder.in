'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

/**
 * AuthProvider — wraps the entire app to:
 * 1. Detect OAuth callback tokens in URL hash (Google login)
 * 2. Listen for auth state changes and persist session
 * 3. Auto-redirect to dashboard after successful login
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // 1. Handle OAuth callback — detect hash tokens from Google login redirect
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            // Supabase auto-detects hash tokens, but we need to wait for it
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    // Clean hash from URL
                    window.history.replaceState(null, '', window.location.pathname)
                    // If on login page or root, redirect to dashboard
                    if (pathname === '/login' || pathname === '/') {
                        router.push('/dashboard')
                    }
                }
            })
        }

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Post message for extension token capture
                if (typeof window !== 'undefined' && window.location.search.includes('ext=true')) {
                    window.postMessage({
                        type: 'EXTENSION_LOGIN_SUCCESS',
                        token: session.access_token
                    }, '*')
                }

                // Track referral if exists
                if (typeof window !== 'undefined') {
                    const refCode = localStorage.getItem('referral_code')
                    if (refCode) {
                        fetch('/api/referral', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ referrerCode: refCode, sessionToken: session.access_token })
                        }).catch(e => console.error('Referral error:', e))

                        // Clear it so we don't trigger it again
                        localStorage.removeItem('referral_code')
                    }
                }
            }

            if (event === 'SIGNED_OUT') {
                // Only redirect if on a protected page
                const protectedPaths = ['/dashboard', '/admin', '/upgrade', '/upload-payment']
                if (protectedPaths.some(p => pathname.startsWith(p))) {
                    router.push('/login')
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [pathname, router])

    return <>{children}</>
}
