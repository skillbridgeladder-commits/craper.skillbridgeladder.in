const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkhnqrgauiesnzvxtwyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraG5xcmdhdWllc256dnh0d3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NzE3NCwiZXhwIjoyMDg4NTMzMTc0fQ.N8cCQBUTLv_KEeSlktCNjMQzR8lCF5xu8pHZ-2_qKBU';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log("Applying unique constraints...");

    // Instead of using raw SQL via the client (which often isn't supported without rpc), 
    // we'll create a temporary SQL file that we will run using psql/curl or similar, 
    // or just instruct the user to run it via the Supabase dashboard.
    // However, I will first wipe the existing duplicate cookies via the API so the SQL constraint doesn't fail.
    
    console.log("Wiping existing cookies to prepare for unique constraint...");
    // We can't do a mass delete without a condition easily in supabase JS, 
    // but we can delete snapshots, which will cascade delete the cookies.
    const { data: snapshots, error: fetchErr } = await adminClient.from('cookie_snapshots').select('id');
    if (fetchErr) throw fetchErr;

    if (snapshots && snapshots.length > 0) {
        const ids = snapshots.map(s => s.id);
        const { error: delErr } = await adminClient.from('cookie_snapshots').delete().in('id', ids);
        if (delErr) throw delErr;
        console.log(`Deleted ${ids.length} snapshots (cascading cookies).`);
    } else {
        console.log("No snapshots found.");
    }

    console.log("Cleanup complete. Ready for SQL application.");
}

run().catch(console.error);
