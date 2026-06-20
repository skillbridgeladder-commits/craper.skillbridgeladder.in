import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // need service role to update quota

export async function POST(request: Request) {
    try {
        const { sessionToken } = await request.json()
        if (!sessionToken) return NextResponse.json({ error: 'Missing auth token' }, { status: 400 })

        const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${sessionToken}` } }
        })

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Check if already claimed
        const { data: existing } = await supabaseAdmin
            .from('referrals')
            .select('id')
            .eq('referrer_id', user.id)
            .eq('referred_email', 'SHARED_REWARD')
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
        }

        // Insert the claim record
        const { error: insertError } = await supabaseAdmin.from('referrals').insert({
            referrer_id: user.id,
            referred_user_id: user.id, // self
            referred_email: 'SHARED_REWARD',
            status: 'verified' // auto verified
        })

        if (insertError) {
             return NextResponse.json({ error: 'Could not claim reward' }, { status: 500 })
        }

        // Add 20 Skillcoins to the user
        const { data: plan } = await supabaseAdmin.from('user_plans').select('quota').eq('user_id', user.id).single()
        if (plan) {
            await supabaseAdmin.from('user_plans').update({ quota: plan.quota + 20 }).eq('user_id', user.id)
        }

        return NextResponse.json({ success: true, message: 'Claimed 20 free Skillcoins!' })

    } catch (error) {
        console.error('Error in /api/claim-share:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
