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
    // Base hardcoded curriculum concepts
    const baseSyllabus = [
      {
        level: 'Beginner',
        title: 'Foundations & Basics',
        description: 'Master the core syntax and fundamental concepts.',
        lessons: [
          { id: 'variables', title: 'Variables & Data Types', type: 'Concept', points: 10, isCompleted: true },
          { id: 'control-flow', title: 'Control Flow & Logic', type: 'Concept', points: 15, isCompleted: true },
        ],
      },
      {
        level: 'Intermediate',
        title: 'Data Structures & Functions',
        description: 'Learn to organize code and manipulate complex data.',
        lessons: [
          { id: 'arrays', title: 'Arrays & Objects', type: 'Concept', points: 20, isCompleted: false },
          { id: 'functions', title: 'Functions & Scope', type: 'Concept', points: 20, isCompleted: false },
        ],
      },
      {
        level: 'Advanced',
        title: 'Architecture & Asynchronous',
        description: 'Build robust, non-blocking applications like a pro.',
        lessons: [
          { id: 'async', title: 'Promises & Async/Await', type: 'Concept', points: 30, isCompleted: false },
          { id: 'api', title: 'Fetching API Data', type: 'Concept', points: 30, isCompleted: false },
        ],
      },
    ];

    // Get track specific challenges
    const trackChallenges = challenges.filter(c => c.track === topic);
    
    // Inject challenges dynamically based on difficulty
    trackChallenges.forEach(c => {
      const lessonItem = { id: c.id, title: c.title, type: 'Challenge', points: c.points, isCompleted: false };
      if (c.difficulty === 'Easy') baseSyllabus[0].lessons.push(lessonItem);
      else if (c.difficulty === 'Medium') baseSyllabus[1].lessons.push(lessonItem);
      else if (c.difficulty === 'Hard') baseSyllabus[2].lessons.push(lessonItem);
    });

    return baseSyllabus;
  }, [challenges, topic]);

  const [expandedLevels, setExpandedLevels] = useState<string[]>(['Beginner']);

  const toggleLevel = (level: string) =>
    setExpandedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );

  return (
    <div className="bg-[#f3f7f7] min-h-screen font-sans">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-20 pt-6 pb-6">
        <div className="max-w-[1240px] mx-auto px-10 relative">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#738f93] mb-3 leading-none uppercase tracking-wide">
            <span onClick={() => navigate('/curriculum')} className="hover:text-brand-primary cursor-pointer transition">
              Prepare
            </span>
            <ChevronRight size={10} className="opacity-40" />
            <span className="opacity-60">{topic?.replace('-', ' ')}</span>
          </div>

          {/* Title + icon */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold text-[#1e2330] tracking-tight leading-none capitalize mb-2">
                {topic?.replace('-', ' ')} Syllabus
              </h1>
              <p className="text-[14px] text-[#5c6e7a]">
                Step-by-step master track designed to take you from absolute beginner to industry expert.
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
              <img src={getTopicIcon(topic)} alt={topic} className="w-full h-full object-contain" />
            </div>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto w-full flex justify-center items-start gap-8 px-4 xl:px-8 relative">
        <main className="w-full max-w-[800px] py-16 flex flex-col gap-8 pb-32">
          {syllabus.map((section, idx) => (
            <div key={section.level} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Accordion Header */}
              <div
                onClick={() => toggleLevel(section.level)}
                className="p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#738f93]">{section.level}</span>
                    {idx === 0 && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#1e2330] tracking-tight">{section.title}</h2>
                  <p className="text-[15px] text-[#5c6e7a] mt-1">{section.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#5c6e7a] shrink-0">
                  {expandedLevels.includes(section.level) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Accordion Body */}
              <AnimatePresence>
                {expandedLevels.includes(section.level) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                  >
                    <div className="p-4 md:p-6 space-y-3">
                      {section.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (lesson.type === 'Concept') {
                              navigate(`/curriculum/${topic}/lesson/${lesson.id}`);
                            } else {
                              navigate(`/challenges/${lesson.id}`);
                            }
                          }}
                          className={`p-4 md:p-5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            lesson.isCompleted
                              ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                              : 'bg-white border-slate-200 hover:border-brand-primary hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              lesson.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-[#5c6e7a]'
                            }`}>
                              {lesson.isCompleted
                                ? <CheckCircle2 size={20} />
                                : lesson.type === 'Concept'
                                  ? <BookOpen size={20} />
                                  : <Code2 size={20} />
                              }
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                                Part {lIdx + 1} • {lesson.type}
                              </span>
                              <h4 className={`text-[16px] font-bold ${
                                lesson.isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-[#1e2330]'
                              }`}>
                                {lesson.title}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[12px] font-bold text-slate-400">+{lesson.points} XP</span>
                            <ChevronRight size={18} className="text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))}
        </main>
      </div>

    </div>
  );
}
