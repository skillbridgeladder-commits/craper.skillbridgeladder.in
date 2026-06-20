const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data, error } = await adminClient.from('cookies').select('id, name, created_at, snapshot_id').limit(10);
    console.log("Cookies fetch error:", error);
    console.log("Cookies:", data);
}

run().catch(console.error);
