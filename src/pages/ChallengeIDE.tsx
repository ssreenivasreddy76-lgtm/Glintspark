import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw, ChevronDown, ChevronLeft,
  Maximize2, Upload, Lock, Trophy, Clock, CheckCircle2, MessageSquare
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallenges } from '../contexts/ChallengesContext';

// ─── Language Config ───────────────────────────────────────────────
const LANGUAGES = [
  { label: 'Python 3',    id: 71, ext: 'py',   runtime: 'python',     version: '3.10.0',  starter: `# Write your solution here\n\ndef solve():\n    pass\n\nsolve()\n` },
  { label: 'JavaScript',  id: 63, ext: 'js',   runtime: 'javascript', version: '18.15.0', starter: `// Write your solution here\n\nfunction solve() {\n\n}\n\nsolve();\n` },
  { label: 'C++',         id: 54, ext: 'cpp',  runtime: 'c++',        version: '10.2.0',  starter: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n` },
  { label: 'Java',        id: 62, ext: 'java', runtime: 'java',       version: '15.0.2',  starter: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n` },
  { label: 'C',           id: 50, ext: 'c',    runtime: 'c',          version: '10.2.0',  starter: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n` },
];

// ─── Piston API ────────────────────────────────────────────────────
const PISTON_URL = import.meta.env.VITE_PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
const PISTON_TOKEN = import.meta.env.VITE_PISTON_TOKEN || '';

async function runCode(languageId: number, code: string, stdin = ''): Promise<{ stdout: string; stderr: string; status: string }> {
  const lang = LANGUAGES.find(l => l.id === languageId);
  if (!lang) throw new Error('Unknown language');

  const res = await fetch(PISTON_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PISTON_TOKEN ? { Authorization: `Bearer ${PISTON_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      language: lang.runtime,
      version: lang.version,
      files: [{ name: `solution.${lang.ext}`, content: code }],
      stdin,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Piston API error: ${res.status} - ${errText}`);
  }
  const data = await res.json();
  const run = data.run;
  return {
    stdout: run.stdout || '',
    stderr: run.stderr || '',
    status: run.code === 0 ? 'Accepted' : 'Error',
  };
}

// ─── Problem Map ───────────────────────────────────────────────────
type ProblemDefinition = {
  title: string;
  difficulty: string;
  points: number;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  testCases: Array<{ input: string; expected: string }>;
};

const PROBLEMS: Record<string, ProblemDefinition> = {
  default: {
    title: 'A Very Big Sum',
    difficulty: 'Easy',
    points: 10,
    description: `Complete the function aVeryBigSum to compute the sum of integers in an array.\n\nThe range of the 32-bit integer is (-2^31) to (2^31 - 1).\nWhen we add several integer values, the resulting sum might exceed the above range. You might need to use long int C/C++/Java to store such sums.`,
    examples: [
      { input: '5\n1000000001 1000000002 1000000003 1000000004 1000000005', output: '5000000015', explanation: '' }
    ],
    constraints: ['1 ≤ n ≤ 10', '0 ≤ ar[i] ≤ 10^10'],
    testCases: [{ input: '5\n1000000001 1000000002 1000000003 1000000004 1000000005', expected: '5000000015' }],
  },
};

export default function ChallengeIDE() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromContest = searchParams.get('contest') === 'true';
  const { challenges } = useChallenges();

  const getProblem = (reqId?: string) => {
    if (!reqId) return PROBLEMS.default;
    const fromCtx = challenges.find((c) => c.id === reqId);
    
    return PROBLEMS[reqId] ?? {
      ...PROBLEMS.default,
      title: fromCtx?.title || reqId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      points: fromCtx?.points || 10,
      difficulty: fromCtx?.difficulty || 'Easy',
      description: fromCtx?.description || PROBLEMS.default.description,
    };
  };

  const problem = getProblem(id);

  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(lang.starter);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'Problem' | 'Submissions' | 'Leaderboard' | 'Discussions' | 'Editorial'>('Problem');
  
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState(problem.testCases?.[0]?.input || '');
  const [hasRun, setHasRun] = useState(false);

  // Tab Data State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasSolved, setHasSolved] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'Problem') return;
      setIsLoadingTab(true);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (activeTab === 'Submissions' || activeTab === 'Editorial') {
        if (userId) {
          const { data } = await supabase
            .from('solved_challenges')
            .select('*')
            .eq('challenge_id', id || 'solve-me-first')
            .eq('user_id', userId)
            .order('solved_at', { ascending: false });
            
          setSubmissions(data || []);
          setHasSolved((data || []).length > 0);
        }
      } else if (activeTab === 'Leaderboard') {
        const { data } = await supabase
          .from('solved_challenges')
          .select('*, users(username, avatar_url)')
          .eq('challenge_id', id || 'solve-me-first')
          .order('solved_at', { ascending: true })
          .limit(50);
        setLeaderboard(data || []);
      }
      
      setIsLoadingTab(false);
    }
    loadTabData();
  }, [activeTab, id]);

  // Resizer state
  const [leftWidth, setLeftWidth] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isRunning, setIsRunning]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState<{ type: 'run' | 'submit' | 'error'; content: string; passed?: number; total?: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const switchLang = (l: typeof LANGUAGES[0]) => {
    setLang(l);
    setCode(l.starter);
    setShowLangMenu(false);
    setOutput(null);
    setHasRun(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setHasRun(true);
    setOutput({ type: 'run', content: 'Running code...' });
    try {
      const result = await runCode(lang.id, code, customInput);
      const content = result.stderr
        ? `Runtime Error:\n${result.stderr}`
        : result.stdout
          ? `${result.stdout}`
          : 'Code executed successfully with no output.';
      setOutput({ type: result.stderr ? 'error' : 'run', content });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setOutput({ type: 'error', content: `Failed to run: ${errorMsg}` });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setHasRun(true);
    setOutput({ type: 'submit', content: 'Evaluating on hidden test cases...' });
    
    try {
      if (!problem.testCases || problem.testCases.length === 0) {
        throw new Error('No test cases defined for this problem.');
      }

      let passed = 0;
      const results: string[] = [];

      for (const [i, tc] of problem.testCases.entries()) {
        const result = await runCode(lang.id, code, tc.input);
        const actual = (result.stdout || '').trim();
        const expected = (tc.expected || '').trim();
        if (actual === expected) {
          passed++;
          results.push(`Test Case ${i + 1}: Passed`);
        } else {
          results.push(`Test Case ${i + 1}: Failed\nExpected: ${expected}\nOutput: ${actual || result.stderr}`);
        }
      }

      const allPassed = passed === problem.testCases.length;
      const content = results.join('\n\n') + `\n\n${allPassed ? 'Accepted' : 'Wrong Answer'}`;

      if (allPassed) {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          await supabase.from('solved_challenges').upsert({
            user_id: data.user.id,
            challenge_id: id || 'solve-me-first',
            language: lang.label,
            code,
            points_earned: problem.points,
            solved_at: new Date().toISOString(),
          }, { onConflict: 'user_id,challenge_id' });

          const { data: profile } = await supabase.from('users').select('xp').eq('id', data.user.id).single();
          if (profile) {
            await supabase.from('users').update({ xp: (profile.xp || 0) + problem.points }).eq('id', data.user.id);
          }
        }
      }

      setOutput({ type: 'submit', content, passed, total: problem.testCases.length });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setOutput({ type: 'error', content: `Submission failed: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullScreen = () => {
    const container = document.getElementById('ide-workspace');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div id="ide-workspace" className="flex flex-col h-[calc(100vh-68px)] font-sans overflow-hidden bg-[#f3f7f7]">

      {/* ── Dark Navbar ── */}
      <div className="h-12 bg-[#121e2d] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-300 hover:text-white transition">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="w-px h-4 bg-slate-600 mx-2" />
          <h1 className="text-[14px] font-bold text-white">{problem.title}</h1>
        </div>
        <button onClick={toggleFullScreen} className="flex items-center gap-2 text-slate-400 hover:text-white text-[13px] font-semibold transition">
          Exit Full Screen View <Maximize2 size={14} className="rotate-45" />
        </button>
      </div>

      {/* ── Main Workspace ── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden bg-[#f3f7f7]">
        
        {/* Left Pane (Tabs + Description) */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-white z-10 shrink-0 border-r border-slate-300 shadow-sm">
          
          {/* Horizontal Tabs */}
          <div className="flex px-2 border-b border-slate-200 bg-[#f3f7f7]">
            {(isFromContest
              ? (['Problem', 'Submissions', 'Leaderboard', 'Discussions', 'Editorial'] as const)
              : (['Problem', 'Submissions', 'Discussions'] as const)
            ).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[13px] font-bold tracking-wide transition-colors relative ${
                  activeTab === tab ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="horiz-tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {activeTab === 'Problem' && (
              <div className="prose prose-slate prose-sm max-w-none">
                <div className="mb-6">
                  <h2 className="text-[24px] font-medium text-slate-900 mb-2 leading-tight">{problem.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">{problem.difficulty}</span>
                    <span className="text-[12px] font-semibold text-slate-500">{problem.points} Points</span>
                  </div>
                </div>

                <div className="text-[15px] text-[#39424e] leading-[1.6] whitespace-pre-wrap mb-8">
                  {problem.description}
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-[16px] font-bold text-slate-800 mb-3">Sample Input</h3>
                    <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-800 border border-slate-200">
                      {problem.examples[0].input}
                    </div>
                    <h3 className="text-[16px] font-bold text-slate-800 mt-6 mb-3">Sample Output</h3>
                    <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-800 border border-slate-200">
                      {problem.examples[0].output}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[16px] font-bold text-slate-800 mb-3">Constraints</h3>
                  <ul className="list-none space-y-1">
                    {problem.constraints.map((c: string, i: number) => (
                      <li key={i} className="text-[14px] font-mono bg-slate-50 inline-block px-2 py-1 rounded border border-slate-200 text-slate-700">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'Submissions' && (
              <div className="h-full">
                <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Your Submissions</h3>
                {isLoadingTab ? (
                  <div className="text-sm text-slate-500">Loading submissions...</div>
                ) : submissions.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#f3f7f7] border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Time Submitted</th>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                        {submissions.map((sub: any, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{new Date(sub.solved_at).toLocaleString()}</td>
                            <td className="px-4 py-3">{sub.language}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-bold">{sub.points_earned}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 border border-dashed border-slate-300 rounded p-8 text-center bg-slate-50">
                    No successful submissions yet. Run and submit your code to see it here!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Leaderboard' && (
              <div className="h-full">
                <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Global Leaderboard</h3>
                {isLoadingTab ? (
                  <div className="text-sm text-slate-500">Loading leaderboard...</div>
                ) : leaderboard.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#f3f7f7] border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Hacker</th>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {leaderboard.map((row: any, i) => (
                          <tr key={i} className={i === 0 ? "bg-amber-50/30" : "hover:bg-slate-50"}>
                            <td className="px-4 py-3 font-bold text-slate-500">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                {row.users?.avatar_url && <img src={row.users.avatar_url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              {row.users?.username || 'Anonymous'}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{row.language}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">{row.points_earned}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 border border-dashed border-slate-300 rounded p-8 text-center bg-slate-50">
                    Be the first to solve this challenge and claim the #1 spot!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Editorial' && (
              <div className="h-full flex flex-col">
                <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2">Editorial & Solution</h3>
                {isLoadingTab ? (
                  <div className="text-sm text-slate-500">Verifying access...</div>
                ) : hasSolved ? (
                  <div className="prose prose-slate prose-sm max-w-none text-slate-700">
                    <p>Great job solving this! Here is the standard approach:</p>
                    <pre className="bg-[#f3f7f7] border border-slate-200 rounded p-4 text-[13px] font-mono mt-4">
{`function aVeryBigSum(ar) {
    let sum = 0;
    for(let i = 0; i < ar.length; i++) {
        sum += ar[i];
    }
    return sum;
}`}
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Lock size={24} className="text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[16px] mb-2">Editorial is Locked</h4>
                    <p className="text-slate-500 text-[13px] max-w-xs">You must successfully solve this challenge before you can view the editorial and optimal solutions.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Discussions' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#f3f7f7] rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-brand-primary" />
                </div>
                <h4 className="font-bold text-slate-800 text-[16px] mb-2">Join the Discussion</h4>
                <p className="text-slate-500 text-[13px] max-w-xs mb-6">Ask questions, share hints, or discuss optimal strategies with other hackers.</p>
                <button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-[13px] px-6 py-2 rounded transition shadow-sm">
                  Start a Topic
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div 
          className="w-1.5 bg-[#f3f7f7] hover:bg-slate-300 cursor-col-resize z-50 transition-colors shadow-inner"
          onMouseDown={() => setIsDragging(true)}
        />

        {/* Right Pane (White Theme Editor & Console) */}
        <div className="flex-1 flex flex-col bg-white min-w-0 overflow-y-auto">
          
          {/* Top Editor Toolbar */}
          <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 text-slate-700 font-semibold text-[13px] px-3 py-1.5 hover:bg-slate-100 rounded transition"
                >
                  {lang.label} <ChevronDown size={14} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg py-1 z-50"
                    >
                      {LANGUAGES.map(l => (
                        <button
                          key={l.id}
                          onClick={() => switchLang(l)}
                          className={`w-full text-left px-4 py-2 text-[13px] transition ${l.id === lang.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-[13px] font-semibold text-slate-400">Theme: Light</div>
            </div>
            
            <button
              onClick={() => setCode(lang.starter)}
              className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Code Editor (Monaco) */}
          <div className="flex flex-1 min-h-[400px]">
            <MonacoEditor
              height="100%"
              language={lang.runtime}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
              }}

            />
          </div>

          {/* Action Bar */}
          <div className="bg-white border-t border-slate-200 flex items-center justify-between px-6 py-4 shrink-0">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-[13px] font-semibold border border-slate-300 px-4 py-2 rounded transition">
                <Upload size={14} /> Upload Code as File
              </button>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isCustomInput}
                  onChange={(e) => setIsCustomInput(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition cursor-pointer" 
                />
                <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition">Test against custom input</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="px-6 py-2 rounded text-[14px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="px-6 py-2 rounded text-[14px] font-bold text-white bg-[#0e141e] hover:bg-black transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Code'}
              </button>
            </div>
          </div>

          {/* Dynamic Bottom Console */}
          {(isCustomInput || hasRun) && (
            <div className="px-6 pb-12">
              
              {isCustomInput && (
                <div className="mb-6">
                  <h3 className="text-[16px] font-bold text-slate-800 mb-3">Custom Input</h3>
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    className="w-full h-32 bg-white border border-slate-300 rounded text-slate-800 font-mono text-[14px] p-4 resize-y outline-none focus:border-emerald-500 transition-colors shadow-inner"
                    spellCheck={false}
                  />
                </div>
              )}

              {hasRun && output && (
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                  {output.type === 'error' ? (
                    <div>
                      <h3 className="text-rose-600 font-bold text-[20px] mb-2 flex items-center gap-2">
                        Compilation error :(
                      </h3>
                      <p className="text-[13px] text-slate-500 mb-4">Check the compiler output, fix the error and try again.</p>
                      <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                        {output.content}
                      </div>
                    </div>
                  ) : output.passed === output.total && output.total !== undefined ? (
                    <div>
                      <h3 className="text-emerald-600 font-bold text-[20px] mb-2">Congratulations!</h3>
                      <p className="text-[13px] text-slate-500 mb-4">You have passed all test cases.</p>
                      <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                        {output.content}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-slate-800 font-bold text-[20px] mb-4">Execution Results</h3>
                      <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                        {output.content}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
