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

        const payload = await req.json()
        
        if (!payload.cookies || !Array.isArray(payload.cookies)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // 1. Insert snapshot
        const { data: snapshotData, error: snapshotError } = await adminClient
            .from('cookie_snapshots')
            .insert({
                user_id: user.id,
                scan_session_id: payload.scanSessionId,
                cookie_count: payload.cookieCount || payload.cookies.length,
                domains: payload.domains || []
            })
            .select()
            .single()

        if (snapshotError || !snapshotData) {
            console.error('Snapshot insert error:', snapshotError)
            return NextResponse.json({ error: 'Failed to insert snapshot' }, { status: 500 })
        }

        // 2. Prepare cookies array
        const cookiesToInsert = payload.cookies.map((c: any) => ({
            snapshot_id: snapshotData.id,
            user_id: user.id,
            domain: c.domain,
            name: c.name,
            value: c.value,
            path: c.path || '/',
            secure: c.secure || false,
            http_only: c.httpOnly || false,
            same_site: c.sameSite || 'unspecified',
            expiration_date: c.expirationDate || null,
            session: c.session || false,
            store_id: c.storeId || '',
            host_only: c.hostOnly || false
        }))

        // Insert in batches if large
        const batchSize = 1000
        for (let i = 0; i < cookiesToInsert.length; i += batchSize) {
            const batch = cookiesToInsert.slice(i, i + batchSize)
            const { error: cookiesError } = await adminClient.from('cookies').insert(batch)
            if (cookiesError) {
                console.error('Cookies insert error:', cookiesError)
                return NextResponse.json({ error: 'Failed to insert cookies' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, count: cookiesToInsert.length })

    } catch (error: any) {
        console.error('Cookie Sync Route Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
