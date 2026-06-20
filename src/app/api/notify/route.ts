import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Skill Scraper <noreply@scraper.skillbridgeladder.in>'

async function sendEmail(to: string, subject: string, html: string) {
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set — skipping email')
        return { ok: true, skipped: true }
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    })
    return res
}

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { type, email, name, plan, amount, credits } = await request.json()

        let subject = ''
        let html = ''

        if (type === 'payment_approved') {
            subject = `✅ Payment Approved – ${plan} Plan Activated!`
            html = `
            <div style="font-family: Inter, sans-serif; background: #0a0f1a; color: #fff; padding: 40px; border-radius: 16px; max-width: 560px; margin: 0 auto;">
                <div style="text-align:center; margin-bottom: 32px;">
                    <h1 style="color: #00f0ff; font-size: 28px; margin: 0;">Skill Scraper</h1>
                    <p style="color: rgba(255,255,255,0.4); margin: 4px 0 0;">Lead generation, supercharged</p>
                </div>
                <div style="background: rgba(0,240,255,0.05); border: 1px solid rgba(0,240,255,0.2); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
                    <div style="font-size: 48px; text-align:center; margin-bottom: 16px;">✅</div>
                    <h2 style="color: #22c55e; text-align:center; margin: 0 0 8px;">Payment Approved!</h2>
                    <p style="color: rgba(255,255,255,0.7); text-align:center; margin: 0;">Hi ${name || email.split('@')[0]}, your ₹${amount} payment has been verified.</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="color: rgba(255,255,255,0.4); padding: 6px 0;">Plan Activated</td><td style="color: #00f0ff; font-weight: bold; text-align:right; text-transform: capitalize;">${plan}</td></tr>
                        <tr><td style="color: rgba(255,255,255,0.4); padding: 6px 0;">Credits Added</td><td style="color: #22c55e; font-weight: bold; text-align:right;">${credits?.toLocaleString() || '0'} Skillcoins</td></tr>
                        <tr><td style="color: rgba(255,255,255,0.4); padding: 6px 0;">Amount Paid</td><td style="color: #fff; font-weight: bold; text-align:right;">₹${amount}</td></tr>
                    </table>
                </div>
                <div style="text-align:center;">
                    <a href="https://scraper.skillbridgeladder.in/dashboard" style="display:inline-block; background: linear-gradient(135deg, #00f0ff, #7c3aed); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 15px;">Go to Dashboard →</a>
                </div>
                <p style="color: rgba(255,255,255,0.2); font-size: 12px; text-align:center; margin-top: 32px;">Skill Scraper · skillbridgeladder.in</p>
            </div>`

        } else if (type === 'payment_rejected') {
            subject = `❌ Payment Verification Failed`
            html = `
            <div style="font-family: Inter, sans-serif; background: #0a0f1a; color: #fff; padding: 40px; border-radius: 16px; max-width: 560px; margin: 0 auto;">
                <h1 style="color: #00f0ff; text-align:center;">Skill Scraper</h1>
                <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 28px; margin: 24px 0;">
                    <div style="font-size: 48px; text-align:center; margin-bottom: 16px;">❌</div>
                    <h2 style="color: #ef4444; text-align:center;">Payment Not Verified</h2>
                    <p style="color: rgba(255,255,255,0.6); text-align:center;">Hi ${name || email.split('@')[0]}, unfortunately we could not verify your payment screenshot. Please resubmit with a clear screenshot showing the transaction ID and amount.</p>
                </div>
                <div style="text-align:center;">
                    <a href="https://scraper.skillbridgeladder.in/upload-payment" style="display:inline-block; background: rgba(0,240,255,0.1); border: 1px solid #00f0ff; color: #00f0ff; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 600;">Resubmit Payment →</a>
                </div>
                <p style="color: rgba(255,255,255,0.2); font-size: 12px; text-align:center; margin-top: 32px;">Need help? Reply to this email.</p>
            </div>`

        } else if (type === 'welcome') {
            subject = `🚀 Welcome to Skill Scraper!`
            html = `
            <div style="font-family: Inter, sans-serif; background: #0a0f1a; color: #fff; padding: 40px; border-radius: 16px; max-width: 560px; margin: 0 auto;">
                <div style="text-align:center; margin-bottom: 32px;">
                    <h1 style="color: #00f0ff; font-size: 28px; margin: 0;">Skill Scraper</h1>
                </div>
                <div style="background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(124,58,237,0.08)); border: 1px solid rgba(0,240,255,0.15); border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align:center;">
                    <div style="font-size: 56px; margin-bottom: 16px;">🚀</div>
                    <h2 style="color: #fff; margin: 0 0 12px;">Welcome, ${name || 'Scraper'}!</h2>
                    <p style="color: rgba(255,255,255,0.6); margin: 0; line-height: 1.6;">Your account is ready. You start with <strong style="color: #00f0ff;">200 free Skillcoins</strong> to download your first batch of B2B leads from Google Maps.</p>
                </div>
                <div style="display:grid; gap: 12px; margin-bottom: 28px;">
                    ${[
                        ['1. Install Extension', 'Download the Chrome extension from your dashboard'],
                        ['2. Search Leads', 'Search any business type in any city worldwide'],
                        ['3. Export Data', 'Download as CSV or Excel with one click'],
                    ].map(([title, desc]) => `<div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 16px;"><strong style="color: #00f0ff;">${title}</strong><br><span style="color: rgba(255,255,255,0.5); font-size: 13px;">${desc}</span></div>`).join('')}
                </div>
                <div style="text-align:center;">
                    <a href="https://scraper.skillbridgeladder.in/dashboard" style="display:inline-block; background: linear-gradient(135deg, #00f0ff, #7c3aed); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 15px;">Get Started →</a>
                </div>
                <p style="color: rgba(255,255,255,0.2); font-size: 12px; text-align:center; margin-top: 32px;">Skill Scraper · skillbridgeladder.in</p>
            </div>`
        } else if (type === 'admin_alert') {
            subject = `🚨 New Support Ticket: ${plan || 'Support'}`
            html = `
            <div style="font-family: Inter, sans-serif; background: #0a0f1a; color: #fff; padding: 40px; border-radius: 16px; max-width: 560px; margin: 0 auto;">
                <h2 style="color: #00f0ff;">New Support Ticket</h2>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Category:</strong> ${plan || 'General'}</p>
                    <p><strong>Message:</strong></p>
                    <div style="color: rgba(255,255,255,0.7); font-style: italic; border-left: 2px solid #7c3aed; padding-left: 15px;">
                        ${amount || 'No message provided'}
                    </div>
                </div>
                <a href="https://scraper.skillbridgeladder.in/admin" style="color: #00f0ff;">View in Admin Panel →</a>
            </div>`
        } else {
            return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
        }

        await sendEmail(email, subject, html)
        return NextResponse.json({ success: true })

    } catch (err: unknown) {
        console.error('Notify error:', err)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
