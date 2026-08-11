import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, Sparkles, CheckCircle2, Lightbulb, Volume2, Pause, Square } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import Editor from '@monaco-editor/react';
import { firebaseDB } from '../services/firebaseService';
import { supabaseDB } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { executeWithWaterfall } from '../services/executionService';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

import { useRef } from 'react';

function MermaidViewer({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    if (!chart || chart.trim() === '') {
      setSvg('');
      return;
    }
    
    let isMounted = true;
    const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    
    const renderChart = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(renderId, chart);
        if (isMounted) setSvg(renderedSvg);
      } catch (e) {
        console.error("Mermaid parsing error:", e);
        if (isMounted) {
          setSvg(`<div class="text-rose-500 font-mono text-[13px] border border-rose-200 bg-rose-50 p-4 rounded-xl text-center">Invalid Mermaid syntax. Please verify your flowchart code.</div>`);
        }
        
        // Clean up error nodes injected by mermaid
        const errorNode1 = document.getElementById(renderId);
        const errorNode2 = document.getElementById(`d${renderId}`);
        if (errorNode1) errorNode1.remove();
        if (errorNode2) errorNode2.remove();
        
        // Catch-all cleanup
        document.querySelectorAll('svg[id^="dmermaid-"]').forEach(node => {
           if (node.parentElement === document.body) {
             node.remove();
           }
        });
      }
    };
    
    renderChart();
    
    return () => { isMounted = false; };
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center my-4 overflow-x-auto p-4 bg-white rounded-xl border border-slate-100 shadow-sm" />;
}

// Shared types from AdminLearn
type LessonBlock = 
  | { id: string; type: 'header'; text: string; size: 'h2' | 'h3' }
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'example'; title: string; description: string; code: string; language: string; showTryItYourself: boolean }
  | { id: string; type: 'note'; content: string; noteType: 'warning' | 'info' }
  | { id: string; type: 'image'; url: string; caption: string; altText: string }
  | { id: string; type: 'difference_table'; title: string; col1Title: string; col2Title: string; rows: { col1: string, col2: string }[] }
  | { id: string; type: 'simple_terms'; content: string }
  | { id: string; type: 'analogy'; content: string }
  | { id: string; type: 'list'; listType: 'unordered' | 'ordered'; items: string[] }
  | { id: string; type: 'flowchart'; code: string; caption?: string };

