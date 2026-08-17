import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  BrainCircuit, 
  BookOpen, 
  Building2, 
  Users, 
  MessageSquare,
  LogOut,
  Trophy,
  FileText
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';
import { AdminPracticeQuestions } from '../components/AdminPracticeQuestions';
import { AdminSheets } from '../components/AdminSheets';
import { AdminQuizzes } from '../components/AdminQuizzes';
import { AdminMockInterviews } from '../components/AdminMockInterviews';
import { AdminLearn } from '../components/AdminLearn';
import { AdminCompanyPermissions } from '../components/AdminCompanyPermissions';
import { AdminContests } from '../components/AdminContests';
import { AdminUsers } from '../components/AdminUsers';

type TabType = 'practice' | 'sheets' | 'quizzes' | 'mock' | 'learn' | 'companies' | 'users' | 'contests';

export default function MasterAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  const tabs = [
    { id: 'practice', label: 'Practice', icon: <Code2 size={20} /> },
    { id: 'sheets', label: 'Sheets', icon: <FileText size={20} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <BrainCircuit size={20} /> },
    { id: 'mock', label: 'Mock Interviews', icon: <MessageSquare size={20} /> },
    { id: 'learn', label: 'Learn (Curriculum)', icon: <BookOpen size={20} /> },
    { id: 'contests', label: 'Contests', icon: <Trophy size={20} /> },
    { id: 'companies', label: 'Companies', icon: <Building2 size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
  ] as const;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/master';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'practice':
        return <AdminPracticeQuestions />;
      case 'sheets':
        return <AdminSheets />;
      case 'quizzes':
        return <AdminQuizzes />;
      case 'mock':
        return <AdminMockInterviews />;
      case 'learn':
        return <AdminLearn />;
      case 'contests':
        return <AdminContests />;
      case 'companies':
        return <AdminCompanyPermissions />;
      case 'users':
        return <AdminUsers />;
      default:
        return <AdminPracticeQuestions />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navigation Bar - Matches User Dashboard */}
      <nav className="fixed top-0 w-full z-[100] border-b border-slate-800/80 bg-slate-950 shadow-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between">
          
          {/* Left: Logo + Desktop Menu */}
          <div className="flex items-center gap-8 h-full">
            <div className="flex items-center gap-2 group shrink-0">
              <Logo size={28} variant="light" />
              <span className="text-brand-primary text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ml-2 border border-brand-primary/30 px-2 py-0.5 rounded-full bg-brand-primary/10">Admin</span>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1 text-[14px] font-bold text-slate-400 h-full overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 rounded-full flex items-center whitespace-nowrap hover:text-white transition-all relative ${
                    activeTab === tab.id ? 'text-white' : ''
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="adminNavbg" 
                      className="absolute inset-0 bg-white/10 rounded-full" 
                      style={{ zIndex: -1 }} 
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Nav Scroll (Fallback if screen is small) */}
        <div className="lg:hidden overflow-x-auto px-4 pb-2 flex space-x-2 no-scrollbar border-t border-slate-800/50 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-1.5 whitespace-nowrap rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-[104px] lg:pt-[56px] mt-0">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
