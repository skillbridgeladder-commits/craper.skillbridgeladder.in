import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Plans configuration (INR)
export const PLANS = {
    free: { name: 'Free', price: 0, quota: 200, label: 'Free', features: ['200 export credits', 'WhatsApp extraction', 'Email extraction', 'CSV/XLSX export', 'Location filters'] },
    starter: { name: 'Starter', price: 199, quota: 2000, label: '₹199', features: ['2,000 export credits', 'Everything in Free', 'Priority support', 'Saved scrape history'] },
    pro: { name: 'Pro', price: 499, quota: 10000, label: '₹499', features: ['10,000 export credits', 'Everything in Starter', 'Bulk export', 'API access'] },
    enterprise: { name: 'Enterprise', price: 0, quota: 0, label: 'Contact Us', features: ['Custom credit packs', 'Everything in Pro', 'Dedicated support', 'Custom integrations'] },
}

export type PlanKey = keyof typeof PLANS
