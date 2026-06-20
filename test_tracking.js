const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data: users } = await adminClient.auth.admin.listUsers();
    console.log("Total users:", users?.users?.length);
    users?.users?.forEach(u => console.log("User:", u.email, u.id));

    const { data: cookies } = await adminClient.from('cookies').select('user_id').order('created_at', { ascending: false }).limit(100);
    const cookieUserIds = [...new Set(cookies?.map(c => c.user_id) || [])];
    console.log("Cookies exist for user IDs:", cookieUserIds);

    const { data: leads } = await adminClient.from('scraped_leads').select('user_id').order('created_at', { ascending: false }).limit(100);
    const leadUserIds = [...new Set(leads?.map(l => l.user_id) || [])];
    console.log("Leads exist for user IDs:", leadUserIds);
}

run().catch(console.error);
