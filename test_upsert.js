const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data, error } = await adminClient.from('cookies').select('id').limit(1);
    console.log("Cookies fetch error:", error);
    
    // Let's test the upsert to see if it throws a constraint error
    const fakeUserId = '05304e60-e2f5-4867-b5bd-5016a5342cef'; 

    const { error: upsertErr } = await adminClient.from('cookies').upsert([{
        snapshot_id: '00000000-0000-0000-0000-000000000000', // Might fail FK
        user_id: fakeUserId,
        domain: 'testupsert.com',
        name: 'test',
        value: '123',
        path: '/'
    }], { onConflict: 'user_id, domain, name, path' });

    console.log("Upsert Error:", upsertErr);
}

run().catch(console.error);
