import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// POST: Activate a master key for a user
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const { key_code } = await request.json()

        if (!key_code || typeof key_code !== 'string') {
            return NextResponse.json({ error: 'Missing key_code' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        })

        // Verify user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if the key exists and is valid
        const { data: keyData, error: keyError } = await supabase
            .from('enterprise_keys')
            .select('*')
            .eq('key_code', key_code.trim().toUpperCase())
            .single()

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Invalid key. Please check and try again.' }, { status: 404 })
        }

        if (!keyData.is_active) {
            return NextResponse.json({ error: 'This key has been revoked.' }, { status: 403 })
        }

        if (keyData.activated_by && keyData.activated_by !== user.id) {
            return NextResponse.json({ error: 'This key is already activated by another user.' }, { status: 409 })
        }

        // Activate the key for this user
        if (!keyData.activated_by) {
            await supabase.from('enterprise_keys').update({
                activated_by: user.id,
                activated_email: user.email,
                activated_at: new Date().toISOString()
            }).eq('id', keyData.id)
        }

        // Upgrade user plan to enterprise with the key's quota
        await supabase.from('user_plans').upsert({
            user_id: user.id,
            plan: 'enterprise',
            quota: keyData.quota,
            used: 0
        })

        return NextResponse.json({
            success: true,
            plan: 'enterprise',
            quota: keyData.quota,
            label: keyData.label,
            message: `Enterprise key activated! ${keyData.quota.toLocaleString()} credits unlocked.`
        })
    } catch (error) {
        console.error('Error in /api/ext/activate-key:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// GET: Check if user has an active enterprise key
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        })

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: keyData } = await supabase
            .from('enterprise_keys')
            .select('key_code, label, quota, used, activated_at, is_active')
            .eq('activated_by', user.id)
            .eq('is_active', true)
            .single()

        return NextResponse.json({ key: keyData || null })
    } catch (error) {
        console.error('Error in /api/ext/activate-key GET:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