interface Lesson {
  id: string;
  title: string;
  type: 'article' | 'video' | 'quiz';
  duration: string;
  videoUrl?: string;
  content: string; // legacy fallback
  blocks?: LessonBlock[];
  status?: 'draft' | 'published';
  quizId?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const renderFormattedText = (text: string) => {
  if (!text) return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

// Mini Circular progress indicator for sidebar
function MiniProgressCircle({ percentage }: { percentage: number }) {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = percentage > 0 ? '#2563eb' : '#cbd5e1';
  const textColor = percentage > 0 ? 'text-blue-600' : 'text-slate-400';

  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 ml-2">
      <svg className="w-8 h-8 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" className="transition-all duration-700 ease-out" />
      </svg>
      <span className={`absolute text-[8px] font-black tracking-tighter ${textColor}`}>
        {percentage}%
      </span>
    </div>
  );
}

export default function LessonDetail() {
  const { user, updateUser } = useAuth();
  const { topic, lessonId } = useParams<{ topic: string; lessonId?: string }>();
  const navigate = useNavigate();

  const currentTopic = (topic || 'c').toLowerCase();
  const formattedTitle = currentTopic === 'c' ? 'C' : currentTopic === 'python' ? 'Python' : currentTopic.toUpperCase();

  const [chapterList, setChapterList] = useState<Lesson[]>([]);
  const [modulesList, setModulesList] = useState<Module[]>([]);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [ttsState, setTtsState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [ttsLang, setTtsLang] = useState<'en' | 'te'>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [runOutputs, setRunOutputs] = useState<Record<string, { text: string; isError: boolean }>>({});
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const [localCode, setLocalCode] = useState<Record<string, string>>({});

  const getLangId = (lang: string) => {
    const l = (lang || '').toLowerCase();
    if (l === 'c') return 50;
    if (l === 'cpp' || l === 'c++') return 54;
    if (l === 'python') return 71;
    if (l === 'java') return 62;
    if (l === 'javascript' || l === 'js') return 63;
    if (l === 'csharp' || l === 'c#') return 51;
    return 63; // Default to JS
  };

  const handleRunCode = async (blockId: string, language: string, defaultCode: string) => {
    const codeToRun = localCode[blockId] !== undefined ? localCode[blockId] : defaultCode;
    setRunningBlockId(blockId);
    try {
      const res = await executeWithWaterfall(getLangId(language), codeToRun);
      const isError = res.stderr && res.stderr.length > 0;
      setRunOutputs(prev => ({ ...prev, [blockId]: { text: res.stderr || res.stdout || 'Executed successfully with no output.', isError: !!isError } }));
    } catch (e: any) {
      setRunOutputs(prev => ({ ...prev, [blockId]: { text: e.message || 'Execution failed.', isError: true } }));
    }
    setRunningBlockId(null);
  };


  const activeChapter = chapterList[activeChapterIdx] || chapterList[0];

  const markCurrentComplete = async () => {
    if (!user || !activeChapter) return;
    const currentCompleted = user.completedLessonIds || [];
    if (!currentCompleted.includes(activeChapter.id)) {
      const newCompleted = [...currentCompleted, activeChapter.id];
      const updated = { ...user, completedLessonIds: newCompleted };
      updateUser(updated); // Update local state immediately for UI snap
      try {
        await supabaseDB.updateOne(user._id, { completedLessonIds: newCompleted });
      } catch (err) {
        console.error("Failed to update completed lessons", err);
      }
    }
  };

  const handleNext = async () => {
    await markCurrentComplete();
    setActiveChapterIdx(prev => Math.min(chapterList.length - 1, prev + 1));
  };

  const handleFinishModule = async () => {
    await markCurrentComplete();
    navigate(`/curriculum/${currentTopic}`);
  };

  useEffect(() => {
    const loadCurriculum = async () => {
      setIsLoading(true);
      let modulesForTopic: Module[] = [];
      try {
        const modulesFromDB = await firebaseDB.getCurriculum(currentTopic);
        modulesForTopic = modulesFromDB || [];
      } catch (e) {
        console.error("Failed to fetch curriculum from DB", e);
      }

      if (modulesForTopic.length === 0) {
        const title = currentTopic.toUpperCase();
        modulesForTopic = [
          {
            id: `${currentTopic}-intro`,
            title: `1. Introduction to ${title}`,
            description: `Fundamental overview and environment setup for ${title}.`,
            lessons: [
              {
                id: `${currentTopic}-lesson-1`,
                title: `What is ${title} & Getting Started`,
                type: 'article',
                duration: '5 mins',
                content: '',
                quizId: 'tech-react-basics',
                blocks: [
                  { id: 'b1', type: 'header', size: 'h2', text: `Why Learn ${title}?` },
                  { id: 'b2', type: 'text', content: `It is one of the most popular programming languages in the world.\nIt is extremely versatile and fast.` },
                  { id: 'b3', type: 'example', title: 'Example', description: `A simple ${title} program that outputs "Hello World!"`, code: `#include <stdio.h>\n\nint main() {\n  printf("Hello World!\\n");\n  return 0;\n}`, language: currentTopic === 'c' ? 'c' : 'javascript', showTryItYourself: true }
                ]
              }
            ]
          }
        ];
      }
      
      // Flatten all lessons from all modules into a single array for pagination
      const allLessons: Lesson[] = [];
      modulesForTopic.forEach(mod => {
        if (mod.lessons) {
          // Filter out drafts for student view
          mod.lessons = mod.lessons.filter((l: Lesson) => l.status !== 'draft');
          allLessons.push(...mod.lessons);
        }
      });

      setModulesList(modulesForTopic);
      setChapterList(allLessons);

      // If lessonId is in URL, try to set active index to that lesson
      if (lessonId && allLessons.length > 0) {
        const idx = allLessons.findIndex(l => l.id === lessonId);
        if (idx !== -1) {
          setActiveChapterIdx(idx);
        }
      }
      setIsLoading(false);
    };

    loadCurriculum();

    window.addEventListener('storage', loadCurriculum);
    window.addEventListener('curriculum_updated', loadCurriculum);

    // Listen for quiz completions from other tabs
    const channel = new BroadcastChannel('quiz_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'QUIZ_COMPLETED') {
        const completedQuizLessonId = event.data.lessonId;
        if (user && !user.completedLessonIds?.includes(completedQuizLessonId)) {
          updateUser({
            ...user,
            completedLessonIds: [...(user.completedLessonIds || []), completedQuizLessonId]
          });
        }
      }
    };

    return () => {
      window.removeEventListener('storage', loadCurriculum);
      window.removeEventListener('curriculum_updated', loadCurriculum);
      channel.close();
    };
  }, [currentTopic, lessonId, user, updateUser]);

  // Update URL if active chapter changes (optional, but good for linking)
  useEffect(() => {
    if (chapterList.length > 0 && chapterList[activeChapterIdx]) {
      const targetId = chapterList[activeChapterIdx].id;
      // Use replace state so we don't break back button massively
      window.history.replaceState(null, '', `/curriculum/${currentTopic}/lesson/${targetId}`);
    }
  }, [activeChapterIdx, chapterList, currentTopic]);

  // Cancel TTS when leaving or changing chapter
  useEffect(() => {
    window.speechSynthesis.cancel();
    setTtsState('idle');
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeChapterIdx]);

  const handleTTS = async () => {
    if (ttsState === 'playing') {
      window.speechSynthesis.pause();
      setTtsState('paused');
    } else if (ttsState === 'paused') {
      window.speechSynthesis.resume();
      setTtsState('playing');
    } else {
      // Extract text from blocks
      let fullText = activeChapter.title + ". ";
      const activeBlocks = activeChapter.blocks || [];
      activeBlocks.forEach(block => {
        if (block.type === 'header') {
          fullText += (block as any).text + ". ";
        } else if (block.type === 'text' || block.type === 'simple_terms' || block.type === 'note' || block.type === 'analogy') {
          fullText += (block as any).content + ". ";
        } else if (block.type === 'list') {
          fullText += (block as any).items.join(". ") + ". ";
        } else if (block.type === 'example') {
          fullText += "Example: " + (block as any).title + ". " + ((block as any).description || "") + ". ";
        }
      });
      // Clean markdown bold syntax
      fullText = fullText.replace(/\*\*/g, '');

      let textToSpeak = fullText;

      if (ttsLang === 'te') {
        setIsTranslating(true);
        try {
          const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(fullText)}`);
          const data = await response.json();
          textToSpeak = data[0].map((item: any) => item[0]).join('');
        } catch (e) {
          console.error("Translation failed", e);
          textToSpeak = "Translation failed. " + fullText;
        }
        setIsTranslating(false);
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      
      if (ttsLang === 'te') {
        utterance.lang = 'te-IN';
        const teVoice = voices.find(v => v.lang.includes('te'));
        if (teVoice) utterance.voice = teVoice;
      } else {
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onend = () => setTtsState('idle');
      utterance.onerror = () => setTtsState('idle');
      
      window.speechSynthesis.speak(utterance);
      setTtsState('playing');
    }
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setTtsState('idle');
  };

  // If no content is loaded yet
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb Skeleton */}
          <div className="w-48 h-4 bg-slate-200 rounded animate-pulse mb-8" />
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-[340px] shrink-0 space-y-4">
              <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-6" />
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            
            {/* Main Content Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="h-12 w-2/3 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="h-[400px] bg-slate-200 rounded-2xl animate-pulse mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chapterList.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <p className="text-slate-500 font-semibold">No content found.</p>
      </div>
    );
  }

  if (!activeChapter) {
    return null;
  }

  // Fallback to legacy string content if blocks are missing
  const activeBlocks: LessonBlock[] = activeChapter.blocks || (activeChapter.content ? [{ id: 'fallback', type: 'text', content: activeChapter.content }] : []);

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* Top Navigation Subbar */}
      <div className="bg-[#1d2a35] text-white border-b border-slate-800">
        <div className="max-w-[1500px] mx-auto px-4 h-12 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/curriculum/${currentTopic}`)}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors text-slate-300"
            >
              <ChevronLeft size={16} /> All {formattedTitle} Modules
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-white font-extrabold">{formattedTitle} TUTORIAL</span>
          </div>
        </div>
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-start">
        
        {/* 1. LEFT SIDEBAR */}
        <aside className="w-full lg:w-[250px] shrink-0 bg-white border-r border-slate-200 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] flex flex-col font-sans shadow-sm z-10">
          {(() => {
            const activeMod = modulesList.find(m => m.lessons?.some(l => l.id === activeChapter?.id));
            return (
              <>
                <div className="px-5 py-4 border-b border-slate-200 shrink-0 bg-slate-50">
                  <h2 className="font-extrabold text-slate-900 text-[14px] leading-snug tracking-tight">{activeMod?.title || `${formattedTitle} Tutorial`}</h2>
                </div>

                <nav className="overflow-y-auto flex-1 custom-scrollbar bg-white py-2">
                  {activeMod?.lessons?.map((item) => {
                    const idx = chapterList.findIndex(c => c.id === item.id);
                    if (idx === -1) return null;
                    const isActive = idx === activeChapterIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveChapterIdx(idx)}
                        className={`w-full text-left px-5 py-3.5 transition-colors font-medium text-[13px] flex items-center justify-between border-b border-slate-100 last:border-0 ${
                          isActive 
                            ? 'bg-[#1d2a35] text-white font-bold shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#1d2a35]'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <MiniProgressCircle percentage={user?.completedLessonIds?.includes(item.id) ? 100 : 0} />
                      </button>
                    );
                  })}
                </nav>
              </>
            );
          })()}
        </aside>

        {/* 2. CENTER COLUMN */}
        <main className="flex-1 w-full p-6 md:p-10 space-y-8 max-w-[900px]">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeChapter.title}</h1>
            <div className="flex flex-wrap gap-2 shrink-0">
              <select 
                value={ttsLang}
                onChange={e => setTtsLang(e.target.value as 'en' | 'te')}
                disabled={ttsState !== 'idle' || isTranslating}
                className="bg-white border border-slate-300 rounded-full px-3 py-1.5 text-[13px] font-bold text-slate-700 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>

              <button 
                onClick={handleTTS}
                disabled={isTranslating}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-[13px] transition-colors disabled:opacity-50"
              >
                {isTranslating ? <Loader2 size={16} className="animate-spin text-brand-primary" /> : ttsState === 'playing' ? <Pause size={16} className="text-brand-primary" /> : <Volume2 size={16} className="text-brand-primary" />}
                {isTranslating ? 'Translating...' : ttsState === 'playing' ? 'Pause' : ttsState === 'paused' ? 'Resume' : 'Listen'}
              </button>
              {ttsState !== 'idle' && (
                <button 
                  onClick={handleStopTTS}
                  className="flex items-center justify-center w-[36px] h-[36px] bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full transition-colors"
                  title="Stop"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              )}
            </div>
          </div>

          {/* === DYNAMIC BLOCK RENDERER === */}
          <div className="space-y-8 mt-6">
            {activeBlocks.map(block => {
              switch (block.type) {
                case 'header':
                  return block.size === 'h2' 
                    ? <h2 key={block.id} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{block.text}</h2>
                    : <h3 key={block.id} className="text-xl font-bold text-slate-900 mt-6 mb-3">{block.text}</h3>;
                
                case 'text':
                  return (
                    <div key={block.id} className="text-[#333333] text-[16px] leading-[1.8] whitespace-pre-wrap font-sans">
                      {renderFormattedText(block.content)}
                    </div>
                  );
                
                case 'difference_table':
                  return (
                    <div key={block.id} className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {block.title && <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-[15px] font-bold text-slate-800">{block.title}</div>}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[15px]">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="p-4 border-b border-slate-200 font-bold text-slate-700 w-1/2">{block.col1Title}</th>
                              <th className="p-4 border-b border-slate-200 border-l font-bold text-slate-700 w-1/2">{block.col2Title}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows?.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4 border-b border-slate-200 text-[#333333] align-top leading-relaxed whitespace-pre-wrap">{renderFormattedText(row.col1)}</td>
                                <td className="p-4 border-b border-slate-200 border-l text-[#333333] align-top leading-relaxed whitespace-pre-wrap">{renderFormattedText(row.col2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );

                case 'simple_terms':
                  return (
                    <div key={block.id} className="my-8 bg-emerald-50/80 border border-emerald-100 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-emerald-900 mb-2">In Simple Terms</h4>
                        <div className="text-emerald-900 text-[16px] leading-[1.7] whitespace-pre-wrap">
                          {renderFormattedText(block.content)}
                        </div>
                      </div>
                    </div>
                  );

                case 'analogy':
                  return (
                    <div key={block.id} className="my-8 bg-amber-50/80 border border-amber-100 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-amber-900 mb-2">Real-Life Analogy</h4>
                        <div className="text-amber-900 text-[16px] leading-[1.7] whitespace-pre-wrap">
                          {renderFormattedText(block.content)}
                        </div>
                      </div>
                    </div>
                  );

                case 'list':
                  return (
                    <div key={block.id} className="my-4 space-y-2 text-[#333333] text-[16px] leading-[1.8]">
                      {block.items?.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 ${block.listType === 'ordered' ? 'font-bold text-slate-500 w-6 text-right' : 'text-slate-400'}`}>
                            {block.listType === 'ordered' ? `${idx + 1}.` : '•'}
                          </div>
                          <div className="flex-1 whitespace-pre-wrap font-normal">
                            {renderFormattedText(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                
                case 'note':
                  return (
                    <div key={block.id} className="bg-[#fff4a3] text-[#2c3e50] border-l-4 border-[#ffc107] p-4 rounded-r-lg font-medium text-[15px] leading-relaxed shadow-sm">
                      <strong className="font-extrabold text-slate-900 block mb-1">Note:</strong>
                      {renderFormattedText(block.content)}
                    </div>
                  );
                
                case 'image':
                  return (
                    <div key={block.id} className="my-8 flex flex-col items-center">
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-full bg-slate-50 flex items-center justify-center p-2">
                        {block.url ? (
                          <img 
                            src={block.url} 
                            alt={block.altText || block.caption || 'Lesson image'} 
                            className="max-h-[500px] object-contain rounded-xl"
                          />
                        ) : (
                          <div className="text-slate-400 p-8 italic">No image source provided</div>
                        )}
                      </div>
                      {block.caption && (
                        <p className="text-sm text-slate-500 mt-3 text-center italic">{block.caption}</p>
                      )}
                    </div>
                  );
                
                case 'example':
                  return (
                    <div key={block.id} className="bg-transparent space-y-3 my-6">
                      {/* Optional Title/Desc outside the dark box */}
                      {block.showTryItYourself && (block.title || block.description) && (
                        <div className="flex flex-col gap-2">
                          {block.title && <h3 className="font-extrabold text-slate-900 text-base">{block.title}</h3>}
                          {block.description && <p className="text-sm text-slate-600">{block.description}</p>}
                        </div>
                      )}
                      
                      {/* Sleek Dark Code Box */}
                      <div className="bg-[#1e1e1e] rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
                        {block.showTryItYourself && (
                          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#252526]">
                            <div className="flex items-center gap-2">
                              {/* Mac window dots */}
                              <div className="flex items-center gap-1.5 mr-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleRunCode(block.id, block.language, block.code)}
                                disabled={runningBlockId === block.id}
                                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                              >
                                {runningBlockId === block.id ? 'Running...' : 'Run ▶'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* MONACO EDITOR COMPONENT */}
                        <div style={{ height: `${Math.max(100, ((localCode[block.id] !== undefined ? localCode[block.id] : block.code)?.split('\n').length || 1) * 21 + 32)}px` }} className="transition-all duration-200">
                          <Editor
                            height="100%"
                            language={block.language}
                            theme="vs-dark"
                            value={localCode[block.id] !== undefined ? localCode[block.id] : block.code}
                            options={{
                              readOnly: !block.showTryItYourself, // allow edit if interactive
                              minimap: { enabled: false },
                              fontSize: 14,
                              fontFamily: "monospace",
                              scrollBeyondLastLine: false,
                              padding: { top: 16, bottom: 16 },
                              formatOnPaste: true,
                              wordWrap: "on"
                            }}
                            onChange={(val) => setLocalCode(prev => ({ ...prev, [block.id]: val || '' }))}
                          />
                        </div>
                      </div>

                      {/* OUTPUT AREA */}
                      {block.showTryItYourself && runOutputs[block.id] && (
                        <div className={`mt-3 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border ${runOutputs[block.id].isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                          {runOutputs[block.id].text}
                        </div>
                      )}
                    </div>
                  );

                
                case 'image':
                  return (
                    <div key={block.id} className="flex flex-col items-center my-6 space-y-3">
                      <img 
                        src={block.url} 
                        alt={block.altText} 
                        className="max-w-full rounded border border-slate-200 shadow-sm object-contain"
                      />
                      {block.caption && (
                        <span className="text-xs text-slate-500 font-medium italic">{block.caption}</span>
                      )}
                    </div>
                  );
                
                case 'flowchart':
                  return (
                    <div key={block.id} className="my-8 flex flex-col items-center">
                      <MermaidViewer chart={block.code} />
                      {block.caption && (
                        <span className="text-sm font-bold text-slate-500 italic mt-2">{block.caption}</span>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>

          {/* Quiz Required Banner */}
          {activeChapter.quizId && (
            <div className={`mt-10 p-6 rounded-xl border ${user?.completedLessonIds?.includes(activeChapter.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-primary/5 border-brand-primary/20'} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user?.completedLessonIds?.includes(activeChapter.id) ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  {user?.completedLessonIds?.includes(activeChapter.id) ? <CheckCircle2 size={24} /> : <Sparkles size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Knowledge Check</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {user?.completedLessonIds?.includes(activeChapter.id) 
                      ? "You've successfully passed the quiz for this lesson!" 
                      : "Pass the quiz to unlock the next lesson and earn XP."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => window.open(`/quizzes/${activeChapter.quizId}?lessonId=${activeChapter.id}&newTab=true`, '_blank')}
                className={`px-6 py-2.5 rounded font-bold text-sm shadow-sm transition-all whitespace-nowrap ${user?.completedLessonIds?.includes(activeChapter.id) ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' : 'bg-brand-primary hover:bg-brand-secondary text-white'}`}
              >
                {user?.completedLessonIds?.includes(activeChapter.id) ? 'Retake Quiz' : 'Take Quiz ❯'}
              </button>
            </div>
          )}

          {/* Bottom Prev / Next Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-xs mt-6">
            <button 
              onClick={() => setActiveChapterIdx(prev => Math.max(0, prev - 1))}
              disabled={activeChapterIdx === 0}
              className="px-4 py-2 bg-[#1d2a35] disabled:opacity-40 hover:bg-slate-800 text-white rounded font-bold flex items-center gap-1 transition shadow-sm"
            >
              ❮ Previous
            </button>
            {activeChapterIdx === chapterList.length - 1 ? (
              <button 
                onClick={handleFinishModule}
                disabled={activeChapter.quizId ? !user?.completedLessonIds?.includes(activeChapter.id) : false}
                className="px-5 py-2 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <CheckCircle2 size={16} /> Finish Module
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={(activeChapterIdx === chapterList.length - 1) || (activeChapter.quizId ? !user?.completedLessonIds?.includes(activeChapter.id) : false)}
                className="px-4 py-2 bg-[#1d2a35] disabled:opacity-40 hover:bg-slate-800 text-white rounded font-bold flex items-center gap-1 transition shadow-sm"
              >
                Next ❯
              </button>
            )}
          </div>

        </main>

        {/* 3. RIGHT SIDEBAR */}
        <aside className="w-full lg:w-[260px] shrink-0 p-4 space-y-4">
          <AdBanner dataAdSlot="W3_RIGHT_AD_1" />
          <AdBanner dataAdSlot="W3_RIGHT_AD_2" />
        </aside>

      </div>
    </div>
  );
}
