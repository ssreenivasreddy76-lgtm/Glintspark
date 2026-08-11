import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Save, Trash2, ChevronRight, LayoutList, GripVertical, Code2, Heading, AlignLeft, AlertCircle, Play, ArrowLeft, CheckCircle2, Image, Pencil, Sparkles, List, Table, Lightbulb, ArrowUp, ArrowDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { firebaseDB } from '../services/firebaseService';
import { supabaseDB } from '../services/supabaseService';

export type LessonBlock = 
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
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const TRACKS = [
  { id: 'c', name: 'C Programming', icon: '⚡' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '🚀' },
  { id: 'sql', name: 'SQL Database', icon: '🗄️' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
];

export function AdminLearn() {
  const [selectedTrack, setSelectedTrack] = useState('c');
  const [modules, setModules] = useState<Module[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Navigation State
  const [viewMode, setViewMode] = useState<'modules' | 'editor'>('modules');
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  
  // Right Panel Editor State
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'article' | 'video'>('article');
  const [lessonDuration, setLessonDuration] = useState('5 mins');
  const [lessonStatus, setLessonStatus] = useState<'draft' | 'published'>('published');
  const [videoUrl, setVideoUrl] = useState('');
  
  // New Block Builder State
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Markdown Import State
  const [showMarkdownImport, setShowMarkdownImport] = useState(false);
  const [markdownInput, setMarkdownInput] = useState('');

  // Load Curriculum Data
  useEffect(() => {
    const fetchCurriculum = async () => {
      setIsLoading(true);
      try {
        const modulesFromDB = await firebaseDB.getCurriculum(selectedTrack);
        if (modulesFromDB && modulesFromDB.length > 0) {
          setModules(modulesFromDB);
        } else {
          setModules(getDefaultModules(selectedTrack));
        }
      } catch (e) {
        console.error("Failed to load curriculum from DB", e);
        setModules(getDefaultModules(selectedTrack));
      }
      setIsLoading(false);
    };

    fetchCurriculum();
    setViewMode('modules');
    setActiveModule(null);
  }, [selectedTrack]);

  // Persist Curriculum Data
  const saveCurriculumData = async (updatedModules: Module[]) => {
    setModules(updatedModules);
    if (activeModule) {
      const updatedActiveModule = updatedModules.find(m => m.id === activeModule.id);
      if (updatedActiveModule) setActiveModule(updatedActiveModule);
    }
    
    setIsSaving(true);
    setStatusMessage({ type: 'success', text: 'Saving...' });

    try {
      await firebaseDB.saveCurriculum(selectedTrack, updatedModules);
      setStatusMessage({ type: 'success', text: 'Saved successfully!' });
    } catch (e) {
      console.error('Error saving curriculum', e);
      setStatusMessage({ type: 'error', text: 'Failed to save.' });
    }
    setIsSaving(false);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  function getDefaultModules(trackId: string): Module[] {
    const title = trackId.toUpperCase();
    return [
      {
        id: `${trackId}-intro`,
        title: `1. Introduction to ${title}`,
        description: `Fundamental overview and environment setup for ${title}.`,
        lessons: [
          {
            id: `${trackId}-lesson-1`,
            title: `What is ${title} & Getting Started`,
            type: 'article',
            duration: '5 mins',
            content: '',
            blocks: [
              { id: 'b1', type: 'header', size: 'h2', text: `Why Learn ${title}?` },
              { id: 'b2', type: 'text', content: `It is one of the most popular programming languages in the world.\nIt is extremely versatile and fast.` },
              { id: 'b3', type: 'example', title: 'Example', description: `A simple ${title} program that outputs "Hello World!"`, code: `#include <stdio.h>\n\nint main() {\n  printf("Hello World!\\n");\n  return 0;\n}`, language: trackId === 'c' ? 'c' : 'javascript', showTryItYourself: true }
            ]
          }
        ]
      }
    ];
  }

  // --- MODULE ACTIONS ---
  const handleAddModule = () => {
    const newModId = `${selectedTrack}-mod-${Date.now()}`;
    const newMod: Module = { id: newModId, title: `${modules.length + 1}. New Module`, description: 'Description', lessons: [] };
    saveCurriculumData([...modules, newMod]);
  };

  const handleUpdateModule = (modId: string, field: 'title' | 'description', value: string) => {
    const updated = modules.map(m => m.id === modId ? { ...m, [field]: value } : m);
    saveCurriculumData(updated);
  };

  const handleDeleteModule = (modId: string) => {
    if(!confirm("Are you sure you want to delete this entire module and all its lessons?")) return;
    saveCurriculumData(modules.filter(m => m.id !== modId));
  };

  const handleOpenModuleEditor = (mod: Module) => {
    setActiveModule(mod);
    setViewMode('editor');
    if (mod.lessons.length > 0) loadLessonIntoEditor(mod.lessons[0]);
    else handleAddNewLesson(mod.id);
  };

  // --- LESSON ACTIONS ---
  const loadLessonIntoEditor = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonType(lesson.type === 'video' ? 'video' : 'article');
    setLessonDuration(lesson.duration);
    setVideoUrl(lesson.videoUrl || '');
    setLessonStatus(lesson.status || 'published');
    
    // Migrate legacy content to blocks if needed
    if (lesson.blocks && lesson.blocks.length > 0) {
      setBlocks(lesson.blocks);
    } else if (lesson.content) {
      setBlocks([{ id: `b-${Date.now()}`, type: 'text', content: lesson.content }]);
    } else {
      setBlocks([]);
    }
  };

  const handleAddNewLesson = (moduleId: string) => {
    const newLessonId = `${selectedTrack}-les-${Date.now()}`;
    const newLessonObj: Lesson = {
      id: newLessonId,
      title: 'New Lesson Title',
      type: 'article',
      duration: '5 mins',
      content: '',
      status: 'draft',
      blocks: [{ id: `b-${Date.now()}`, type: 'text', content: 'Start writing your lesson here...' }]
    };

    const updated = modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...m.lessons, newLessonObj] };
      }
      return m;
    });

    saveCurriculumData(updated);
    loadLessonIntoEditor(newLessonObj);
  };

  const handleUpdateLessonTitle = (newTitle: string) => {
    setLessonTitle(newTitle);
    if (!activeModule || !activeLessonId) return;

    // Update locally so sidebar reflects it instantly
    setModules(prev => prev.map(m => {
      if (m.id === activeModule.id) {
        return { ...m, lessons: m.lessons.map(l => l.id === activeLessonId ? { ...l, title: newTitle } : l) };
      }
      return m;
    }));
    setActiveModule(prev => {
      if (!prev) return prev;
      return { ...prev, lessons: prev.lessons.map(l => l.id === activeLessonId ? { ...l, title: newTitle } : l) };
    });
  };

  const handleSaveLesson = () => {
    if (!activeModule || !activeLessonId) return;
    if (!lessonTitle.trim()) { alert('Please enter a lesson title.'); return; }

    const newLessonObj: any = {
      id: activeLessonId,
      title: lessonTitle,
      type: lessonType,
      duration: lessonDuration,
      status: lessonStatus,
      content: '', // clearing legacy content
      blocks: blocks
    };
    
    if (lessonType === 'video') {
      newLessonObj.videoUrl = videoUrl;
    }

    const updated = modules.map(m => {
      if (m.id === activeModule.id) {
        const exists = m.lessons.some(l => l.id === activeLessonId);
        const lessonsList = exists ? m.lessons.map(l => (l.id === activeLessonId ? newLessonObj : l)) : [...m.lessons, newLessonObj];
        return { ...m, lessons: lessonsList };
      }
      return m;
    });
    saveCurriculumData(updated);
  };

  const handleImportMarkdown = () => {
    if (!markdownInput.trim()) return;
    const parsedBlocks = parseMarkdownToBlocks(markdownInput);
    setBlocks(prev => [...prev, ...parsedBlocks]);
    setShowMarkdownImport(false);
    setMarkdownInput('');
  };

  const parseMarkdownToBlocks = (markdown: string): LessonBlock[] => {
    const newBlocks: LessonBlock[] = [];
    const chunks = markdown.split(/\n\n+/);

    chunks.forEach(chunk => {
      const trimmed = chunk.trim();
      if (!trimmed) return;

      const id = `b-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        const size = trimmed.startsWith('### ') ? 'h3' : 'h2';
        const text = trimmed.replace(/^#+\s/, '');
        newBlocks.push({ id, type: 'header', size, text });
      } else if (trimmed.startsWith('```')) {
        const match = trimmed.match(/```(\w*)\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2].trim();
          newBlocks.push({ id, type: 'example', title: 'Example', description: '', code, language, showTryItYourself: true });
        } else {
          const code = trimmed.replace(/```/g, '').trim();
          newBlocks.push({ id, type: 'example', title: 'Example', description: '', code, language: 'text', showTryItYourself: true });
        }
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^1\.\s/.test(trimmed)) {
        const listType = /^1\.\s/.test(trimmed) ? 'ordered' : 'unordered';
        const items = trimmed.split('\n').map(line => line.replace(/^[-•*\d.]+\s*/, '').trim()).filter(Boolean);
        newBlocks.push({ id, type: 'list', listType, items });
      } else if (trimmed.startsWith('> Note:') || trimmed.startsWith('> Warning:')) {
        const noteType = trimmed.toLowerCase().startsWith('> warning:') ? 'warning' : 'info';
        const content = trimmed.replace(/^>\s*(Note|Warning):\s*/i, '');
        newBlocks.push({ id, type: 'note', noteType, content });
      } else {
        newBlocks.push({ id, type: 'text', content: trimmed });
      }
    });

    return newBlocks;
  };

  const handleDeleteLesson = (lessonIdToDelete: string) => {
    if (!activeModule) return;
    if(!confirm("Delete this lesson?")) return;
    const updated = modules.map(m => {
      if (m.id === activeModule.id) return { ...m, lessons: m.lessons.filter(l => l.id !== lessonIdToDelete) };
      return m;
    });
    saveCurriculumData(updated);
    if (activeLessonId === lessonIdToDelete) setActiveLessonId(null);
  };

  const moveLesson = (lessonIndex: number, direction: 'up' | 'down') => {
    if (!activeModule) return;
    const newLessons = [...activeModule.lessons];
    if (direction === 'up' && lessonIndex > 0) {
      [newLessons[lessonIndex - 1], newLessons[lessonIndex]] = [newLessons[lessonIndex], newLessons[lessonIndex - 1]];
    } else if (direction === 'down' && lessonIndex < newLessons.length - 1) {
      [newLessons[lessonIndex + 1], newLessons[lessonIndex]] = [newLessons[lessonIndex], newLessons[lessonIndex + 1]];
    } else {
      return;
    }
    const updated = modules.map(m => m.id === activeModule.id ? { ...m, lessons: newLessons } : m);
    setActiveModule({ ...activeModule, lessons: newLessons });
    saveCurriculumData(updated);
  };


  // --- BLOCK BUILDER ACTIONS ---
  const addBlock = (type: LessonBlock['type']) => {
    const newId = `blk-${Date.now()}`;
    let newBlock: LessonBlock;
    
    switch(type) {
      case 'header': newBlock = { id: newId, type: 'header', text: '', size: 'h2' }; break;
      case 'text': newBlock = { id: newId, type: 'text', content: '' }; break;
      case 'example': newBlock = { id: newId, type: 'example', title: 'Example', description: 'Description here...', code: '// write code here', language: selectedTrack === 'c' ? 'c' : 'javascript', showTryItYourself: true }; break;
      case 'note': newBlock = { id: newId, type: 'note', content: 'Note content...', noteType: 'warning' }; break;
      case 'image': newBlock = { id: newId, type: 'image', url: '', caption: '', altText: 'Flowchart or diagram' }; break;
      case 'list': newBlock = { id: newId, type: 'list', listType: 'unordered', items: [''] }; break;
      case 'difference_table': newBlock = { id: newId, type: 'difference_table', title: '', col1Title: '', col2Title: '', rows: [{ col1: '', col2: '' }] }; break;
      case 'simple_terms': newBlock = { id: newId, type: 'simple_terms', content: '' }; break;
      case 'analogy': newBlock = { id: newId, type: 'analogy', content: '' }; break;
      case 'flowchart': newBlock = { id: newId, type: 'flowchart', code: 'graph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;', caption: '' }; break;
      default: return;
    }
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<LessonBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } as LessonBlock : b));
  };

  const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));
  
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
      setBlocks(newBlocks);
    }
  };

  const handleGlobalPaste = (e: React.ClipboardEvent) => {
    if (viewMode !== 'editor' || !activeLessonId) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          
          const img = new window.Image();
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 1200;
             const MAX_HEIGHT = 1200;
             let width = img.width;
             let height = img.height;
             
             if (width > height) {
                if (width > MAX_WIDTH) {
                   height *= MAX_WIDTH / width;
                   width = MAX_WIDTH;
                }
             } else {
                if (height > MAX_HEIGHT) {
                   width *= MAX_HEIGHT / height;
                   height = MAX_HEIGHT;
                }
             }
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             if(ctx) {
               ctx.drawImage(img, 0, 0, width, height);
               const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
               const newId = `blk-${Date.now()}`;
               const newBlock: LessonBlock = { id: newId, type: 'image', url: compressedDataUrl, caption: '', altText: 'Pasted Image' };
               setBlocks(prev => [...prev, newBlock]);
             }
          };
          img.src = base64Url;
        };
        reader.readAsDataURL(file);
        
        // Prevent default paste to avoid any weird browser behaviors
        e.preventDefault();
        break; // Only handle one image at a time
      }
    }
  };

  // ================= RENDERERS ================= //

  if (viewMode === 'modules') {
    return (
      <div className="h-full flex flex-col bg-[#f8fafc]">
        {/* Header */}
        <div className="flex-shrink-0 bg-white  border-b border-slate-200  p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800  tracking-tight">Curriculum Manager</h1>
              <p className="text-sm font-medium text-slate-500 ">Organize modules, lessons, and content blocks.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {statusMessage && (
              <span className={`text-sm font-bold px-3 py-1.5 rounded-md ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {statusMessage.text}
              </span>
            )}
            <button disabled={isSaving} onClick={() => saveCurriculumData(modules)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save All Changes
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-2 text-sm text-blue-700 font-medium">
          <Sparkles size={16} className="text-blue-500 shrink-0" />
          <span><strong>Pro Tip:</strong> You can make text bold anywhere by wrapping it in double asterisks! Example: Type <code className="bg-blue-100/50 px-1.5 py-0.5 rounded text-blue-800">**Efficiency:**</code> to render as <strong>Efficiency:</strong>.</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200  pb-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              {TRACKS.map(t => (
                <button key={t.id} onClick={() => setSelectedTrack(t.id)} className={`px-5 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-2 shrink-0 border ${selectedTrack === t.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white  text-slate-700  border-slate-200  hover:bg-slate-50'}`}>
                  <span>{t.icon}</span> <span>{t.name}</span>
                </button>
              ))}
            </div>
            <button onClick={handleAddModule} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Add Module
            </button>
          </div>

          <div className="space-y-4 max-w-5xl">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white  border border-slate-200  rounded-md p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <input type="text" value={mod.title} onChange={(e) => handleUpdateModule(mod.id, 'title', e.target.value)} className="w-full text-base font-semibold text-slate-800  tracking-tight bg-transparent border-none focus:ring-0 p-0 outline-none placeholder-slate-300" placeholder="Module Title" />
                  <input type="text" value={mod.description} onChange={(e) => handleUpdateModule(mod.id, 'description', e.target.value)} className="w-full text-sm text-slate-500  bg-transparent border-none focus:ring-0 p-0 outline-none placeholder-slate-300" placeholder="Module Description" />
                </div>
                <div className="flex items-center gap-4 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                  <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 whitespace-nowrap">
                    {mod.lessons.length} Lessons
                  </div>
                  <button onClick={() => handleDeleteModule(mod.id)} className="text-rose-500 hover:text-white p-2 hover:bg-rose-500 rounded-md transition" title="Delete Module">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => handleOpenModuleEditor(mod)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow transition flex items-center gap-2 whitespace-nowrap">
                    Manage Lessons <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: SPLIT-PANE LESSON EDITOR
  return (
    <div className="h-full flex flex-col bg-white " onPaste={handleGlobalPaste}>
      {/* Editor Header */}
      <div className="flex-shrink-0 bg-slate-900 text-white border-b border-slate-800 p-4 flex items-center justify-between shadow-sm">
        <button onClick={() => { setViewMode('modules'); setActiveModule(null); setActiveLessonId(null); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition flex items-center gap-2 text-xs font-bold">
          <ArrowLeft size={16} /> Back to Modules
        </button>
        {statusMessage && (
          <div className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded flex items-center gap-1.5">
            <CheckCircle2 size={14} /> {statusMessage.text}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-72 flex-shrink-0 bg-slate-50 border-r border-slate-200  flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200  bg-slate-100/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 ">Module Lessons</span>
            <button onClick={() => handleAddNewLesson(activeModule!.id)} className="p-1.5 bg-white  border border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded shadow-sm transition">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {activeModule?.lessons.map((les, lIdx) => (
              <div 
                key={les.id} onClick={() => loadLessonIntoEditor(les)}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors font-medium cursor-pointer flex items-center justify-between group ${activeLessonId === les.id ? 'bg-[#2563eb] text-white font-bold shadow-sm' : 'text-slate-700  hover:bg-slate-200/70 hover:text-slate-900 '}`}
              >
                <div className="flex-1 truncate pr-2 text-sm flex items-center gap-2">
                  {les.title}
                  {les.status === 'draft' && <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-700 rounded border border-amber-200">Draft</span>}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); moveLesson(lIdx, 'up'); }} className={`p-1 rounded ${activeLessonId === les.id ? 'text-white/60 hover:text-white hover:bg-white ' : 'text-slate-400 hover:text-slate-700  hover:bg-slate-200'} transition`}>
                    <ArrowUp size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveLesson(lIdx, 'down'); }} className={`p-1 rounded ${activeLessonId === les.id ? 'text-white/60 hover:text-white hover:bg-white ' : 'text-slate-400 hover:text-slate-700  hover:bg-slate-200'} transition`}>
                    <ArrowDown size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(les.id); }} className={`p-1 rounded ${activeLessonId === les.id ? 'text-white/60 hover:text-white hover:bg-white ' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'} transition ml-1`}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Block Builder */}
        <div className="flex-1 bg-white  overflow-y-auto pb-32">
          {!activeLessonId ? (
            <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 flex-col gap-3">
              <BookOpen size={48} className="text-slate-200" />
              Select a lesson from the left or create a new one.
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-slate-200  bg-white  sticky top-0 z-10">
                <div className="flex-1 group relative">
                  <input 
                    type="text" 
                    value={lessonTitle} 
                    onChange={e => handleUpdateLessonTitle(e.target.value)}
                    className="w-full text-3xl font-black text-slate-900  bg-transparent border-b-2 border-transparent hover:border-slate-200  focus:border-blue-500 transition-colors p-0 outline-none placeholder-slate-300 pb-1"
                    placeholder="Lesson Title"
                    title="Click to edit lesson title"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    <Pencil size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0 pl-6">
                  <select
                    value={lessonStatus}
                    onChange={(e) => setLessonStatus(e.target.value as 'draft' | 'published')}
                    className={`px-3 py-2 text-sm font-bold rounded-lg border outline-none shadow-sm transition-colors cursor-pointer ${lessonStatus === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500' : 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500'}`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <button onClick={handleSaveLesson} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 whitespace-nowrap">
                    <Save size={16} /> Save Lesson
                  </button>
                </div>
              </div>

              {/* BLOCK EDITOR LIST */}
              <div className="space-y-6 px-8">
                {blocks.map((block, idx) => (
                  <div key={block.id} className="relative group bg-white  border border-slate-200  rounded-lg shadow-sm hover:border-slate-300 transition-colors">
                    
                    {/* Block Controls (Hover) */}
                    <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button onClick={() => moveBlock(idx, 'up')} className="p-1.5 text-slate-400 hover:text-slate-700  bg-slate-100 hover:bg-slate-200 rounded"><ArrowUp size={14}/></button>
                      <button onClick={() => moveBlock(idx, 'down')} className="p-1.5 text-slate-400 hover:text-slate-700  bg-slate-100 hover:bg-slate-200 rounded"><ArrowDown size={14}/></button>
                      <button onClick={() => removeBlock(block.id)} className="p-1.5 text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded mt-1"><Trash2 size={14}/></button>
                    </div>

                    <div className="p-5">
                      {/* HEADER BLOCK */}
                      {block.type === 'header' && (
                        <input 
                          type="text" value={block.text} onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          placeholder="Header text..." 
                          className={`w-full bg-transparent border-none focus:ring-0 p-0 outline-none placeholder-slate-300 text-slate-900  ${block.size === 'h2' ? 'text-2xl font-bold' : 'text-xl font-bold'}`}
                        />
                      )}

                      {/* TEXT BLOCK */}
                      {block.type === 'text' && (
                        <textarea 
                          value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Write text matter here (Markdown supported)..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 outline-none text-sm text-slate-700  font-sans leading-relaxed resize-y min-h-[100px]"
                        />
                      )}

                      {/* NOTE BLOCK */}
                      {block.type === 'note' && (
                        <div className="bg-[#fff4a3] border-l-4 border-[#ffc107] p-4 rounded-r-lg flex flex-col gap-2">
                          <strong className="font-extrabold text-slate-900  text-xs">Note:</strong>
                          <textarea 
                            value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 outline-none text-xs text-[#2c3e50] resize-y min-h-[40px]"
                            placeholder="Note content..."
                          />
                        </div>
                      )}

                      {/* EXAMPLE CODE BLOCK */}
                      {block.type === 'example' && (
                        <div className="bg-transparent space-y-3">
                          {/* Optional Title/Desc outside the dark box */}
                          {block.showTryItYourself && (
                            <div className="flex flex-col gap-2">
                              <input type="text" value={block.title} onChange={e => updateBlock(block.id, { title: e.target.value })} className="font-extrabold text-slate-900 text-base bg-transparent border-none focus:ring-0 outline-none p-0" placeholder="Example Title (Optional)" />
                              <input type="text" value={block.description} onChange={e => updateBlock(block.id, { description: e.target.value })} className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 outline-none p-0" placeholder="Description of this example..." />
                            </div>
                          )}
                          
                          {/* Sleek Dark Code Box */}
                          <div className="bg-[#1e1e1e] rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
                            {block.showTryItYourself && (
                              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#252526]">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5 mr-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                  </div>
                                </div>
                                <button className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors pointer-events-none opacity-50" title="Preview only">
                                  Run ▶
                                </button>
                              </div>
                            )}
                            
                            {/* MONACO EDITOR COMPONENT */}
                            <div style={{ height: `${Math.max(100, (block.code?.split('\n').length || 1) * 21 + 32)}px` }} className="transition-all duration-200">
                              <Editor
                                height="100%"
                                language={block.language}
                                theme="vs-dark"
                                value={block.code}
                                onChange={(val) => updateBlock(block.id, { code: val || '' })}
                                options={{ 
                                  minimap: { enabled: false }, 
                                  fontSize: 14, 
                                  fontFamily: "monospace", 
                                  scrollBeyondLastLine: false, 
                                  padding: { top: 16, bottom: 16 },
                                  formatOnPaste: true,
                                  wordWrap: "on"
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                              <input type="checkbox" checked={block.showTryItYourself} onChange={e => updateBlock(block.id, { showTryItYourself: e.target.checked })} className="rounded text-brand-primary focus:ring-brand-primary" />
                              Enable "Try it Yourself" Interactive Button
                            </label>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <span>Language:</span>
                              <select 
                                value={block.language} 
                                onChange={e => updateBlock(block.id, { language: e.target.value })} 
                                className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 outline-none focus:ring-0 cursor-pointer rounded px-2 py-1"
                              >
                                <option value="c">C</option>
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="javascript">JavaScript</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* IMAGE BLOCK */}
                      {block.type === 'image' && (
                        <div 
                          className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-5 flex flex-col gap-3 shadow-sm"
                          onPaste={async (e) => {
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            for (let i = 0; i < items.length; i++) {
                              if (items[i].type.indexOf('image') !== -1) {
                                const file = items[i].getAsFile();
                                if (!file) continue;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new window.Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let width = img.width, height = img.height;
                                    const maxDim = 1200;
                                    if(width > height && width > maxDim) { height *= maxDim/width; width = maxDim; }
                                    else if(height > maxDim) { width *= maxDim/height; height = maxDim; }
                                    canvas.width = width; canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    if(ctx) { ctx.drawImage(img, 0, 0, width, height); updateBlock(block.id, { url: canvas.toDataURL('image/jpeg', 0.85) }); }
                                  };
                                  img.src = event.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                                e.preventDefault();
                                e.stopPropagation();
                                break;
                              }
                            }
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <p className="text-xs text-slate-500 font-bold flex items-center gap-2"><Image size={14}/> Click here and press Ctrl+V to paste an image</p>
                            <label className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded cursor-pointer hover:bg-blue-100 transition whitespace-nowrap text-center border border-blue-200">
                              Upload Image File
                              <input 
                                type="file" accept="image/*" className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const img = new window.Image();
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas');
                                      let width = img.width, height = img.height;
                                      const maxDim = 1200;
                                      if(width > height && width > maxDim) { height *= maxDim/width; width = maxDim; }
                                      else if(height > maxDim) { width *= maxDim/height; height = maxDim; }
                                      canvas.width = width; canvas.height = height;
                                      const ctx = canvas.getContext('2d');
                                      if(ctx) { ctx.drawImage(img, 0, 0, width, height); updateBlock(block.id, { url: canvas.toDataURL('image/jpeg', 0.85) }); }
                                    };
                                    img.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                          <div className="space-y-3 mt-2">
                            <input 
                              type="text" value={block.url} onChange={e => updateBlock(block.id, { url: e.target.value })}
                              placeholder="Or paste an Image URL (e.g. https://example.com/image.png)"
                              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-[14px] focus:border-blue-500 outline-none shadow-sm"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text" value={block.caption} onChange={e => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="Caption (Optional)"
                                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-[14px] focus:border-blue-500 outline-none shadow-sm"
                              />
                              <input 
                                type="text" value={block.altText} onChange={e => updateBlock(block.id, { altText: e.target.value })}
                                placeholder="Alt text (for accessibility)"
                                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-[14px] focus:border-blue-500 outline-none shadow-sm"
                              />
                            </div>
                            {block.url && (
                              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-white p-2">
                                <img src={block.url} alt={block.altText} className="max-h-[300px] object-contain mx-auto rounded" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* DIFFERENCE TABLE BLOCK */}
                      {block.type === 'difference_table' && (
                        <div className="bg-slate-50 border border-slate-200  rounded p-5 space-y-4">
                          <input type="text" value={block.title} onChange={e => updateBlock(block.id, { title: e.target.value })} className="w-full font-bold bg-transparent outline-none border-b border-slate-300 focus:border-blue-500 pb-1 text-slate-800 " placeholder="Table Title (e.g., C vs C++)" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={block.col1Title} onChange={e => updateBlock(block.id, { col1Title: e.target.value })} className="font-bold bg-white  border border-slate-300 rounded px-3 py-1.5 text-sm outline-none shadow-sm focus:border-blue-500" placeholder="Column 1 Header" />
                            <input type="text" value={block.col2Title} onChange={e => updateBlock(block.id, { col2Title: e.target.value })} className="font-bold bg-white  border border-slate-300 rounded px-3 py-1.5 text-sm outline-none shadow-sm focus:border-blue-500" placeholder="Column 2 Header" />
                          </div>
                          <div className="space-y-2 mt-2">
                            {block.rows.map((row, rIdx) => (
                              <div key={rIdx} className="flex gap-2 items-start relative group/row">
                                <textarea value={row.col1} onChange={e => { const newRows = [...block.rows]; newRows[rIdx].col1 = e.target.value; updateBlock(block.id, { rows: newRows }); }} className="flex-1 bg-white  border border-slate-300 rounded p-3 text-sm outline-none resize-y min-h-[80px] leading-relaxed shadow-sm focus:border-blue-500" placeholder="Col 1 point..." />
                                <textarea value={row.col2} onChange={e => { const newRows = [...block.rows]; newRows[rIdx].col2 = e.target.value; updateBlock(block.id, { rows: newRows }); }} className="flex-1 bg-white  border border-slate-300 rounded p-3 text-sm outline-none resize-y min-h-[80px] leading-relaxed shadow-sm focus:border-blue-500" placeholder="Col 2 point..." />
                                <div className="absolute -right-12 top-2 flex flex-col gap-1 opacity-0 group-hover/row:opacity-100 transition">
                                  <button onClick={() => { if(rIdx > 0) { const newRows = [...block.rows]; [newRows[rIdx-1], newRows[rIdx]] = [newRows[rIdx], newRows[rIdx-1]]; updateBlock(block.id, { rows: newRows }); } }} className="text-slate-300 hover:text-slate-600  p-0.5"><ArrowUp size={14}/></button>
                                  <button onClick={() => { if(rIdx < block.rows.length - 1) { const newRows = [...block.rows]; [newRows[rIdx+1], newRows[rIdx]] = [newRows[rIdx], newRows[rIdx+1]]; updateBlock(block.id, { rows: newRows }); } }} className="text-slate-300 hover:text-slate-600  p-0.5"><ArrowDown size={14}/></button>
                                  <button onClick={() => { const newRows = block.rows.filter((_, i) => i !== rIdx); updateBlock(block.id, { rows: newRows }); }} className="text-slate-300 hover:text-rose-600 p-0.5 mt-1"><Trash2 size={14}/></button>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => updateBlock(block.id, { rows: [...block.rows, { col1: '', col2: '' }] })} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded flex items-center gap-1.5 mt-2 transition w-max"><Plus size={16}/> Add Row</button>
                          </div>
                        </div>
                      )}

                      {/* SIMPLE TERMS BLOCK */}
                      {block.type === 'simple_terms' && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-lg flex flex-col gap-3 shadow-sm">
                          <strong className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5"><Sparkles size={16} className="text-emerald-500"/> In Simple Terms:</strong>
                          <textarea 
                            value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 outline-none text-[15px] leading-[1.7] text-emerald-900 resize-y min-h-[80px]"
                            placeholder="Explain it simply..."
                          />
                        </div>
                      )}

                      {/* ANALOGY BLOCK */}
                      {block.type === 'analogy' && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg flex flex-col gap-3 shadow-sm">
                          <strong className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5"><Lightbulb size={16} className="text-amber-500"/> Real-Life Analogy:</strong>
                          <textarea 
                            value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 outline-none text-[15px] leading-[1.7] text-amber-900 resize-y min-h-[80px]"
                            placeholder="Explain with an analogy..."
                          />
                        </div>
                      )}

                      {/* LIST BLOCK */}
                      {block.type === 'list' && (
                        <div className="bg-slate-50 border border-slate-200  rounded p-5 space-y-4 shadow-sm">
                          <div className="flex items-center gap-3 border-b border-slate-200  pb-3">
                            <strong className="text-sm font-bold text-slate-700 ">List Type:</strong>
                            <select value={block.listType} onChange={e => updateBlock(block.id, { listType: e.target.value as any })} className="text-sm font-semibold bg-white  border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500">
                              <option value="unordered">Bullet Points (•)</option>
                              <option value="ordered">Numbered List (1. 2. 3.)</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            {block.items.map((item, iIdx) => (
                              <div key={iIdx} className="flex items-start gap-3 relative group/item">
                                <div className="mt-2.5 font-bold text-slate-400 w-6 text-right shrink-0">{block.listType === 'ordered' ? `${iIdx + 1}.` : '•'}</div>
                                <textarea 
                                  value={item} 
                                  onChange={e => { 
                                    const val = e.target.value;
                                    if (val.includes('\n')) {
                                      const lines = val.split('\n').map(l => l.replace(/^[-•*\d.]+\s*/, '').trim()).filter(l => l);
                                      const newItems = [...block.items];
                                      newItems.splice(iIdx, 1, ...lines);
                                      updateBlock(block.id, { items: newItems });
                                    } else {
                                      const newItems = [...block.items]; 
                                      newItems[iIdx] = val; 
                                      updateBlock(block.id, { items: newItems });
                                    }
                                  }} 
                                  className="flex-1 text-[15px] leading-[1.6] bg-white  border border-slate-300 rounded focus:border-blue-500 outline-none p-2.5 resize-y min-h-[60px] shadow-sm" 
                                  placeholder="List item..." 
                                />
                                <div className="absolute -right-14 top-2 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition">
                                  <button onClick={() => { if(iIdx > 0) { const newItems = [...block.items]; [newItems[iIdx-1], newItems[iIdx]] = [newItems[iIdx], newItems[iIdx-1]]; updateBlock(block.id, { items: newItems }); } }} className="text-slate-300 hover:text-slate-600  p-0.5"><ArrowUp size={14}/></button>
                                  <button onClick={() => { if(iIdx < block.items.length - 1) { const newItems = [...block.items]; [newItems[iIdx+1], newItems[iIdx]] = [newItems[iIdx], newItems[iIdx+1]]; updateBlock(block.id, { items: newItems }); } }} className="text-slate-300 hover:text-slate-600  p-0.5"><ArrowDown size={14}/></button>
                                  <button onClick={() => { const newItems = block.items.filter((_, i) => i !== iIdx); updateBlock(block.id, { items: newItems }); }} className="text-slate-300 hover:text-rose-600 p-0.5 mt-1"><Trash2 size={14}/></button>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => updateBlock(block.id, { items: [...block.items, ''] })} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded flex items-center gap-1.5 mt-2 transition w-max ml-9"><Plus size={16}/> Add Item</button>
                          </div>
                        </div>
                      )}


                      {/* FLOWCHART BLOCK */}
                      {block.type === 'flowchart' && (
                        <div className="bg-transparent space-y-3">
                          <input type="text" value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} className="font-extrabold text-slate-900 text-sm bg-transparent border-none focus:ring-0 outline-none p-0 w-full" placeholder="Flowchart Caption (Optional)" />
                          <div className="bg-[#1e1e1e] rounded-xl border border-slate-700/50 overflow-hidden shadow-lg p-3">
                             <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2"><LayoutList size={14}/> Mermaid Syntax</div>
                             <textarea 
                                value={block.code} onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                                placeholder="graph TD;..."
                                className="w-full bg-slate-900 text-slate-200 font-mono text-sm border border-slate-700 rounded p-3 outline-none focus:border-blue-500 resize-y min-h-[150px]"
                             />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD BLOCK BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100 justify-center">
                <button onClick={() => addBlock('header')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><Heading size={14} /> Add Header</button>
                <button onClick={() => addBlock('text')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><AlignLeft size={14} /> Add Matter</button>
                <button onClick={() => addBlock('list')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><List size={14} /> Add List</button>
                <button onClick={() => addBlock('difference_table')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><Table size={14} /> Diff Table</button>
                <button onClick={() => addBlock('simple_terms')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><Sparkles size={14} /> Simple Terms</button>
                <button onClick={() => addBlock('analogy')} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded border border-amber-200 transition flex items-center gap-1.5"><Lightbulb size={14} /> Analogy Box</button>
                <button onClick={() => addBlock('example')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><Code2 size={14} /> Add Example Box</button>
                <button onClick={() => addBlock('flowchart')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><LayoutList size={14} /> Add Flowchart</button>
                <button onClick={() => addBlock('note')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><AlertCircle size={14} /> Add Note</button>
                <button onClick={() => addBlock('image')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600  font-bold text-xs rounded border border-slate-200  transition flex items-center gap-1.5"><Image size={14} /> Add Image</button>
                <button onClick={() => setShowMarkdownImport(true)} className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded border border-purple-200 transition flex items-center gap-1.5 ml-auto"><BookOpen size={14} /> Import Markdown</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Markdown Import Modal */}
      <AnimatePresence>
        {showMarkdownImport && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white  rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 ">Import Markdown</h2>
                    <p className="text-sm font-semibold text-slate-500 ">Paste your ChatGPT markdown to auto-generate blocks</p>
                  </div>
                </div>
                <button onClick={() => setShowMarkdownImport(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-500 ">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  placeholder="Paste markdown here...&#10;&#10;## Header&#10;Paragraph text...&#10;&#10;```javascript&#10;console.log('Code');&#10;```"
                  className="w-full h-64 p-4 border border-slate-200  rounded-xl bg-slate-50 font-mono text-sm resize-y outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button onClick={() => setShowMarkdownImport(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600  hover:bg-slate-200 transition">Cancel</button>
                <button onClick={handleImportMarkdown} className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition flex items-center gap-2">
                  <Sparkles size={18} /> Parse & Add Blocks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
