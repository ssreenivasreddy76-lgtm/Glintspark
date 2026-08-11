import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkxgfzqihilutfkaelcy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreGdmenFpaGlsdXRma2FlbGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDYwMTksImV4cCI6MjA5NzgyMjAxOX0.2Fpz1qAfhZVu2W2hOXmBUHT9M29JdoD1luT_gvxIbYw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('problems').select('id');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  console.log(`Found ${data.length} problems to delete.`);
  
  // To avoid timeout/rate limits if many, do it in chunks or loop
  for (let p of data) {
    const { error: delErr } = await supabase.from('problems').delete().eq('id', p.id);
    if (delErr) {
       console.error(`Failed to delete ${p.id}:`, delErr);
    } else {
       console.log(`Deleted ${p.id}`);
    }
  }
  console.log("Done deleting all problems.");
}

run();
