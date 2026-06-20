import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { email, credits } = await request.json()

        if (!email || !credits || credits <= 0) {
            return NextResponse.json({ error: 'Email and valid credits required' }, { status: 400 })
        }

        // Look for user's existing plan by querying user_plans with some heuristic
        // Since we don't have service role key, admin must handle credits via Supabase dashboard
        // This endpoint works as a placeholder - real credit updates happen through the approve flow

        return NextResponse.json({
            error: 'Manual credits require SUPABASE_SERVICE_ROLE_KEY. Please use the Approve flow or add the key to env.'
        }, { status: 501 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
}
