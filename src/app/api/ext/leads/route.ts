import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        
        const standardClient = createClient(supabaseUrl, supabaseAnonKey)
        const adminClient = createClient(supabaseUrl, supabaseServiceKey)

        const token = authHeader.split(' ')[1]
        const { data: { user }, error: authError } = await standardClient.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const leadsData = await req.json()
        
        if (!Array.isArray(leadsData) || leadsData.length === 0) {
            return NextResponse.json({ success: true, count: 0 })
        }

        const insertData = leadsData.map((lead: any) => ({
            user_id: user.id,
            data: lead,
        }))

        const { error } = await adminClient.from('scraped_leads').insert(insertData)

        if (error) {
            console.error('Error inserting leads:', error)
            return NextResponse.json({ error: 'Failed to sync leads', details: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: insertData.length })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
