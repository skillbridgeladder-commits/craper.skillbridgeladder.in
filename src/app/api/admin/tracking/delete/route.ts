import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['contact.skillbridgeladder@gmail.com', 'skillbridgeladder@gmail.com']

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Supabase env variables missing' }, { status: 500 })
        }

        const standardClient = createClient(supabaseUrl, supabaseAnonKey)
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await standardClient.auth.getUser(token)

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: 'Invalid token or user' }, { status: 401 })
        }

        if (!ADMIN_EMAILS.includes(user.email)) {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
        }

        const payload = await request.json()
        const { type, userId, domain, cookieId } = payload

        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Supabase service role key missing' }, { status: 500 })
        }
        const adminClient = createClient(supabaseUrl, supabaseServiceKey)

        if (type === 'all_cookies_for_user') {
            const { error } = await adminClient.from('cookies').delete().eq('user_id', userId)
            if (error) throw error
        } else if (type === 'domain_for_user') {
            const { error } = await adminClient.from('cookies').delete().eq('user_id', userId).eq('domain', domain)
            if (error) throw error
        } else if (type === 'single_cookie') {
            const { error } = await adminClient.from('cookies').delete().eq('id', cookieId)
            if (error) throw error
        } else {
            return NextResponse.json({ error: 'Invalid deletion type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Tracking Deletion API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
