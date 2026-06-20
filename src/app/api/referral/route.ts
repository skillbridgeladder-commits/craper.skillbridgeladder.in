import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
    try {
        const { referrerCode, sessionToken } = await request.json()

        if (!referrerCode || !sessionToken) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${sessionToken}` } }
        })

        // Verify the user who was referred (this is the current authenticated user)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the referrer's full UUID
        const { data: referrerId, error: fnError } = await supabase.rpc('get_user_id_from_ref_code', { code: referrerCode })

        if (fnError || !referrerId) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
        }

        // Prevent self-referral
        if (referrerId === user.id) {
            return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
        }

        // Insert referral
        const { error: insertError } = await supabase.from('referrals').insert({
            referrer_id: referrerId,
            referred_user_id: user.id,
            referred_email: user.email,
            status: 'pending'
        })

        if (insertError) {
            // Typically means they already have a referral thanks to the UNIQUE constraint
            return NextResponse.json({ error: 'Referral already tracked' }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: 'Referral captured successfully' })
    } catch (error) {
        console.error('Error in /api/referral:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
