const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const fakeUserId = '05304e60-e2f5-4867-b5bd-5016a5342cef'; // mahek.skillbridge@gmail.com

    // Insert fake cookie snapshot
    const { data: snapshot, error: snapErr } = await adminClient.from('cookie_snapshots').insert({
        user_id: fakeUserId,
        scan_session_id: 'fake_scan_123',
        cookie_count: 1,
        domains: ['example.com']
    }).select().single();

    if (snapErr) throw snapErr;

    // Insert fake cookie
    const { error: cookieErr } = await adminClient.from('cookies').insert({
        snapshot_id: snapshot.id,
        user_id: fakeUserId,
        domain: 'example.com',
        name: 'test_cookie_mahek',
        value: 'dummy_value',
        path: '/',
        secure: true,
        http_only: true,
        same_site: 'lax'
    });

    if (cookieErr) throw cookieErr;

    // Insert fake lead
    const { error: leadErr } = await adminClient.from('scraped_leads').insert({
        user_id: fakeUserId,
        data: { name: 'Test Business Mahek', phone: '123456789' }
    });

    if (leadErr) throw leadErr;

    console.log("Successfully inserted fake data for Mahek!");
}

run().catch(console.error);
