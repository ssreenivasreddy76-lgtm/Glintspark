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
    questions: 15,
    timeLimit: 20,
    xpReward: 100,
    iconName: 'Brain',
    color: 'text-purple-500',
    bg: 'bg-purple-50/80',
    borderHover: 'group-hover:border-purple-500/40',
    difficulty: 'Medium',
    attemptsCount: 2890,
    passRate: '86%'
  },
  {
    id: 'tech-react-basics',
    title: 'React 18 & State Architecture',
    category: 'Technical',
    trackBadge: 'Frontend Engineering',
    description: 'Assess practical knowledge on React hooks, fiber reconciliation, contexts, and optimization.',
    questions: 15,
    timeLimit: 20,
    xpReward: 120,
    iconName: 'Code',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50/80',
    borderHover: 'group-hover:border-cyan-500/40',
    difficulty: 'Medium',
    attemptsCount: 4120,
    passRate: '79%'
  },
  {
    id: 'core-java-oop',
    title: 'Core Java & OOPs Mastery',
    category: 'Technical',
    trackBadge: 'Enterprise Software',
    description: 'Deep-dive into polymorphism, multi-threading, JVM memory model, and collections framework.',
    questions: 15,
    timeLimit: 20,
    xpReward: 100,
    iconName: 'Terminal',
    color: 'text-amber-500',
    bg: 'bg-amber-50/80',
    borderHover: 'group-hover:border-amber-500/40',
    difficulty: 'Medium',
    attemptsCount: 3810,
    passRate: '84%'
  },
  {
    id: 'sql-databases',
    title: 'SQL Queries & Database Internals',
    category: 'Core CS',
    trackBadge: 'Data Systems',
    description: 'Test your expertise on complex joins, indexing strategies, normalization, and ACID properties.',
    questions: 12,
    timeLimit: 15,
    xpReward: 80,
    iconName: 'Database',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/80',
    borderHover: 'group-hover:border-emerald-500/40',
    difficulty: 'Easy',
    attemptsCount: 2950,
    passRate: '90%'
  },
  {
    id: 'python-mastery',
    title: 'Python 3 Advanced Concepts',
    category: 'Technical',
    trackBadge: 'Backend & Data',
    description: 'Evaluate your grasp of generators, decorators, async/await, memory management, and typing.',
    questions: 15,
    timeLimit: 20,
    xpReward: 120,
    iconName: 'Zap',
    color: 'text-blue-500',
    bg: 'bg-blue-50/80',
    borderHover: 'group-hover:border-blue-500/40',
    difficulty: 'Medium',
    attemptsCount: 3640,
    passRate: '81%'
  },
  {
    id: 'dsa-essentials',
    title: 'Data Structures & Algorithms',
    category: 'Core CS',
    trackBadge: 'Coding Interviews',
    description: 'Solve fast-paced MCQs on trees, graphs, dynamic programming, and asymptotic complexity.',
    questions: 20,
    timeLimit: 30,
    xpReward: 200,
    iconName: 'Layers',
    color: 'text-rose-500',
    bg: 'bg-rose-50/80',
    borderHover: 'group-hover:border-rose-500/40',
    difficulty: 'Hard',
    attemptsCount: 5120,
    passRate: '68%',
    featured: true
  },
  {
    id: 'os-concurrency',
    title: 'Operating Systems & Concurrency',
    category: 'Core CS',
    trackBadge: 'Systems & Core',
    description: 'Key questions on process scheduling, virtual memory, paging, deadlocks, and IPC.',
    questions: 15,
    timeLimit: 20,
    xpReward: 100,
    iconName: 'Cpu',
    color: 'text-violet-500',
    bg: 'bg-violet-50/80',
    borderHover: 'group-hover:border-violet-500/40',
    difficulty: 'Medium',
    attemptsCount: 2150,
    passRate: '77%'
  },
  {
    id: 'computer-networks',
    title: 'Computer Networks & Protocols',
    category: 'Core CS',
    trackBadge: 'Networking',
    description: 'Master OSI layers, TCP/IP handshakes, DNS routing, subnetting, and HTTP/HTTPS security.',
    questions: 15,
    timeLimit: 20,
    xpReward: 100,
    iconName: 'Network',
    color: 'text-teal-500',
    bg: 'bg-teal-50/80',
    borderHover: 'group-hover:border-teal-500/40',
    difficulty: 'Medium',
    attemptsCount: 2430,
    passRate: '83%'
  },
  {
    id: 'verbal-ability',
    title: 'Verbal Ability & Business English',
    category: 'Verbal',
    trackBadge: 'Communication',
    description: 'Refine sentence corrections, active vocabulary, reading comprehension, and error spotting.',
    questions: 12,
    timeLimit: 15,
    xpReward: 60,
    iconName: 'BookOpen',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/80',
    borderHover: 'group-hover:border-emerald-500/40',
    difficulty: 'Easy',
    attemptsCount: 1980,
    passRate: '94%'
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Computing & Docker Basics',
    category: 'Technical',
    trackBadge: 'DevOps & Infra',
    description: 'Fundamental evaluation of containerization, CI/CD pipelines, AWS primitives, and microservices.',
    questions: 15,
    timeLimit: 20,
    xpReward: 150,
    iconName: 'Server',
    color: 'text-sky-500',
    bg: 'bg-sky-50/80',
    borderHover: 'group-hover:border-sky-500/40',
    difficulty: 'Hard',
    attemptsCount: 1870,
    passRate: '72%'
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
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
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

  // Filter Categories list with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: quizzes.length };
    quizzes.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return [
      { id: 'All', label: 'All Assessments', count: counts['All'] || 0 },
      { id: 'Aptitude', label: 'Aptitude', count: counts['Aptitude'] || 0 },
      { id: 'Reasoning', label: 'Reasoning', count: counts['Reasoning'] || 0 },
      { id: 'Technical', label: 'Tech & Languages', count: counts['Technical'] || 0 },
      { id: 'Core CS', label: 'Core Computer Science', count: counts['Core CS'] || 0 },
      { id: 'Verbal', label: 'Verbal English', count: counts['Verbal'] || 0 }
    ];
  }, [quizzes]);

  // Filtered Quizzes Logic
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      const matchCategory = activeCategory === 'All' || q.category === activeCategory;
      const matchDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      const matchSearch = searchQuery.trim() === '' || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.trackBadge && q.trackBadge.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchDifficulty && matchSearch;
    });
  }, [quizzes, activeCategory, difficultyFilter, searchQuery]);

  // Featured Daily Quiz Spotlight
  const featuredQuiz = useMemo(() => {
    return quizzes.find(q => q.featured) || quizzes[0];
  }, [quizzes]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-28 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        
        {/* Ambient Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Header Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-cyan-400 text-[12px] font-bold tracking-wide uppercase mb-6 shadow-sm">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                Adaptive Assessment & Aptitude Engine
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-outfit">
                Master Technical, Logical & <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Aptitude Quizzes</span>
              </h1>
              
              <p className="text-slate-400 text-[16px] leading-relaxed mb-8 max-w-xl">
                Benchmark your speed, accuracy, and core problem-solving aptitude with industry-standard timed assessments. Level up your XP rank today.
              </p>

              {/* Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center lg:text-left">
                  <div className="text-2xl font-black text-white font-mono">{quizzes.length}+</div>
                  <div className="text-xs font-semibold text-slate-400">Total Quizzes</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center lg:text-left">
                  <div className="text-2xl font-black text-amber-400 font-mono">+250 XP</div>
                  <div className="text-xs font-semibold text-slate-400">Max Reward</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center lg:text-left">
                  <div className="text-2xl font-black text-emerald-400 font-mono">15-30m</div>
                  <div className="text-xs font-semibold text-slate-400">Fast-Paced</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center lg:text-left">
                  <div className="text-2xl font-black text-cyan-400 font-mono">100%</div>
                  <div className="text-xs font-semibold text-slate-400">Free Practice</div>
                </div>
              </div>
            </div>

            {/* Right Daily Highlight Spotlight */}
            {featuredQuiz && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full lg:max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-700/60 rounded-3xl p-7 shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Flame size={14} /> Spotlight Quiz of the Day
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Users size={13} /> {featuredQuiz.attemptsCount || 2500}+ taken
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {featuredQuiz.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                  {featuredQuiz.description}
                </p>

                <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-6 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Clock size={15} className="text-cyan-400" /> {featuredQuiz.timeLimit} mins
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Target size={15} className="text-emerald-400" /> {featuredQuiz.questions} Questions
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Award size={15} /> +{featuredQuiz.xpReward} XP
                  </div>
                </div>

                <Link
                  to={`/quizzes/${featuredQuiz.id}`}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group"
                >
                  <span>Launch Daily Assessment</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}

          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
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

          {/* Difficulty Dropdown Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Difficulty:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    difficultyFilter === diff 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
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
