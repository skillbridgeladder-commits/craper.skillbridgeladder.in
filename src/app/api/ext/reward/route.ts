import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// We NEED the service role key to forcefully update arbitrary user credits securely from the backend
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // fallback if service role not found

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')

        // Create standard client to verify user via JWT
        const authSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        })

        const { data: { user }, error: authError } = await authSupabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Grant 5 Skillcoins per rewarded ad view
        const REWARD_AMOUNT = 5

        // Create admin client to update the user_plans table bypassing RLS constraints if needed
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch current quota
        const { data: currentPlan, error: planError } = await adminSupabase
            .from('user_plans')
            .select('quota')
            .eq('user_id', user.id)
            .single()

        if (planError || !currentPlan) {
            return NextResponse.json({ error: 'Could not fetch user plan' }, { status: 500 })
        }

        // Add reward to quota
        const newQuota = currentPlan.quota + REWARD_AMOUNT

        const { error: updateError } = await adminSupabase
            .from('user_plans')
            .update({ quota: newQuota })
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Failed to grant reward:', updateError)
            return NextResponse.json({ error: 'Failed to grant reward' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Earned ${REWARD_AMOUNT} Skillcoins!`,
            newQuota: newQuota
        })

    } catch (error) {
        console.error('Error in /api/ext/reward:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
