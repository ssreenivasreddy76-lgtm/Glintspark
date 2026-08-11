import { createClient } from '@supabase/supabase-js';
import https from 'https';

const SUPABASE_URL = 'https://hkxgfzqihilutfkaelcy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreGdmenFpaGlsdXRma2FlbGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDYwMTksImV4cCI6MjA5NzgyMjAxOX0.2Fpz1qAfhZVu2W2hOXmBUHT9M29JdoD1luT_gvxIbYw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data: problems, error } = await supabase.from('problems').select(`
    id, title,
    hidden_test_cases (
      input_data,
      expected_output
    )
  `).in('id', ['178468381970569kcq', '1784684372551d3b9j']);
  
  if (error) console.error("Error:", error);
  console.log("Problems with relations:", JSON.stringify(problems?.map(p => ({id: p.id, title: p.title, cases: p.hidden_test_cases?.length})), null, 2));
}

check();
