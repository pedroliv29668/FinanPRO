
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('ERRO CRÍTICO: Variáveis do Supabase não encontradas! Verifique o painel da Vercel ou o arquivo .env');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');
