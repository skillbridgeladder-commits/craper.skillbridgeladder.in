import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the service role key to bypass RLS, or we can just use the anon key 
// since we verify the JWT token first.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

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

        // Fetch plan
        const { data: planData, error: planError } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (planError && planError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw planError
        }

        let plan = planData

        if (plan?.is_banned) {
            return NextResponse.json({ error: 'Your account has been suspended by an administrator.' }, { status: 403 })
        }

        if (!plan) {
            // Create default plan
            const { data: newPlan, error: insertError } = await supabase
                .from('user_plans')
                .upsert({
                    user_id: user.id,
                    plan: 'free',
                    quota: 200,
                    used: 0
                })
                .select()
                .single()

            if (insertError) throw insertError
            plan = newPlan
        }

        // Check if monthly reset is needed
        const cycleStart = new Date(plan.cycle_start || plan.created_at)
        const now = new Date()
        const daysDiff = (now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)

        if (daysDiff >= 30) {
            // Reset usage
            await supabase.from('user_plans').update({
                used: 0,
                cycle_start: now.toISOString()
            }).eq('user_id', user.id)
            plan.used = 0
        }

        return NextResponse.json(plan)
    } catch (error) {
        console.error('Error in /api/ext/plan:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
