import https from 'https';

const SUPABASE_URL = 'https://hkxgfzqihilutfkaelcy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreGdmenFpaGlsdXRma2FlbGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDYwMTksImV4cCI6MjA5NzgyMjAxOX0.2Fpz1qAfhZVu2W2hOXmBUHT9M29JdoD1luT_gvxIbYw';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

function fetchProblems() {
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/rest/v1/problems?select=*&is_practice=eq.true`, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function insertTestCases(testCases) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${SUPABASE_URL}/rest/v1/hidden_test_cases`, {
      method: 'POST',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(JSON.stringify(testCases));
    req.end();
  });
}

async function run() {
  console.log("Fetching practice problems...");
  const problems = await fetchProblems();
  
  if (!Array.isArray(problems)) {
      console.log("Failed to fetch:", problems);
      return;
  }
  
  console.log(`Found ${problems.length} practice problems.`);
  
  let allTestCases = [];

  for (const p of problems) {
    const title = p.title.toLowerCase();
    console.log(`Generating 50 test cases for: ${p.title} (${p.id})`);
    
    for (let i = 1; i <= 50; i++) {
      let input = "";
      let output = "";
      
      if (title.includes("welcome to glintspark")) {
        // No input, output is fixed
        input = "";
        output = "Welcome to GlintSpark";
      } 
      else if (title.includes("print your name")) {
        // Input is a name
        const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy"];
        const name = names[i % names.length] + i;
        input = name;
        output = `Hello ${name}`;
      }
      else if (title.includes("grocery bill calculator")) {
        // price and quantity
        const price = (Math.random() * 100 + 1).toFixed(2);
        const qty = Math.floor(Math.random() * 10) + 1;
        input = `${price}\n${qty}`;
        output = (parseFloat(price) * qty).toFixed(2);
      }
      else if (title.includes("smart shopping discount")) {
        // total amount, discount if > 1000
        const total = (Math.random() * 2000 + 100).toFixed(2);
        input = total;
        if (parseFloat(total) > 1000) {
          output = (parseFloat(total) * 0.9).toFixed(2); // 10% discount example
        } else {
          output = total;
        }
      } else {
        // Generic fallback
        input = `${i}`;
        output = `${i}`;
      }
      
      allTestCases.push({
        problem_id: p.id,
        input_data: input,
        expected_output: output,
        is_hidden: true
      });
    }
  }

  if (allTestCases.length > 0) {
    console.log(`Inserting ${allTestCases.length} total test cases in batches...`);
    
    const batchSize = 100;
    for (let i = 0; i < allTestCases.length; i += batchSize) {
      const batch = allTestCases.slice(i, i + batchSize);
      await insertTestCases(batch);
      console.log(`Inserted batch ${i/batchSize + 1}`);
    }
    
    console.log("Done!");
  } else {
    console.log("No test cases generated.");
  }
}

run().catch(console.error);
