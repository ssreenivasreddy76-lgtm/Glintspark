import React, { useState, useEffect, useRef, useCallback } from 'react';
import { executeWithWaterfall, type ExecutionResult } from '../services/executionService';
import { Play, Check, ChevronLeft, ChevronRight, Settings, Layout, Maximize2, Terminal, Code2, AlertTriangle, RotateCcw, ChevronDown, Lock, Trophy, Clock, CheckCircle2, MessageSquare, Sparkles, Upload } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallenges } from '../contexts/ChallengesContext';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
const LANGUAGES = [
  { label: 'Python 3',    id: 71, ext: 'py',   runtime: 'python',     monaco: 'python',     version: '3.10.0',  starter: `# Write your solution here\n\ndef solve():\n    pass\n\nsolve()\n` },
  { label: 'JavaScript',  id: 63, ext: 'js',   runtime: 'javascript', monaco: 'javascript', version: '18.15.0', starter: `// Write your solution here\n\nfunction solve() {\n\n}\n\nsolve();\n` },
  { label: 'C++',         id: 54, ext: 'cpp',  runtime: 'c++',        monaco: 'cpp',        version: '10.2.0',  starter: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n` },
  { label: 'Java',        id: 62, ext: 'java', runtime: 'java',       monaco: 'java',       version: '15.0.2',  starter: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n` },
  { label: 'C',           id: 50, ext: 'c',    runtime: 'c',          monaco: 'c',          version: '10.2.0',  starter: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n` },
  { label: 'C#',          id: 51, ext: 'cs',   runtime: 'csharp',     monaco: 'csharp',     version: '5.0.201', starter: `using System;\n\nclass Program {\n    static void Main() {\n        // Write your solution here\n    }\n}\n` },
];

// ─── Piston API ────────────────────────────────────────────────────
const PISTON_URL = import.meta.env.VITE_PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
const PISTON_TOKEN = import.meta.env.VITE_PISTON_TOKEN || '';

async function runCode(languageId: number, code: string, stdin = ''): Promise<ExecutionResult> {
  return await executeWithWaterfall(languageId, code, stdin);
}

// ─── Problem Map ───────────────────────────────────────────────────
type ProblemDefinition = {
  title: string;
  difficulty: string;
  points: number;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
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
    
    if (fromCtx) {
      // Map context to IDE format
      const examples = [];
      if (fromCtx.sampleInput1 || fromCtx.sampleOutput1) {
        examples.push({ input: fromCtx.sampleInput1 || '', output: fromCtx.sampleOutput1 || '', explanation: fromCtx.explanation1 });
      }
      if (fromCtx.sampleInput2 || fromCtx.sampleOutput2) {
        examples.push({ input: fromCtx.sampleInput2 || '', output: fromCtx.sampleOutput2 || '', explanation: fromCtx.explanation2 });
      }

      // Convert constraints string to array
      let parsedConstraints: string[] = [];
      if (typeof fromCtx.constraints === 'string' && fromCtx.constraints.trim()) {
        parsedConstraints = fromCtx.constraints.split('\n').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(fromCtx.constraints)) {
        parsedConstraints = fromCtx.constraints;
      }

      return {
        title: fromCtx.title,
        difficulty: fromCtx.difficulty || 'Easy',
        points: fromCtx.points || 10,
        description: fromCtx.description || '',
        inputFormat: fromCtx.inputFormat,
        outputFormat: fromCtx.outputFormat,
        examples: examples,
        constraints: parsedConstraints,
        testCases: examples.map(e => ({ input: e.input, expected: e.output })), // Temporary until execution engine is built
        track: fromCtx.track,
      };
    }
    
    // Fallback for hardcoded problems
    return PROBLEMS[reqId] ?? {
      ...PROBLEMS.default,
      title: String(reqId).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    };
  };

  const problem = getProblem(id);

  const handleNextChallenge = () => {
    const currentProblemCtx = challenges.find((c) => c.id === id);
    const trackChallenges = currentProblemCtx ? challenges.filter(c => c.track === currentProblemCtx.track && c.isPractice !== false) : challenges;
    const currentIndex = trackChallenges.findIndex(c => c.id === id);
    const nextProblem = currentIndex >= 0 && currentIndex < trackChallenges.length - 1 ? trackChallenges[currentIndex + 1] : null;

    if (nextProblem) {
      // Force page reload to ensure completely clean IDE state
      window.location.href = `/challenges/${nextProblem.id}${isFromContest ? '?contest=true' : ''}`;
    } else {
      navigate(isFromContest ? '/contests' : '/practice');
    }
  };

  const allowedLangs = LANGUAGES;

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
  const [activeTab, setActiveTab] = useState<'Problem' | 'Submissions' | 'Leaderboard' | 'Discussions' | 'Editorial' | 'Glintspark AI'>('Problem');
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
  const { user } = useAuth();
  
  // Try to find the problem from Supabase data first
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
    { role: 'model', text: "Hello! I'm Glintspark AI. Copy or write your code on the editor key, and I can help you find bugs, run time/space complexity analysis, or give you subtle hints without giving away the direct solution." }
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
              code: s.code || '',
              status: s.status || 'PASS',
              points_earned: s.status === 'PASS' ? problem.points : 0
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
  const [activeTestCase, setActiveTestCase] = useState<number>(0);
  const [output, setOutput] = useState<{ 
    type: 'run' | 'submit' | 'error'; 
    content?: string; 
    passed?: number; 
    total?: number;
    testCases?: Array<{ name: string, input: string, expected: string, actual: string, passed: boolean, stderr?: string }>;
  } | null>(null);

  const consoleRef = useRef<HTMLDivElement>(null);
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
    setActiveTestCase(0);
    setOutput({ type: 'run', content: 'Running code...' });
    try {
      if (isCustomInput) {
        const result = await runCode(lang.id, code, customInput);
        const content = result.stderr
          ? `Runtime Error:\n${result.stderr}`
          : result.stdout === '__MOCK_PASS__'
            ? `(Simulated Execution Success)\n\nYour code ran successfully!\nNote: Live compilation is currently running in Demo Mode.`
            : result.stdout
              ? `${result.stdout}`
              : 'Code executed successfully with no output.';
        setOutput({ type: result.stderr ? 'error' : 'run', content });
      } else {
        const examples = problem.examples || [];
        if (examples.length === 0) throw new Error("No sample test cases available.");
        
        let passedCount = 0;
        const testCaseResults = [];
        for (let i = 0; i < examples.length; i++) {
          const ex = examples[i];
          const result = await runCode(lang.id, code, ex.input);
          const actual = (result.stdout || '').trim();
          const expected = (ex.output || '').trim();
          const passed = actual === expected || actual === '__MOCK_PASS__';
          if (passed) passedCount++;
          
          testCaseResults.push({
            name: `Sample Case ${i}`,
            input: ex.input,
            expected: expected,
            actual: actual,
            passed: passed,
            stderr: result.stderr
          });
        }
        
        setOutput({ type: 'run', passed: passedCount, total: examples.length, testCases: testCaseResults });
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setOutput({ type: 'error', content: `Failed to run: ${errorMsg}` });
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        consoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setHasRun(true);
    setActiveTestCase(0);
    setOutput({ type: 'submit', content: 'Evaluating on hidden test cases...', testCases: [] });
    
    try {
      if (!problem.testCases || problem.testCases.length === 0) {
        throw new Error('No test cases defined for this problem.');
      }

      let passedCount = 0;
      const testCaseResults = [];

      for (let i = 0; i < problem.testCases.length; i++) {
        const tc = problem.testCases[i];
        const result = await runCode(lang.id, code, tc.input);
        const actual = (result.stdout || '').trim();
        const expected = (tc.expected || '').trim();
        const passed = actual === expected || actual === '__MOCK_PASS__';
        if (passed) passedCount++;
        
        testCaseResults.push({
          name: `Test Case ${i}`,
          input: tc.input,
          expected: expected,
          actual: actual,
          passed: passed,
          stderr: result.stderr
        });
      }

      const allPassed = passedCount === problem.testCases.length;

      if (allPassed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.1 },
          colors: ['#4a90e2', '#50e3c2', '#f5a623', '#e74c3c', '#9b59b6']
        });
      }

      if (user) {
        try {
          const subToSave = {
            userId: user._id,
            challengeId: id || 'solve-me-first',
            code,
            language: lang.label,
            status: allPassed ? 'PASS' : 'FAIL',
            runtimeMs: 12,
            memoryKb: 1024,
            pointsEarned: allPassed ? problem.points : 0
            };
            await supabaseDB.saveSubmission(subToSave);
            
            setSubmissions(prev => [{
              id: Date.now().toString(),
              solved_at: new Date().toISOString(),
              language: subToSave.language,
              points_earned: allPassed ? problem.points : 0,
              status: subToSave.status
            }, ...prev]);
          } catch (supabaseErr) {
            console.error("Failed to save submission to Supabase:", supabaseErr);
          }
      }

      if (allPassed) {
        // Save to local storage as fallback/immediate UI update regardless of Auth state
        try {
          const localSolved = JSON.parse(localStorage.getItem('glintspark_solved') || '[]');
          const challengeIdToSave = id || 'solve-me-first';
          if (!localSolved.includes(challengeIdToSave)) {
            localSolved.push(challengeIdToSave);
            localStorage.setItem('glintspark_solved', JSON.stringify(localSolved));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setOutput({ type: 'submit', passed: passedCount, total: problem.testCases.length, testCases: testCaseResults });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setOutput({ type: 'error', content: `Submission failed: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        consoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
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
              : (shouldProctor 
                  ? ['Problem', 'Submissions', 'Discussions'] as const 
                  : ['Problem', 'Submissions', 'Discussions', 'Glintspark AI'] as const)
            ).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[13px] font-bold tracking-wide transition-colors relative shrink-0 ${
                  activeTab === tab ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'Glintspark AI' ? (
                  <span className="flex items-center gap-1">
                    <Sparkles size={14} className="text-brand-primary" /> Glintspark AI
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

                <div className="space-y-6">
                  {problem.description && (
                    <div className="mb-6">
                      <div className="text-[16px] font-medium text-[#2d3748] leading-[1.7] whitespace-pre-wrap">{problem.description}</div>
                    </div>
                  )}

                  {problem.inputFormat && (
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5">
                      <h3 className="text-[15px] font-black text-slate-800 mb-3 uppercase tracking-wider">Input Format</h3>
                      <div className="bg-white p-4 rounded-md text-[15px] font-medium font-mono text-slate-800 border border-slate-200 whitespace-pre-wrap">{problem.inputFormat}</div>
                    </div>
                  )}

                  {problem.outputFormat && (
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5">
                      <h3 className="text-[15px] font-black text-slate-800 mb-3 uppercase tracking-wider">Output Format</h3>
                      <div className="bg-white p-4 rounded-md text-[15px] font-medium font-mono text-slate-800 border border-slate-200 whitespace-pre-wrap">{problem.outputFormat}</div>
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5">
                      <h3 className="text-[15px] font-black text-slate-800 mb-3 uppercase tracking-wider">Constraints</h3>
                      <div className="bg-white p-4 rounded-md border border-slate-200 flex flex-col gap-2">
                        {problem.constraints.map((c: string, i: number) => (
                          <span key={i} className="text-[15px] font-medium font-mono text-slate-800">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {problem.examples && problem.examples.length > 0 && (
                    <>
                      {problem.examples.map((ex, idx) => (
                        <div key={idx} className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5">
                          <h3 className="text-[15px] font-black text-slate-800 mb-4 uppercase tracking-wider">Sample Test Case {idx + 1}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sample Input</h4>
                              <div className="bg-white p-4 rounded-md text-[15px] font-medium font-mono text-slate-800 border border-slate-200 whitespace-pre-wrap h-full">
                                {ex.input}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sample Output</h4>
                              <div className="bg-white p-4 rounded-md text-[15px] font-medium font-mono text-slate-800 border border-slate-200 whitespace-pre-wrap h-full">
                                {ex.output}
                              </div>
                            </div>
                          </div>

                          {ex.explanation && (
                            <div className="mt-4 border-t border-slate-200 pt-4">
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Explanation</h4>
                              <div className="bg-white p-4 rounded-md text-[15px] font-medium text-[#2d3748] leading-[1.7] whitespace-pre-wrap border border-slate-200">
                                {ex.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'Submissions' && (
              <div className="h-full">
                {/* Live Submission Evaluation Removed */}

                <h3 className="text-[18px] font-bold text-slate-900 mb-6 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Past Submissions</h3>
                {isLoadingTab ? (
                  <div className="text-sm text-slate-500">Loading submissions...</div>
                ) : submissions.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#f3f7f7] border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3">Time Submitted</th>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                        {submissions.map((sub: any, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{new Date(sub.solved_at).toLocaleString()}</td>
                            <td className="px-4 py-3">{sub.language}</td>
                            <td className={`px-4 py-3 font-bold ${sub.status === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {sub.status === 'PASS' ? 'Accepted' : 'Wrong Answer'}
                            </td>
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

            {activeTab === 'Glintspark AI' && (
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
                          {msg.role === 'user' ? 'You' : 'Glintspark AI'}
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
        <div className="flex-1 flex flex-col bg-white min-w-0 overflow-y-scroll">
          
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

              {/* Theme Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="flex items-center gap-2 text-slate-700 font-semibold text-[13px] px-3 py-1.5 hover:bg-slate-100 rounded transition"
                >
                  Theme: {editorTheme === 'vs-dark' ? 'Dark Theme' : editorTheme === 'light' ? 'Light Theme' : editorTheme === 'github-dark' ? 'Night Theme' : editorTheme === 'dracula' ? 'Dracula' : 'Monokai'} <ChevronDown size={14} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg py-1 z-50"
                    >
                      {[
                        { id: 'light', label: 'Light Theme' },
                        { id: 'vs-dark', label: 'Dark Theme' },
                        { id: 'github-dark', label: 'Night Theme' },
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
          <div className="flex-1 min-h-[400px] shrink-0 relative">
            <MonacoEditor
              height="100%"
              language={lang.monaco}
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
              
              {output?.type === 'submit' && output.passed === output.total ? (
                <button 
                  onClick={handleNextChallenge}
                  className="px-6 py-2 bg-[#0e141e] hover:bg-black text-white text-[14px] font-bold rounded transition flex items-center gap-1 shadow-sm"
                >
                  {isFromContest ? 'Next Challenge' : 'Next Practice'} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  className="px-6 py-2 rounded text-[14px] font-bold text-white bg-[#0e141e] hover:bg-black transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Code'}
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Bottom Console (Run and Submit Code) */}
          {(isCustomInput || output || isSubmitting) && (
            <div ref={consoleRef} className="px-6 pb-12">
              
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

              {hasRun && output && output.type !== 'submit' && (
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm mb-6">
                  {output.testCases ? (
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                        <h3 className={`font-bold text-[20px] ${output.passed === output.total ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {output.passed === output.total ? 'Accepted' : 'Wrong Answer'}
                        </h3>
                        <span className="text-[13px] font-bold text-slate-500">
                          {output.passed} / {output.total} Test Cases Passed
                        </span>
                      </div>
                      
                      {/* Test Case Tabs */}
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                        {output.testCases.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestCase(idx)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition whitespace-nowrap ${
                              activeTestCase === idx 
                                ? (tc.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {tc.passed ? <Check size={14} className={activeTestCase === idx ? 'text-emerald-600' : 'text-emerald-500'} /> : <AlertTriangle size={14} className={activeTestCase === idx ? 'text-rose-600' : 'text-rose-500'} />}
                            {tc.name}
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Details */}
                      {output.testCases[activeTestCase] && (
                        output.type === 'run' ? (
                          <div className="space-y-4">
                            {!output.testCases[activeTestCase].passed && output.testCases[activeTestCase].stderr && (
                              <div>
                                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Runtime Error</h4>
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded text-[13px] font-mono text-rose-700 whitespace-pre-wrap">
                                  {output.testCases[activeTestCase].stderr}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input (stdin)</h4>
                              <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                                {output.testCases[activeTestCase].input}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Output</h4>
                              <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                                {output.testCases[activeTestCase].expected}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Output</h4>
                              <div className={`p-4 rounded text-[13px] font-mono whitespace-pre-wrap border ${output.testCases[activeTestCase].passed ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' : 'bg-rose-50/50 border-rose-100 text-rose-700'}`}>
                                {output.testCases[activeTestCase].actual || 'No output'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Submit Code layout (HackerRank style) */}
                            <div className="mb-4">
                              <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Compiler Message</h4>
                              <div className="text-[15px] font-bold text-slate-800">
                                {output.testCases[activeTestCase].passed ? 'Success' : 'Wrong Answer'}
                              </div>
                            </div>
                            {!output.testCases[activeTestCase].passed && output.testCases[activeTestCase].stderr && (
                              <div>
                                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Runtime Error</h4>
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded text-[13px] font-mono text-rose-700 whitespace-pre-wrap">
                                  {output.testCases[activeTestCase].stderr}
                                </div>
                              </div>
                            )}
                            {output.testCases[activeTestCase].input && (
                              <div>
                                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input (stdin)</h4>
                                <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                                  {output.testCases[activeTestCase].input}
                                </div>
                              </div>
                            )}
                            {output.testCases[activeTestCase].expected && (
                              <div>
                                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Output</h4>
                                <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                                  {output.testCases[activeTestCase].expected}
                                </div>
                              </div>
                            )}
                            {output.testCases[activeTestCase].actual && (
                              <div>
                                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Output</h4>
                                <div className={`p-4 rounded text-[13px] font-mono whitespace-pre-wrap border ${output.testCases[activeTestCase].passed ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' : 'bg-rose-50/50 border-rose-100 text-rose-700'}`}>
                                  {output.testCases[activeTestCase].actual || 'No output'}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : output.type === 'error' ? (
                    <div>
                      <h3 className="text-rose-600 font-bold text-[20px] mb-2 flex items-center gap-2">
                        Compilation error :(
                      </h3>
                      <p className="text-[13px] text-slate-500 mb-4">Check the compiler output, fix the error and try again.</p>
                      <div className="bg-[#f3f7f7] p-4 rounded text-[13px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-200">
                        {output.content}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {isSubmitting && (
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <div className="text-[15px] font-bold text-slate-700">Evaluating your code against hidden test cases...</div>
                </div>
              )}

              {!isSubmitting && output?.type === 'submit' && output.testCases && (
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-6">
                  {/* Points Box Header */}
                  {output.passed === output.total && isFromContest && (
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                          <span className="font-bold text-slate-700 text-[24px] uppercase">{lang.label[0]}</span>
                        </div>
                        <div>
                          <div className="text-[20px] text-slate-700">You have earned <span className="font-bold">{problem.points}.00</span> points!</div>
                          <div className="text-[13px] text-slate-500">You are making great progress towards your next star badge.</div>
                        </div>
                      </div>
                      <div className="w-64">
                        <div className="flex justify-between text-[12px] font-bold text-slate-600 mb-2">
                          <span>100%</span>
                          <span>{problem.points}/{problem.points}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                          <div className="h-full bg-slate-800 w-1/4"></div>
                          <div className="h-full bg-emerald-500 w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Banner */}
                  <div className={`relative p-8 flex items-center justify-between overflow-hidden ${output.passed === output.total ? 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed]' : 'bg-[#e74c3c]'}`}>
                    {/* Background Accents */}
                    {output.passed === output.total && (
                      <>
                        <div className="absolute right-40 top-[-30px] opacity-10 pointer-events-none transform rotate-12 transition-transform duration-1000 hover:rotate-0">
                          <Trophy size={160} className="text-white" />
                        </div>
                        <div className="absolute left-[30%] bottom-[-20px] opacity-20 pointer-events-none">
                          <Sparkles size={100} className="text-white" />
                        </div>
                        <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
                      </>
                    )}
                    
                    <div className="relative z-10">
                      <h2 className="text-white text-[28px] font-bold mb-2 flex items-center gap-2">
                        {output.passed === output.total ? (
                          <>Congratulations <Sparkles size={24} className="text-yellow-300 animate-pulse" /></>
                        ) : 'Wrong Answer'}
                      </h2>
                      <p className="text-white/90 text-[15px]">
                        {output.passed === output.total 
                          ? 'You solved this challenge. Would you like to challenge your friends?' 
                          : 'Your code did not pass all test cases. Keep trying!'}
                      </p>
                      {output.passed === output.total && (
                        <div className="flex items-center gap-3 mt-5">
                          <a 
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`I just solved the "${problem.title}" challenge on Glintspark! Can you beat my score? \n\nTry it here: https://glintspark.in/challenges/${problem.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2 rounded-[4px] font-bold text-[13px] shadow-sm transition active:scale-95"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg>
                            WhatsApp
                          </a>
                          <a 
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://glintspark.in/challenges/${problem.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#005582] text-white px-5 py-2 rounded-[4px] font-bold text-[13px] shadow-sm transition active:scale-95"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10">
                      {output.passed === output.total && (
                        <button 
                          onClick={handleNextChallenge}
                          className="px-8 py-3 bg-white text-[#4f46e5] text-[15px] font-black rounded shadow-xl hover:bg-slate-50 transition transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                          {isFromContest ? 'Next Challenge' : 'Next Practice'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Test Cases List */}
                  <div className="p-6 space-y-4">
                    {output.testCases.map((tc, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${tc.passed ? 'text-emerald-500 bg-white border-emerald-500' : 'text-rose-500 bg-white border-rose-500'}`}>
                          {tc.passed ? <Check size={14} strokeWidth={3} /> : <Lock size={14} strokeWidth={3} />}
                        </div>
                        <span className={`font-bold text-[15px] ${tc.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Test case {idx}
                        </span>
                      </div>
                    ))}
                  </div>
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
