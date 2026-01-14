import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("⚠️ Supabase Credentials Missing in Client!", {
        url: SUPABASE_URL,
        key: SUPABASE_KEY ? 'Present' : 'Missing'
    });
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');
