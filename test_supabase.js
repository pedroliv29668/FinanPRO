import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rixrytjnaxdjmlmtglhg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHJ5dGpuYXhkam1sbXRnbGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDUyNzUsImV4cCI6MjA4NTA4MTI3NX0.CKBxVq_j5EKARj1wzbMT_72E7bb3KKIDowoEZlp2sqY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable() {
    const { data, error } = await supabase.from('app_state').select('id').limit(1);
    
    if (error) {
        console.error("SUPABASE ERROR DE TIPO:", error.code);
        console.error("DIAGNOSTICO:", error.message);
    } else {
        console.log("THE TABLE EXISTS! Rows returned:", data.length);
    }
}

testTable();
