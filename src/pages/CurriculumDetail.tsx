import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, Sparkles, Trophy, Zap, ShieldAlert, Award, Loader2 } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { firebaseDB } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  progressPercent: number;
  level: string;
}

// Circular progress indicator component
function ProgressCircle({ percentage }: { percentage: number }) {
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = percentage === 100 ? '#10b981' : percentage > 0 ? '#2563eb' : '#cbd5e1';
  const textColor = percentage === 100 ? 'text-emerald-600' : percentage > 0 ? 'text-blue-600' : 'text-slate-400';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute text-[11px] font-black tracking-tighter ${textColor}`}>
        {percentage}%
      </span>
    </div>
  );
}

// Module datasets for tracks (legacy fallback structure in case localStorage is empty)
const TRACK_MODULES: Record<string, ModuleItem[]> = {
  c: [],
  python: [],
  sql: [],
  java: []
};

export default function CurriculumDetail() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();

  const currentTopic = (topic || 'c').toLowerCase();
  
  const [realModules, setRealModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      let loadedModules: any[] = [];
      try {
        const modulesFromDB = await firebaseDB.getCurriculum(currentTopic);
        loadedModules = modulesFromDB || [];
      } catch (e) {
        console.error("Failed to fetch curriculum from DB", e);
      }

      // If absolutely no modules exist for this topic (DB is empty),
      // we fallback to the identical mock data used in AdminLearn.tsx 
      // so the user panel perfectly mirrors the admin panel.
      if (loadedModules.length === 0) {
        const title = currentTopic.toUpperCase();
        loadedModules = [
          {
            id: `${currentTopic}-intro`,
            title: `1. Introduction to ${title}`,
            description: `Fundamental overview and environment setup for ${title}.`,
            lessons: [
              { id: `${currentTopic}-lesson-1` }
            ]
          }
        ];
      }
      
      setRealModules(loadedModules);
      setIsLoading(false);
    };

    loadModules();
    
    // Listen for cross-tab updates (e.g. if they save in the Admin panel in another tab)
    window.addEventListener('storage', loadModules);
    
    // Custom event for same-tab updates
    window.addEventListener('curriculum_updated', loadModules);

    return () => {
      window.removeEventListener('storage', loadModules);
      window.removeEventListener('curriculum_updated', loadModules);
    };
  }, [currentTopic]);

  const { user } = useAuth();

  // Map real modules to the UI format
  const modules = realModules.length > 0 ? realModules.map((m: any, idx: number) => {
    const publishedLessons = m.lessons ? m.lessons.filter((l: any) => l.status !== 'draft') : [];
    const completedCount = publishedLessons.filter((l: any) => user?.completedLessonIds?.includes(l.id)).length;
    const progressPercent = publishedLessons.length > 0 ? Math.round((completedCount / publishedLessons.length) * 100) : 0;
    
    return {
      id: m.id,
      title: m.title,
      description: m.description || '',
      totalLessons: publishedLessons.length,
      progressPercent: progressPercent,
      level: idx < 2 ? 'Beginner' : 'Advanced',
      firstLessonId: publishedLessons.length > 0 ? publishedLessons[0].id : null
    };
  }) : [];

  const formattedTopicTitle = currentTopic === 'c' ? 'C Programming' : currentTopic.toUpperCase();

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-8 leading-none uppercase tracking-widest">
          <span onClick={() => navigate('/curriculum')} className="hover:text-slate-900 cursor-pointer transition">
            Learn
          </span>
          <span className="opacity-60">/</span>
          <span className="text-slate-900 font-black">{formattedTopicTitle}</span>
        </div>

        {/* 2-COLUMN MAIN LAYOUT: Left Compact Ads Sidebar, Right Modules List */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 👈 LEFT SIDE: Compact Direct Ads (180px) */}
          <div className="w-full lg:w-[180px] shrink-0 space-y-4">
            <AdBanner dataAdSlot="CURRICULUM_LEFT_AD_1" />
            <AdBanner dataAdSlot="CURRICULUM_LEFT_AD_2" />
          </div>

          {/* 👉 RIGHT SIDE: Modules List & Circular Progress (Expanded) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Header Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {formattedTopicTitle} Modules
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Select a module to view lessons and reading material.</p>
              </div>
              {!isLoading && (
                <span className="text-xs font-black text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
                  {modules.length} Modules
                </span>
              )}
            </div>

            {/* Modules Render List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="w-full flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-24 bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-between">
                      <div className="space-y-3 w-1/2">
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                modules.map((mod, idx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.015, x: 4 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => {
                    const firstLessonId = mod.firstLessonId || '';
                    if (firstLessonId) {
                      navigate(`/curriculum/${currentTopic}/lesson/${firstLessonId}`);
                    } else {
                      alert('This module has no lessons yet.');
                    }
                  }}
                  className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md cursor-pointer group flex items-center justify-between gap-6 relative overflow-hidden"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                      {mod.title}
                    </h3>
                  </div>

                  {/* Circular Percentage Ring on Far Right */}
                  <div className="flex items-center gap-4 shrink-0 border-l border-slate-100 pl-6">
                    <ProgressCircle percentage={mod.progressPercent} />
                    <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-300">
                      <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              )))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
