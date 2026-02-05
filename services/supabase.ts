
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rixrytjnaxdjmlmtglhg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHJ5dGpuYXhkam1sbXRnbGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDUyNzUsImV4cCI6MjA4NTA4MTI3NX0.CKBxVq_j5EKARj1wzbMT_72E7bb3KKIDowoEZlp2sqY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
