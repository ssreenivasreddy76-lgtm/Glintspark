import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, Code, Calculator, ArrowRight, Clock, Award, Star, Loader2, 
  Search, Sparkles, BookOpen, Layers, Terminal, Database, Server, 
  Network, Cpu, CheckCircle2, TrendingUp, Users, Target, ShieldCheck,
  Flame, Filter, Zap
} from 'lucide-react';
import { firebaseDB } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

export interface QuizItem {
  id: string;
  title: string;
  category: 'Aptitude' | 'Reasoning' | 'Technical' | 'Core CS' | 'Verbal';
  trackBadge?: string;
  description: string;
  questions: number;
  timeLimit: number; // in minutes
  xpReward: number;
  iconName: string;
  color: string;
  bg: string;
  borderHover: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  attemptsCount?: number;
  passRate?: string;
  featured?: boolean;
}

export const mockQuizzes: QuizItem[] = [
  {
    id: 'aptitude-101',
    title: 'Quantitative Aptitude Essentials',
    category: 'Aptitude',
    trackBadge: 'Campus Placements',
    description: 'Master essential arithmetic, percentages, profit & loss, and time-distance equations.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Calculator',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50/80',
    borderHover: 'group-hover:border-indigo-500/40',
    difficulty: 'Easy',
    attemptsCount: 3420,
    passRate: '92%',
    featured: true
  },
  {
    id: 'reasoning-logic',
    title: 'Logical Reasoning Challenge',
    category: 'Reasoning',
    trackBadge: 'Critical Thinking',
    description: 'Sharpen analytical reasoning, sequence patterns, blood relations, and syllogisms.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Brain',
    color: 'text-purple-500',
    bg: 'bg-purple-50/80',
    borderHover: 'group-hover:border-purple-500/40',
    difficulty: 'Medium',
    attemptsCount: 2890,
    passRate: '86%'
  },
  {
    id: 'arithmetic-mastery',
    title: 'Number Systems & Arithmetic Mastery',
    category: 'Aptitude',
    trackBadge: 'Speed Math',
    description: 'Test your grasp on HCF, LCM, Divisibility, Fractions, and Ratio-Proportion fundamentals.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Calculator',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/80',
    borderHover: 'group-hover:border-emerald-500/40',
    difficulty: 'Easy',
    attemptsCount: 1950,
    passRate: '91%'
  },
  {
    id: 'analytical-logic',
    title: 'Analytical & Deductive Logic',
    category: 'Reasoning',
    trackBadge: 'Pattern Recognition',
    description: 'Evaluate your ability to deduce conclusions from statements, seating layouts, and directional puzzles.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Brain',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50/80',
    borderHover: 'group-hover:border-cyan-500/40',
    difficulty: 'Medium',
    attemptsCount: 2310,
    passRate: '84%'
  },
  {
    id: 'time-speed-work',
    title: 'Time, Speed & Work Speedrun',
    category: 'Aptitude',
    trackBadge: 'Interview Math',
    description: 'Solve real-world problems on relative speeds, trains, pipes & cisterns, and collaborative work rates.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Calculator',
    color: 'text-amber-500',
    bg: 'bg-amber-50/80',
    borderHover: 'group-hover:border-amber-500/40',
    difficulty: 'Medium',
    attemptsCount: 3120,
    passRate: '80%'
  },
  {
    id: 'coding-decoding-relations',
    title: 'Coding, Decoding & Blood Relations',
    category: 'Reasoning',
    trackBadge: 'Logic Puzzles',
    description: 'Master cipher substitution, family tree deductions, and alphanumeric matrix sequencing.',
    questions: 10,
    timeLimit: 15,
    xpReward: 50,
    iconName: 'Brain',
    color: 'text-rose-500',
    bg: 'bg-rose-50/80',
    borderHover: 'group-hover:border-rose-500/40',
    difficulty: 'Easy',
    attemptsCount: 2740,
    passRate: '89%'
  }
];

