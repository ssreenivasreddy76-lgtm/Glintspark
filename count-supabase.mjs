import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function count() {
  const { count, error } = await supabase.from('problems').select('*', { count: 'exact', head: true }).eq('is_practice', true);
  console.log("Practice problems count:", count);
}

count();
