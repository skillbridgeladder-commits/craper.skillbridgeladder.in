import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { name, email, category, message, transaction_id } = await request.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
        }

        const { error } = await supabase.from('support_tickets').insert({
            name,
            email,
            category: category || 'support',
            message,
            transaction_id: transaction_id || null,
            status: 'open'
        })

        if (error) {
            console.error('Support ticket insert error:', error)
        }

        // Notify Admin
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://scraper.skillbridgeladder.in'}/api/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin_alert',
                    email: 'contact.skillbridgeladder@gmail.com', // Admin destination
                    name: name,
                    plan: category, // Using plan field as category
                    amount: message // Using amount field as message
                })
            })
        } catch (_) { /* silent */ }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to submit' }, { status: 500 })
    }
}
