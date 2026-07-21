export type ExecutionResult = {
  stdout: string;
  stderr: string;
  status: string;
};

type LanguageSupport = {
  judge0Id: number;
  pistonLang: string;
  pistonVersion: string;
  jdoodleLang: string;
};

// Map our internal language IDs to the specific IDs required by different APIs
const langMap: Record<number, LanguageSupport> = {
  71: { judge0Id: 71, pistonLang: 'python', pistonVersion: '3.10.0', jdoodleLang: 'python3' }, // Python 3
  63: { judge0Id: 63, pistonLang: 'javascript', pistonVersion: '18.15.0', jdoodleLang: 'nodejs' }, // JavaScript
  54: { judge0Id: 54, pistonLang: 'c++', pistonVersion: '10.2.0', jdoodleLang: 'cpp17' }, // C++
  62: { judge0Id: 62, pistonLang: 'java', pistonVersion: '15.0.2', jdoodleLang: 'java' }, // Java
  50: { judge0Id: 50, pistonLang: 'c', pistonVersion: '10.2.0', jdoodleLang: 'c' }, // C
  51: { judge0Id: 51, pistonLang: 'csharp', pistonVersion: '5.0.201', jdoodleLang: 'csharp' } // C#
};

/**
 * TIER 1: GlintSpark Custom Cloud Run Engine (100% Free, Private, Auto-scaling)
 */
async function executeCustomCloud(lang: LanguageSupport, code: string, stdin: string): Promise<ExecutionResult> {
  console.log("🌊 Waterfall: Attempting Tier 1 (Custom Cloud Run Engine)...");
  
  const CLOUD_URL = 'https://glintspark-compiler-701610241876.asia-south2.run.app/execute';
  
  const res = await fetch(CLOUD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang.jdoodleLang, // Use the jdoodle lang string (e.g., nodejs, python3, cpp17)
      code: code,
      stdin: stdin
    }),
    signal: AbortSignal.timeout(30000) // Give it up to 30s in case of cold start
  });

  if (!res.ok) throw new Error(`Cloud Run Engine Error: ${res.status}`);

  const data = await res.json();
  
  let stdout = data.stdout || '';
  let stderr = data.stderr || '';
  
  // Clean up ugly Docker absolute file paths from the output (e.g. /tmp/uuid-1234/solution.py -> solution.py)
  const pathRegex = /\/tmp\/[a-zA-Z0-9-]+\/([a-zA-Z0-9_.-]+)/g;
  stdout = stdout.replace(pathRegex, '$1');
  stderr = stderr.replace(pathRegex, '$1');

  return {
    stdout: stdout,
    stderr: stderr,
    status: data.status || 'Success'
  };
}

export async function executeWithWaterfall(languageId: number, code: string, stdin = ''): Promise<ExecutionResult> {
  const lang = langMap[languageId];
  if (!lang) {
    throw new Error('Language not supported by execution engine.');
  }

  // Attempt Tier 1: GlintSpark Custom Cloud
  return await executeCustomCloud(lang, code, stdin);
}
