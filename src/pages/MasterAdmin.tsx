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
  Trophy
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { AdminPracticeQuestions } from '../components/AdminPracticeQuestions';
import { AdminChallenges } from '../components/AdminChallenges';
import { AdminQuizzes } from '../components/AdminQuizzes';
import { AdminMockInterviews } from '../components/AdminMockInterviews';
import { AdminLearn } from '../components/AdminLearn';
import { AdminCompanyPermissions } from '../components/AdminCompanyPermissions';
import { AdminContests } from '../components/AdminContests';
import { AdminUsers } from '../components/AdminUsers';

type TabType = 'practice' | 'challenges' | 'quizzes' | 'mock' | 'learn' | 'companies' | 'users' | 'contests';

export default function MasterAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  const tabs = [
    { id: 'practice', label: 'Practice', icon: <Code2 size={20} /> },
    { id: 'challenges', label: 'Challenges', icon: <Code2 size={20} /> },
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
      case 'challenges':
        return <AdminChallenges />;
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
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo area */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black leading-none text-lg">Glintspark</span>
                <span className="text-brand-primary text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Admin</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Nav Scroll (Fallback if screen is small) */}
        <div className="md:hidden overflow-x-auto px-4 pb-3 flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
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
