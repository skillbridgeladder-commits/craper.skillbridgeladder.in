'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AdBannerProps {
    dataAdSlot?: string
    dataAdFormat?: string
    dataFullWidthResponsive?: string
    className?: string
}

export default function AdBanner({
    dataAdSlot = '9355458561',
    dataAdFormat = 'auto',
    dataFullWidthResponsive = 'true',
    className = ''
}: AdBannerProps) {
    const [loading, setLoading] = useState(true)
    const [isEnterprise, setIsEnterprise] = useState(false)
    const [adLoaded, setAdLoaded] = useState(false)

    useEffect(() => {
        async function checkPlan() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('user_plans').select('plan').eq('user_id', user.id).single()
                if (data && data.plan === 'enterprise') {
                    setIsEnterprise(true)
                }
            }
            setLoading(false)
        }
        checkPlan()
    }, [])

    useEffect(() => {
        if (!loading && !isEnterprise && !adLoaded) {
            try {
                // Push ad
                const adsbygoogle = (window as any).adsbygoogle
                if (adsbygoogle) {
                    adsbygoogle.push({})
                    setAdLoaded(true)
                }
            } catch (e) {
                console.error('AdSense error', e)
            }
        }
    }, [loading, isEnterprise, adLoaded])

    // Wait until auth state is known
    if (loading) return null

    // Do NOT show ads to Enterprise users!
    if (isEnterprise) return null

    return (
        <div className={`w-full overflow-hidden flex justify-center ${className}`}>
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', minHeight: '90px' }}
                data-ad-client="ca-pub-5046331321616410"
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive}>
            </ins>
        </div>
    )
}
