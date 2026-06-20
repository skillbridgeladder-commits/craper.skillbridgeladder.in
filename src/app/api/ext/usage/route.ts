import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        // Parse body
        let count = 1
        try {
            const body = await request.json()
            if (typeof body.count === 'number') {
                count = body.count
            }
        } catch (e) {
            // Ignore parse errors, default to 1
        }

        // Initialize Supabase with the user's token
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        })

        // Verify user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if banned
        const { data: planCheck } = await supabase.from('user_plans').select('is_banned').eq('user_id', user.id).single()
        if (planCheck?.is_banned) {
            return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
        }

        // Use the increment_usage RPC if available
        const { error: rpcError } = await supabase.rpc('increment_usage', {
            p_user_id: user.id,
            p_count: count
        })

        if (rpcError) {
            // Fallback: direct update
            // First fetch current plan
            const { data: plan } = await supabase
                .from('user_plans')
                .select('used')
                .eq('user_id', user.id)
                .single()

            if (plan) {
                await supabase.from('user_plans').update({
                    used: (plan.used || 0) + count
                }).eq('user_id', user.id)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in /api/ext/usage:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
