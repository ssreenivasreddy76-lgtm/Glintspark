import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronUp, ChevronDown, BookOpen, Code2 } from 'lucide-react';
import { useChallenges } from '../contexts/ChallengesContext';

// Map topic names to locally hosted SVG icons (place files in public/icons/)
const getTopicIcon = (topicStr?: string) => {
  if (!topicStr) return '/icons/generic.png';
  const t = topicStr.toLowerCase().trim();
  const localMap: Record<string, string> = {
    'c++': 'cplus.svg',
    'cpp': 'cplus.svg',
    'c#': 'csharp.svg',
    'html': 'html5.svg',
    'css': 'css3.svg',
    'sql': 'mysql.svg',
    'javascript': 'javascript.svg',
    'typescript': 'typescript.svg',
    'python': 'python.svg',
    'java': 'java.svg',
    'c': 'c.svg',
    'ruby': 'ruby.svg',
    'go': 'go.svg',
    'rust': 'rust.svg',
    'php': 'php.svg',
    'swift': 'swift.svg',
    'react': 'react.svg',
  };
  return localMap[t] ? `/icons/${localMap[t]}` : '/icons/generic.png';
};

export default function CurriculumDetail() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const { challenges } = useChallenges();

  const syllabus = useMemo(() => {
    let savedLessons: any[] = [];
    const saved = localStorage.getItem('mock_curriculum_lessons');
    if (saved && topic) {
      try {
        const parsed = JSON.parse(saved);
        savedLessons = parsed[topic] || [];
      } catch {
        // ignore
      }
    }

    if (savedLessons.length === 0) {
      // Fallback
      return [
        {
          level: 'Curriculum',
          title: 'Modules',
          description: 'No lessons available for this track yet.',
          lessons: []
        }
      ];
    }

    // Just group all under a single module for simplicity
    return [
      {
        level: 'Curriculum',
        title: 'Core Lessons',
        description: 'Master the fundamentals of this track.',
        lessons: savedLessons.map(l => ({
          id: l.id,
          title: l.title,
          type: l.type === 'video' ? 'Video' : 'Article',
          points: l.duration * 2, // arbitrary points based on duration
          isCompleted: false
        }))
      }
    ];
  }, [topic]);

  const [expandedLevels, setExpandedLevels] = useState<string[]>(['Beginner']);

  const toggleLevel = (level: string) =>
    setExpandedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );

  return (
    <div className="bg-[#f3f7f7] min-h-screen font-sans">

      {/* Dark Header (Matching Challenges.tsx) */}
      <div className="bg-[#1e2330] text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-8 relative">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#8a9bb1] mb-4 leading-none uppercase tracking-widest">
            <span onClick={() => navigate('/curriculum')} className="hover:text-white cursor-pointer transition">
              Prepare
            </span>
            <span className="opacity-60">/</span>
            <span className="text-white">{topic?.replace('-', ' ')}</span>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-3 capitalize">
                {topic?.replace('-', ' ')} Syllabus
              </h1>
              <p className="text-[#8a9bb1] text-[15px] max-w-2xl">
                Step-by-step master track designed to take you from absolute beginner to industry expert.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-32">
        <div className="w-full flex flex-col gap-10">
          {syllabus.map((section, idx) => (
            <div key={section.level} className="space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">{section.title} <span className="text-[14px] font-medium text-slate-500 ml-2">({section.level})</span></h2>
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{section.lessons.length} Modules</span>
              </div>

              <div className="space-y-4">
                {section.lessons.map((lesson, lIdx) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lIdx * 0.05 }}
                    onClick={() => {
                      if (lesson.type === 'Concept') {
                        navigate(`/curriculum/${topic}/lesson/${lesson.id}`);
                      } else {
                        navigate(`/challenges/${lesson.id}`);
                      }
                    }}
                    className={`bg-white border rounded-[4px] transition-all group flex flex-col md:flex-row justify-between items-center gap-6 px-8 py-6 relative overflow-hidden cursor-pointer ${
                      lesson.isCompleted ? 'border-emerald-300 hover:border-emerald-500' : 'border-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex-1 space-y-2 text-left">
                      <h3 className={`text-[20px] font-medium ${lesson.isCompleted ? 'text-slate-700' : 'text-[#1e2330]'}`}>
                        {lesson.title}
                      </h3>
                      <div className="text-[14px] text-slate-500 font-medium flex items-center gap-2">
                        {lesson.isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
                        <span className="uppercase tracking-widest text-[11px] font-bold">{lesson.type}</span>
                        <span>•</span>
                        <span>Part {lIdx + 1}</span>
                        <span>•</span>
                        <span>+{lesson.points} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <button className={`px-6 py-2.5 rounded-md text-[15px] transition active:scale-95 min-w-[150px] font-medium ${
                        lesson.isCompleted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-800 hover:bg-slate-50'
                      }`}>
                        {lesson.isCompleted ? 'Review' : lesson.type === 'Concept' ? 'Start Lesson' : 'Solve Challenge'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
