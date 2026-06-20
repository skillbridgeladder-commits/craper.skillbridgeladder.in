const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log("Checking if cookies are deleted when their snapshot is deleted...");
    
    // Check if we have any snapshots
    const { data: snapshots, error: snapErr } = await adminClient.from('cookie_snapshots').select('id');
    if (snapErr) throw snapErr;
    
    console.log("Existing snapshots:", snapshots?.length);
    
    // Check total cookies
    const { data: cookies, error: cookErr } = await adminClient.from('cookies').select('id');
    console.log("Existing cookies:", cookies?.length);
    
    // Let's create a snapshot and a cookie, then delete the snapshot
    const fakeUserId = '05304e60-e2f5-4867-b5bd-5016a5342cef'; 

    const { data: newSnap, error: newSnapErr } = await adminClient.from('cookie_snapshots').insert({
        user_id: fakeUserId,
        scan_session_id: 'test_del_123'
    }).select().single();
    
    if (newSnapErr) throw newSnapErr;
    console.log("Created test snapshot:", newSnap.id);
    
    const { error: newCookErr } = await adminClient.from('cookies').insert({
        snapshot_id: newSnap.id,
        user_id: fakeUserId,
        domain: 'testdelete.com',
        name: 'testdel',
        value: '123'
    });
    
    if (newCookErr) throw newCookErr;
    console.log("Created test cookie");
    
    const { data: beforeDelCookies } = await adminClient.from('cookies').select('id');
    console.log("Cookies before delete:", beforeDelCookies?.length);
    
    // Now delete snapshot
    await adminClient.from('cookie_snapshots').delete().eq('id', newSnap.id);
    console.log("Deleted snapshot");
    
    const { data: afterDelCookies } = await adminClient.from('cookies').select('id');
    console.log("Cookies after delete:", afterDelCookies?.length);
}

run().catch(console.error);