const ICONS_MAP: Record<string, any> = {
  Calculator,
  Brain,
  Code,
  Terminal,
  Database,
  Zap,
  Layers,
  Cpu,
  Network,
  BookOpen,
  Server
};

export default function Quizzes() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSolvedQuizzes, setUserSolvedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const dbQuizzes = await firebaseDB.getQuizzes();
        setQuizzes(dbQuizzes && dbQuizzes.length > 0 ? dbQuizzes : mockQuizzes);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
        setQuizzes(mockQuizzes);
      }
      setIsLoading(false);
    };
    fetchQuizzes();
  }, []);

  // Fetch user quiz progress
  useEffect(() => {
    if (user) {
      firebaseDB.getUserProgress(user._id).then(progress => {
        if (progress?.solvedQuizzes) {
          setUserSolvedQuizzes(progress.solvedQuizzes);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Filter Categories list with counts (All, Aptitude & Reasoning)
  const categories = useMemo(() => {
    const aptCount = quizzes.filter(q => q.category === 'Aptitude' || q.category === 'Reasoning' || q.category === 'Aptitude & Reasoning').length;
    return [
      { id: 'All', label: 'All', count: quizzes.length },
      { id: 'Aptitude & Reasoning', label: 'Aptitude & Reasoning', count: aptCount }
    ];
  }, [quizzes]);

  // Filtered Quizzes Logic
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchCategory = activeCategory === 'All' || 
        (activeCategory === 'Aptitude & Reasoning' ? (q.category === 'Aptitude' || q.category === 'Reasoning' || q.category === 'Aptitude & Reasoning') : q.category === activeCategory);
      const matchSearch = searchQuery.trim() === '' || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.trackBadge && q.trackBadge.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [quizzes, activeCategory, searchQuery]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* ── Main Content Area ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Quizzes Grid ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="animate-spin text-brand-primary w-10 h-10 mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading comprehensive skill assessments...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No quizzes match your filters</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Try adjusting your search query or selecting "All Assessments" to explore the full library.
            </p>
            <button
              onClick={() => { setActiveCategory('All'); setDifficultyFilter('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const Icon = ICONS_MAP[quiz.iconName] || Brain;
              const isSolved = userSolvedQuizzes.includes(quiz.id);

              const diffStyles = {
                Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Medium: 'bg-amber-50 text-amber-700 border-amber-200',
                Hard: 'bg-rose-50 text-rose-700 border-rose-200'
              }[quiz.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <motion.div 
                  key={quiz.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col group relative overflow-hidden ${quiz.borderHover}`}
                >
                  {/* Subtle Top Indicator Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent group-hover:via-brand-primary transition-all" />

                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className={`w-13 h-13 p-3 rounded-2xl ${quiz.bg || 'bg-indigo-50'} ${quiz.color || 'text-indigo-500'} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                      <Icon size={24} strokeWidth={2.2} />
                    </div>

                    <div className="flex items-center gap-2">
                      {isSolved && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${diffStyles}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Track Badge & Title */}
                  <div className="relative z-10 flex-1 mb-4">
                    {quiz.trackBadge && (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        {quiz.trackBadge}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-primary transition-colors leading-snug">
                      {quiz.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50/80 border border-slate-100 mb-5 relative z-10 text-xs font-semibold">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Questions</span>
                      <span className="text-slate-700 font-mono font-bold mt-0.5">{quiz.questions} Qs</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-2">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Time Limit</span>
                      <span className="text-slate-700 font-mono font-bold mt-0.5 flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" /> {quiz.timeLimit}m
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-2">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Reward</span>
                      <span className="text-amber-600 font-mono font-bold mt-0.5 flex items-center gap-1">
                        <Award size={11} /> +{quiz.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link 
                    to={`/quizzes/${quiz.id}`}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center gap-2 transition-all relative z-10 group/btn border border-slate-200 hover:border-slate-900 shadow-sm"
                  >
                    <span>{isSolved ? 'Retake Assessment' : 'Start Assessment'}</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
