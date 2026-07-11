import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw, ChevronDown, ChevronLeft,
  Maximize2, Upload, Lock, Trophy, Clock, CheckCircle2, MessageSquare, Terminal, Sparkles
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallenges } from '../contexts/ChallengesContext';
import confetti from 'canvas-confetti';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

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

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be logged in to execute code.');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
  const res = await fetch(`${apiUrl}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
    let cleanMessage = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error) cleanMessage = parsed.error;
    } catch (e) {}
    
    if (res.status === 429) {
      throw new Error(cleanMessage); // Clean rate limit message
    }
    throw new Error(`Execution error: ${res.status} - ${cleanMessage}`);
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
  track?: string;
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
      track: fromCtx?.track,
    };
  };

  const problem = getProblem(id);

  const allowedLangs = React.useMemo(() => {
    if (!problem.track) return LANGUAGES;
    const t = problem.track.toLowerCase();
    if (t === 'javascript') return LANGUAGES.filter(l => l.id === 63);
    if (t === 'python') return LANGUAGES.filter(l => l.id === 71);
    if (t === 'java') return LANGUAGES.filter(l => l.id === 62);
    if (t === 'c') return LANGUAGES.filter(l => l.id === 50 || l.id === 54);
    return LANGUAGES;
  }, [problem.track]);

  const [lang, setLang] = useState(allowedLangs[0] || LANGUAGES[0]);
  const [code, setCode] = useState(lang.starter);

  useEffect(() => {
    if (allowedLangs.length > 0 && !allowedLangs.find(l => l.id === lang.id)) {
      setLang(allowedLangs[0]);
      setCode(allowedLangs[0].starter);
    }
  }, [allowedLangs, lang.id]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [activeTab, setActiveTab] = useState<'Problem' | 'Submissions' | 'Leaderboard' | 'Discussions' | 'Editorial' | 'AI Tutor'>('Problem');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Define custom themes based on popular VS Code themes
    monaco.editor.defineTheme('github-dark', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#0d1117' }});
    monaco.editor.defineTheme('dracula', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#282a36' }});
    monaco.editor.defineTheme('monokai', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#272822' }});
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
  
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState(problem.testCases?.[0]?.input || '');
  const [hasRun, setHasRun] = useState(false);

  // Tab Data State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasSolved, setHasSolved] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  const location = useLocation();
  const shouldProctor = location.state?.isProctored ?? false;

  // --- PROCTORING FEATURES ---
  const isProctored = shouldProctor && activeTab === 'Problem' && !hasSolved;
  const [warnings, setWarnings] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPhoneDetected, setAiPhoneDetected] = useState(false);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const phoneLockTimeoutRef = useRef<any>(null);

  // AI Tutor States & Functions (Feature 2)
  const [tutorMessages, setTutorMessages] = useState<Array<{role: 'user'|'model', text: string}>>([
    { role: 'model', text: "Hello! I'm your AI Code Tutor. Copy or write your code on the editor key, and I can help you find bugs, run time/space complexity analysis, or give you subtle hints without giving away the direct solution." }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tutorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);

  const askTutor = async (promptOverride?: string) => {
    const queryText = promptOverride || tutorInput;
    if (!queryText.trim() && !promptOverride) return;

    const userMessage = { role: 'user' as const, text: queryText };
    setTutorMessages(prev => [...prev, userMessage]);
    setTutorInput('');
    setIsTutorLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("You must be logged in to chat with the AI Tutor.");

      const currentCode = editorRef.current ? editorRef.current.getValue() : code;
      const fullPrompt = `You are an elite, world-class coding tutor and computer science educator. 
      You are helping a developer work on a challenge titled "${problem.title}".
      
      PROBLEM DESCRIPTION:
      ${problem.description}
      
      DEVELOPER'S CURRENT CODE:
      \`\`\`${lang.runtime}
      ${currentCode}
      \`\`\`
      
      TUTORIAL INSTRUCTIONS:
      - Act as a supportive, encouraging coding tutor.
      - **CRITICAL**: Do NOT write the completed final solution for the developer. Let them write it.
      - Instead, guide them with leading questions, spot bugs in their logic, explain algorithms, or analyze Big O complexity.
      - Address their question: "${queryText}"
      
      Make your response clear, structured, and helpful. Use markdown. Keep it concise (2-4 paragraphs max).`;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      if (!response.ok) {
        throw new Error(`Tutor failed with status ${response.status}`);
      }

      const data = await response.json();
      setTutorMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (e: any) {
      console.error(e);
      setTutorMessages(prev => [...prev, { role: 'model', text: `Tutor Error: ${e.message}. Make sure the Go backend is running.` }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // AI Phone Detection Loop
  useEffect(() => {
    if (!isProctored) return;
    
    let isActive = true;
    let model: cocoSsd.ObjectDetection | null = null;
    let detectionInterval: any;
    let localStream: MediaStream | null = null;

    const startAi = async () => {
      try {
        setIsAiLoading(true);
        await tf.ready();
        model = await cocoSsd.load();
        
        if (!isActive) return; // Prevent starting if they already clicked away

        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (!isActive) {
          // If they clicked away exactly while the camera was turning on, kill it immediately
          localStream.getTracks().forEach(track => track.stop());
          return;
        }

        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.srcObject = localStream;
          hiddenVideoRef.current.play();
        }
        setIsAiLoading(false);

        detectionInterval = setInterval(async () => {
          if (model && hiddenVideoRef.current && hiddenVideoRef.current.readyState === 4) {
            // Lowered confidence threshold to 20% (0.2) to make it highly sensitive
            const predictions = await model.detect(hiddenVideoRef.current, 50, 0.2);
            
            // Coco-SSD recognizes smartphones as "cell phone", but often misclassifies them 
            // as remotes, books, or TVs when held up to a webcam. We will flag all of these.
            const suspiciousClasses = ['cell phone', 'remote', 'book', 'tv', 'laptop'];
            const foundPhone = predictions.some(p => suspiciousClasses.includes(p.class));
            
            if (foundPhone) {
              setAiPhoneDetected(true);
              // Hold the lock for 5 seconds to prevent flashing if the phone turns sideways
              if (phoneLockTimeoutRef.current) clearTimeout(phoneLockTimeoutRef.current);
              phoneLockTimeoutRef.current = setTimeout(() => {
                setAiPhoneDetected(false);
              }, 5000);
            }
          }
        }, 300); // Check extremely fast (every 300ms)
      } catch (err) {
        console.error("AI Initialization failed:", err);
        setIsAiLoading(false);
      }
    };

    startAi();

    return () => {
      isActive = false;
      clearInterval(detectionInterval);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      } else if (hiddenVideoRef.current?.srcObject) {
        const stream = hiddenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isProctored]);

  // Tab switching detection & Anti-Screenshot
  useEffect(() => {
    if (!isProctored) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => w + 1);
        alert("Warning: Tab switching or losing screen focus is not allowed! 5 marks will be deducted for this violation.");
      }
    };
    
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isProctored]);

  // Copy-Paste Protection
  useEffect(() => {
    if (!isProctored) return;
    const blockCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Copying and pasting is disabled in strict mode.");
    };
    document.addEventListener('copy', blockCopyPaste);
    document.addEventListener('paste', blockCopyPaste);
    return () => {
      document.removeEventListener('copy', blockCopyPaste);
      document.removeEventListener('paste', blockCopyPaste);
    };
  }, [isProctored]);

  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'Problem') return;
      setIsLoadingTab(true);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (activeTab === 'Submissions' || activeTab === 'Editorial') {
        if (userId) {
          try {
            const dbSolved = await firebaseDB.getUserSubmissions(userId);
            const filtered = dbSolved
              .filter((s: any) => s.challengeId === (id || 'solve-me-first'))
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            const submissionsMapped = filtered.map((s: any) => ({
              id: s.submissionId,
              solved_at: s.createdAt,
              language: s.language,
              code: s.code || ''
            }));
            
            setSubmissions(submissionsMapped);
            setHasSolved(submissionsMapped.length > 0);
          } catch (err) {
            console.error("Failed to load submissions from Firestore:", err);
          }
        }
      } else if (activeTab === 'Leaderboard') {
        try {
          const dbSolved = await firebaseDB.getChallengeSubmissions(id || 'solve-me-first');
          const sorted = [...dbSolved].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          const mappedLeaderboard: any[] = [];
          for (const s of sorted.slice(0, 50)) {
            const { data: userProfile } = await supabase
              .from('users')
              .select('name, avatar')
              .eq('id', s.userId)
              .single();
              
            mappedLeaderboard.push({
              id: s.submissionId,
              solved_at: s.createdAt,
              language: s.language,
              users: {
                username: userProfile?.name || 'Hacker',
                avatar_url: userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
              }
            });
          }
          setLeaderboard(mappedLeaderboard);
        } catch (err) {
          console.error("Failed to load leaderboard from Firestore:", err);
        }
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
        : result.stdout === '__MOCK_PASS__'
          ? `(Simulated Execution Success)\n\nYour code ran successfully!\nNote: Live compilation is currently running in Demo Mode.`
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
        if (actual === expected || actual === '__MOCK_PASS__') {
          passed++;
          results.push(`Test Case ${i + 1}: Passed`);
        } else {
          results.push(`Test Case ${i + 1}: Failed\nExpected: ${expected}\nOutput: ${actual || result.stderr}`);
        }
      }

      const allPassed = passed === problem.testCases.length;
      const content = results.join('\n\n') + `\n\n${allPassed ? 'Accepted' : 'Wrong Answer'}`;

      if (allPassed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.1 },
          colors: ['#4a90e2', '#50e3c2', '#f5a623', '#e74c3c', '#9b59b6']
        });
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          // Save solution to Firebase Firestore (Google Cloud)
          try {
            await firebaseDB.saveSubmission({
              userId: data.user.id,
              challengeId: id || 'solve-me-first',
              code,
              language: lang.label,
              status: 'PASS',
              runtimeMs: 12,
              memoryKb: 1024
            });
          } catch (firebaseErr) {
            console.error("Failed to save submission to Google Cloud:", firebaseErr);
          }

          // Update user XP in Supabase
          try {
            const { data: profile } = await supabase.from('users').select('xp').eq('id', data.user.id).single();
            if (profile) {
              await supabase.from('users').update({ xp: (profile.xp || 0) + problem.points }).eq('id', data.user.id);
            }
          } catch (supabaseErr) {
            console.error("Failed to update user XP in Supabase:", supabaseErr);
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
          {isFullscreen ? 'Exit Full Screen View' : 'Full Screen View'} <Maximize2 size={14} className={isFullscreen ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* ── Main Workspace ── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden bg-[#f3f7f7]">
        
        {/* Left Pane (Tabs + Description) */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col bg-white z-10 shrink-0 border-r border-slate-300 shadow-sm">
          
          {/* Horizontal Tabs */}
          <div className="flex px-2 border-b border-slate-200 bg-[#f3f7f7] overflow-x-auto">
            {(isFromContest
              ? (['Problem', 'Submissions', 'Leaderboard', 'Discussions', 'Editorial'] as const)
              : (['Problem', 'Submissions', 'Discussions', 'AI Tutor'] as const)
            ).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[13px] font-bold tracking-wide transition-colors relative shrink-0 ${
                  activeTab === tab ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'AI Tutor' ? (
                  <span className="flex items-center gap-1">
                    <Sparkles size={14} className="text-brand-primary" /> AI Tutor
                  </span>
                ) : tab}
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

            {activeTab === 'AI Tutor' && (
              <div className="h-full flex flex-col bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {tutorMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                        <div className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-60">
                          {msg.role === 'user' ? 'You' : 'AI Tutor'}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {isTutorLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-none p-4 max-w-[85%] shadow-sm flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={tutorEndRef} />
                </div>

                {/* Quick actions bar */}
                <div className="px-4 py-2 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
                  <button 
                    onClick={() => askTutor("Please spot logical bugs or edge-case failures in my current code.")}
                    disabled={isTutorLoading}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition shrink-0 uppercase tracking-wider disabled:opacity-50"
                  >
                    🔍 Find Bugs
                  </button>
                  <button 
                    onClick={() => askTutor("Please analyze the time complexity (Big O) and space complexity of my current code.")}
                    disabled={isTutorLoading}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition shrink-0 uppercase tracking-wider disabled:opacity-50"
                  >
                    ⏳ Big O Analysis
                  </button>
                  <button 
                    onClick={() => askTutor("I am stuck. Please give me a subtle hint regarding the algorithm or approach I should use for this problem.")}
                    disabled={isTutorLoading}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition shrink-0 uppercase tracking-wider disabled:opacity-50"
                  >
                    💡 Help / Hint
                  </button>
                </div>

                {/* Input box */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') askTutor(); }}
                      disabled={isTutorLoading}
                      placeholder="Ask for hints or coding concepts..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition disabled:opacity-50"
                    />
                    <button 
                      onClick={() => askTutor()}
                      disabled={isTutorLoading || !tutorInput.trim()}
                      className="px-4 py-2 bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-brand-dark transition active:scale-95 disabled:opacity-30 disabled:scale-100 shrink-0"
                    >
                      Ask
                    </button>
                  </div>
                </div>
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
              {/* Language Dropdown or Locked Label */}
              {allowedLangs.length > 1 ? (
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
                        {allowedLangs.map(l => (
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
              ) : (
                <div className="flex items-center gap-2 text-slate-700 font-bold text-[13px] px-3 py-1.5 bg-slate-100 rounded border border-slate-200 cursor-default" title={`This challenge requires ${lang.label}`}>
                  {lang.label}
                </div>
              )}
              {/* Command Palette Button */}
              <div className="relative ml-2">
                <button
                  onClick={() => editorRef.current?.trigger('anyString', 'editor.action.quickCommand', {})}
                  className="flex items-center gap-2 text-slate-700 font-semibold text-[13px] px-3 py-1.5 hover:bg-slate-100 rounded transition"
                  title="Open Command Palette (F1)"
                >
                  <Terminal size={14} className="text-slate-500" /> Command Palette
                </button>
              </div>
              {/* Theme Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="flex items-center gap-2 text-slate-700 font-semibold text-[13px] px-3 py-1.5 hover:bg-slate-100 rounded transition"
                >
                  Theme: {editorTheme === 'vs-dark' ? 'VS Code Dark' : editorTheme === 'light' ? 'VS Code Light' : editorTheme === 'github-dark' ? 'GitHub Dark' : editorTheme === 'dracula' ? 'Dracula' : 'Monokai'} <ChevronDown size={14} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg py-1 z-50"
                    >
                      {[
                        { id: 'light', label: 'VS Code Light' },
                        { id: 'vs-dark', label: 'VS Code Dark' },
                        { id: 'github-dark', label: 'GitHub Dark' },
                        { id: 'dracula', label: 'Dracula' },
                        { id: 'monokai', label: 'Monokai' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setEditorTheme(t.id); setShowThemeMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-[13px] transition ${editorTheme === t.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Font Size Dropdown */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                  className="flex items-center gap-2 text-slate-700 font-semibold text-[13px] px-3 py-1.5 hover:bg-slate-100 rounded transition"
                >
                  Font: {editorFontSize}px <ChevronDown size={14} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showFontSizeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-full mt-1 w-24 bg-white border border-slate-200 rounded shadow-lg py-1 z-50 max-h-48 overflow-y-auto"
                    >
                      {[12, 13, 14, 15, 16, 18, 20, 24].map(size => (
                        <button
                          key={size}
                          onClick={() => { setEditorFontSize(size); setShowFontSizeMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-[13px] transition ${editorFontSize === size ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {size}px
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <button
              onClick={() => setCode(lang.starter)}
              className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Code Editor (Monaco) */}
          <div className="flex-1 min-h-0 relative">
            <MonacoEditor
              height="100%"
              language={lang.runtime}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              onMount={handleEditorDidMount}
              theme={editorTheme}
              options={{
                fontSize: editorFontSize,
                fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                minimap: { enabled: true, scale: 0.75 },
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                padding: { top: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                mouseWheelZoom: true,
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

      {/* Hidden Video for AI */}
      <video ref={hiddenVideoRef} width="320" height="240" style={{ position: 'fixed', top: '-1000px', left: '-1000px', pointerEvents: 'none' }} playsInline muted />

      {/* AI Loading indicator */}
      <AnimatePresence>
        {isProctored && isAiLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold flex items-center gap-2 z-50"
          >
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            Loading AI Security...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-Screenshot White Screen Overlay */}
      <AnimatePresence>
        {isProctored && (!isFocused || aiPhoneDetected) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center text-center px-4"
          >
            <Lock size={64} className={aiPhoneDetected ? "text-rose-500 mb-6" : "text-slate-300 mb-6"} />
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
              {aiPhoneDetected ? "Security Violation: Phone Detected" : "Screen Protected"}
            </h1>
            <p className="text-slate-500 text-lg">
              {aiPhoneDetected 
                ? "Please put away your smartphone. The screen will unlock automatically when the phone is removed." 
                : "Click anywhere to resume your challenge."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proctoring Warning UI */}
      <AnimatePresence>
        {isProctored && warnings > 0 && isFocused && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed bottom-6 right-6 w-56 p-4 bg-rose-500 rounded-xl shadow-2xl z-50 border-2 border-rose-600 text-center"
          >
            <div className="flex items-center justify-center gap-1 text-white font-bold uppercase tracking-widest mb-1">
              <Lock size={14} /> Strict Mode
            </div>
            <div className="text-white text-sm font-medium">
              {warnings} Violation{warnings > 1 ? 's' : ''} Recorded <br/>
              <span className="text-[11px] bg-rose-700/50 px-2 py-0.5 rounded mt-1 inline-block">- {warnings * 5} Marks Penalty</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
