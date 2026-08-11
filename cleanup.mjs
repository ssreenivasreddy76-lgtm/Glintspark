import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkxgfzqihilutfkaelcy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreGdmenFpaGlsdXRma2FlbGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDYwMTksImV4cCI6MjA5NzgyMjAxOX0.2Fpz1qAfhZVu2W2hOXmBUHT9M29JdoD1luT_gvxIbYw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanup() {
  console.log("Fetching duplicate empty problems...");
  const { data: problems } = await supabase.from('problems').select('id, title').gte('id', '1784684200000');
  
  if (problems && problems.length > 0) {
    console.log(`Found ${problems.length} duplicated problems to delete.`);
    let deletedCount = 0;
    for (const p of problems) {
      const { error } = await supabase.from('problems').delete().eq('id', p.id);
      if (!error) deletedCount++;
    }
    console.log(`Successfully deleted ${deletedCount} empty duplicates!`);
  } else {
    console.log("No duplicates found to clean up.");
  }
}

cleanup();
