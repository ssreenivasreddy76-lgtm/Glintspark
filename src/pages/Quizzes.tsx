import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Code, Calculator, ArrowRight, Clock, Award, Star } from 'lucide-react';

export const mockQuizzes = [
  {
    id: 'aptitude-101',
    title: 'Quantitative Aptitude Essentials',
    category: 'Aptitude',
    description: 'Test your basic numerical and mathematical reasoning skills.',
    questions: 10,
    timeLimit: 15, // minutes
    xpReward: 50,
    icon: Calculator,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    difficulty: 'Easy'
  },
  {
    id: 'reasoning-logic',
    title: 'Logical Reasoning Challenge',
    category: 'Reasoning',
    description: 'Evaluate your ability to analyze patterns, sequences, and logic.',
    questions: 15,
    timeLimit: 20,
    xpReward: 100,
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    difficulty: 'Medium'
  },
  {
    id: 'tech-react-basics',
    title: 'React Fundamentals',
    category: 'Technical',
    description: 'Assess your core knowledge of React hooks, state, and rendering.',
    questions: 20,
    timeLimit: 25,
    xpReward: 150,
    icon: Code,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    difficulty: 'Medium'
  }
];

export default function Quizzes() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Aptitude' | 'Reasoning' | 'Technical'>('All');
  const [quizzes, setQuizzes] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('mock_quizzes');
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved));
      } catch {
        setQuizzes(mockQuizzes);
      }
    } else {
      setQuizzes(mockQuizzes);
    }
  }, []);

  const filteredQuizzes = activeCategory === 'All' 
    ? quizzes 
    : quizzes.filter(q => q.category === activeCategory);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="bg-slate-900 pt-16 pb-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-brand-light font-medium text-sm mb-6">
            <Star size={16} className="fill-brand-light" /> Try our new Interactive Quizzes
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white mb-6">
            Test Your Knowledge. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-light">Earn XP.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-300 max-w-2xl mx-auto">
            Take highly curated quizzes in Aptitude, Reasoning, and Technical topics to benchmark your skills against top candidates.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Aptitude', 'Reasoning', 'Technical'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                activeCategory === cat 
                ? 'bg-brand-primary text-white scale-105 shadow-brand-primary/30' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => {
            const Icon = quiz.icon;
            return (
              <motion.div 
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all flex flex-col group relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${quiz.bg} ${quiz.color} flex items-center justify-center`}>
                    <Icon size={28} />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-primary transition-colors">{quiz.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {quiz.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Time Limit</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock size={16} className="text-brand-primary" /> {quiz.timeLimit} mins
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Reward</span>
                    <div className="flex items-center gap-1.5 font-bold text-amber-600">
                      <Award size={16} /> +{quiz.xpReward} XP
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/quizzes/${quiz.id}`}
                  className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 flex items-center justify-center gap-2 group-hover:bg-brand-primary transition-colors relative z-10 shadow-md"
                >
                  Start Quiz <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
