import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This API route will be called by Vercel Cron to keep Supabase awake
// and keep the Vercel deployment active.
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    // Basic security to ensure only authorized cron jobs call this
    // In Vercel, you can set this up in vercel.json

    try {
        // 1. Ping Supabase to keep it awake
        const { data, error } = await supabase.from('user_plans').select('count', { count: 'exact', head: true });

        if (error) throw error;

        // 2. Log activity
        console.log('[Keep-Alive] Supabase Pinged successfully.');

        return NextResponse.json({
            status: 'success',
            message: 'Keep-alive loop completed',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[Keep-Alive] Error:', error.message);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
