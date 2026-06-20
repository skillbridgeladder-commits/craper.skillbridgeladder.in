import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['contact.skillbridgeladder@gmail.com', 'skillbridgeladder@gmail.com']

export async function GET(request: Request) {
    try {
        // 1. Verify Authentication using the Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
        }

        // Initialize standard Supabase client for auth verification
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

        // 2. Initialize Admin Supabase Client (bypasses RLS)
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Supabase service role key missing' }, { status: 500 })
        }
        const adminClient = createClient(supabaseUrl, supabaseServiceKey)

        // 3. Fetch all cookies (limit 1000 for safety, order by newest)
        const { data: cookiesData, error: cookiesError } = await adminClient
            .from('cookies')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000)

        // Fetch scraped leads (limit 500)
        const { data: leadsData, error: leadsError } = await adminClient
            .from('scraped_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500)

        if (cookiesError || leadsError) {
            console.error('Error fetching tracking data:', cookiesError || leadsError)
            return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
        }

        // Fetch user emails to map user_id -> email
        const { data: userPlans } = await adminClient.from('user_plans').select('user_id, email')
        const emailMap: Record<string, string> = {}
        userPlans?.forEach(u => {
            if (u.email && u.user_id) emailMap[u.user_id] = u.email
        })

        // Fetch from auth.users using admin api
        const { data: authUsers } = await adminClient.auth.admin.listUsers()
        authUsers?.users.forEach(u => {
            if (u.email && u.id) emailMap[u.id] = u.email
        })

        // Map emails
        const enrichedCookies = cookiesData?.map(cookie => ({
            ...cookie,
            user_email: emailMap[cookie.user_id] || 'Unknown User'
        })) || []

        const enrichedLeads = leadsData?.map(lead => ({
            ...lead,
            user_email: emailMap[lead.user_id] || 'Unknown User',
            data_preview: typeof lead.data === 'string' ? lead.data : JSON.stringify(lead.data)
        })) || []

        return NextResponse.json({ success: true, cookies: enrichedCookies, leads: enrichedLeads })

    } catch (error: any) {
        console.error('Tracking API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
