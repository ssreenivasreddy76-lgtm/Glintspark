import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Star, BrainCircuit, ArrowRight, ShieldAlert, Sparkles, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MockInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mock_interviews_templates');
    if (saved) {
      try {
        setInterviews(JSON.parse(saved));
      } catch {
        setInterviews([]);
      }
    } else {
      // Fallback
      setInterviews([
        { id: 'mi-1', title: 'Senior React Engineer', role: 'Frontend', difficulty: 'Hard', techStack: 'React, TypeScript, Redux', prompt: 'You are a strict technical interviewer from FAANG.' }
      ]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-24">
      {/* Premium Header */}
      <div className="pt-24 pb-20 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md"
          >
            <Video size={14} className="text-brand-primary" />
            Mock Interviews
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Master the Technical Interview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Practice with our AI personas designed to mimic real-world engineering interviews from top-tier companies.
          </motion.p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-slate-200 to-slate-200 hover:from-blue-400 hover:to-cyan-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 group"
            >
              <div className="h-full bg-white/90 backdrop-blur-xl p-8 rounded-[31px] flex flex-col items-start transition-all group-hover:bg-white/95 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl rounded-full group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
                
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-500/30">
                  <BrainCircuit size={24} />
                </div>

                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                    item.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {item.difficulty}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.role}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                  {item.title}
                </h3>
                
                <p className="text-slate-500 text-sm font-medium mb-6 relative z-10 line-clamp-2 flex-grow">
                  Tech Stack: <span className="text-slate-700 font-bold">{item.techStack}</span>
                </p>

                <div className="relative z-10 w-full mt-auto">
                  <Link
                    to={`/interview/${item.id}`}
                    className="w-full flex px-6 py-4 bg-slate-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/25 justify-center items-center gap-2 group/btn"
                  >
                    Start Interview <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Coming Soon/Company Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: interviews.length * 0.1 }}
            className="bg-white/50 backdrop-blur-md rounded-[32px] p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center group hover:bg-white transition-colors cursor-default h-full min-h-[300px]"
          >
            <Building2 size={32} className="text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Company Specific</h3>
            <p className="text-slate-500 text-sm font-medium max-w-[200px]">More custom templates from partner companies will appear here.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
