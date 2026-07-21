import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, BrainCircuit, Code2, Target, Video, Trophy, Flame } from 'lucide-react';

interface StudentAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export default function StudentAnalyticsPanel({ isOpen, onClose, student }: StudentAnalyticsPanelProps) {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[500px] bg-slate-50 shadow-2xl z-[101] overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/60 flex items-center justify-center text-[14px] font-black text-slate-500 shadow-inner">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{student.name}</h2>
                  <p className="text-[13px] text-slate-500 font-bold">{student.country} • {student.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              
              {/* Highlight Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} className="text-amber-500" /> Total Score
                  </span>
                  <span className="text-3xl font-black text-slate-900">{student.points.toLocaleString()}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" /> Current Streak
                  </span>
                  <span className="text-3xl font-black text-slate-900">{student.streak} Days</span>
                </div>
              </div>

              {/* AI Mock Interviews */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Video size={16} className="text-brand-primary" /> AI Mock Interviews
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-slate-900">12</span>
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Attended</span>
                  </div>
                  <div className="w-[1px] h-12 bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-emerald-500">85%</span>
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Avg Score</span>
                  </div>
                  <div className="w-[1px] h-12 bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-blue-500">4</span>
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Passed</span>
                  </div>
                </div>
              </div>

              {/* Challenges & Practice */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <Code2 size={60} />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                    <Code2 size={14} className="text-brand-primary" /> Challenges
                  </h3>
                  <div className="relative z-10 mb-4">
                    <span className="text-4xl font-black">47</span>
                    <p className="text-[12px] text-slate-400 font-medium mt-1">Challenges Solved</p>
                  </div>
                  <div className="relative z-10 flex gap-2 mb-4">
                    <div className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg py-1.5 text-center text-[11px] font-black">12 Easy</div>
                    <div className="flex-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg py-1.5 text-center text-[11px] font-black">25 Med</div>
                    <div className="flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg py-1.5 text-center text-[11px] font-black">10 Hard</div>
                  </div>
                  <div className="relative z-10 flex flex-col gap-2 border-t border-slate-800 pt-3">
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-slate-300">Python</span>
                      <span className="text-amber-400 flex items-center gap-1"><Trophy size={12}/> Gold</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-slate-300">C++</span>
                      <span className="text-slate-300 flex items-center gap-1"><Trophy size={12}/> Silver</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-primary border border-blue-500 rounded-3xl p-6 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <Target size={60} />
                  </div>
                  <h3 className="text-[11px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                    <Target size={14} className="text-white" /> Practice
                  </h3>
                  <div className="relative z-10 mb-4">
                    <span className="text-4xl font-black">128</span>
                    <p className="text-[12px] text-blue-100 font-medium mt-1">Problems Solved</p>
                  </div>
                  <div className="relative z-10 flex gap-2 mb-4">
                    <div className="flex-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-lg py-1.5 text-center text-[11px] font-black">54 Easy</div>
                    <div className="flex-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-lg py-1.5 text-center text-[11px] font-black">49 Med</div>
                    <div className="flex-1 bg-rose-400/20 text-rose-200 border border-rose-400/30 rounded-lg py-1.5 text-center text-[11px] font-black">25 Hard</div>
                  </div>
                  <div className="relative z-10 flex flex-col gap-2 border-t border-blue-400/50 pt-3">
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-blue-100">Java</span>
                      <span className="text-white">65 Qs</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-blue-100">JavaScript</span>
                      <span className="text-white">43 Qs</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-blue-100">Python</span>
                      <span className="text-white">20 Qs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications & Badges */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Award size={16} className="text-purple-500" /> Certifications & Badges
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSelectedCert('Advanced DSA')} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BrainCircuit size={20} className="text-blue-600" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Advanced DSA</span>
                  </button>
                  <button onClick={() => setSelectedCert('Frontend Master')} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Code2 size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Frontend Master</span>
                  </button>
                  <button onClick={() => setSelectedCert('Top 1% Rank')} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award size={20} className="text-purple-600" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Top 1% Rank</span>
                  </button>
                  <button onClick={() => setSelectedCert('100+ Day Streak')} className="border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Flame size={20} className="text-amber-600" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">100+ Day Streak</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
          
          {/* Certificate Modal Overlay */}
          <AnimatePresence>
            {selectedCert && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-sm"
                onClick={() => setSelectedCert(null)}
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white p-12 rounded-[32px] max-w-2xl w-full text-center relative shadow-2xl border-4 border-slate-100/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => setSelectedCert(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full">
                    <X size={20} />
                  </button>
                  
                  <Award size={64} className="text-brand-primary mx-auto mb-6" />
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Certificate of Excellence</h4>
                  <h2 className="text-4xl font-black text-slate-900 mb-8">{selectedCert}</h2>
                  
                  <p className="text-lg text-slate-600 font-medium mb-12">
                    This certifies that <strong className="text-slate-900">{student.name}</strong> has successfully demonstrated exceptional proficiency and mastery in <span className="font-bold">{selectedCert}</span>.
                  </p>
                  
                  <div className="flex justify-center gap-12 border-t border-slate-100 pt-8">
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Issued On</div>
                      <div className="text-[15px] font-bold text-slate-900 mt-1">Oct 12, 2025</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Credential ID</div>
                      <div className="text-[15px] font-bold text-slate-900 mt-1">GS-{Math.floor(Math.random() * 90000) + 10000}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}
    </AnimatePresence>
  );
}
