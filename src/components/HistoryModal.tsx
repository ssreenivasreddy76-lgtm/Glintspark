import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'rank' | 'glintos' | 'streak' | null;
  user: any;
}

export function HistoryModal({ isOpen, onClose, type, user }: HistoryModalProps) {
  if (!isOpen || !type) return null;

  const getTitle = () => {
    switch (type) {
      case 'rank': return 'Rank History';
      case 'glintos': return 'Glintos History';
      case 'streak': return 'Streak History';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'rank': return <Trophy size={20} className="text-amber-500" />;
      case 'glintos': return <Zap size={20} className="text-brand-primary" />;
      case 'streak': return <Sparkles size={20} className="text-orange-500" />;
    }
  };

  // Mock data for history
  const getMockHistory = () => {
    switch (type) {
      case 'rank':
        return [
          { date: 'Oct 15, 2025', value: '#1', desc: 'Reached Rank #1 globally!' },
          { date: 'Sep 01, 2025', value: '#15', desc: 'Top 100 ranking achieved.' },
          { date: 'Jul 20, 2025', value: '#42', desc: 'Consistent problem solving.' },
          { date: 'Jun 10, 2025', value: '#120', desc: 'Started competitive programming.' },
        ];
      case 'glintos':
        return [
          { date: 'Today', value: '+50', desc: 'Solved Daily Challenge' },
          { date: 'Yesterday', value: '+150', desc: 'Won Weekly Contest' },
          { date: '3 days ago', value: '+20', desc: 'Streak Bonus' },
          { date: 'Last week', value: '+500', desc: 'Level Up Reward' },
        ];
      case 'streak':
        return [
          { date: 'Current', value: '45 Days', desc: 'Active streak' },
          { date: 'Last Month', value: '30 Days', desc: 'Previous best streak' },
          { date: 'May 2025', value: '14 Days', desc: 'Lost due to vacation' },
        ];
    }
  };

  const history = getMockHistory();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#d1d5db] flex items-center justify-between bg-[#f3f7f7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                {getIcon()}
              </div>
              <h2 className="text-xl font-bold text-[#0e141e]">{getTitle()}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-[#0e141e] hover:bg-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="relative flex gap-4">
                  {/* Timeline line */}
                  {idx !== history.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-slate-100"></div>
                  )}
                  
                  {/* Timeline dot */}
                  <div className="w-6 h-6 rounded-full border-4 border-white bg-slate-200 shadow-sm shrink-0 mt-1 relative z-10"></div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#0e141e]">{item.value}</span>
                      <span className="text-xs font-bold text-[#738f93] uppercase tracking-wider">{item.date}</span>
                    </div>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-medium text-slate-400">
                Detailed history for {type} is coming soon in the next update.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
