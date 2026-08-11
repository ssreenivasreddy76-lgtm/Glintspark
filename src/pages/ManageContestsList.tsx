import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { Search, ChevronRight, Trophy, Plus, Settings, Users, CalendarClock, BarChart, ExternalLink, CalendarDays, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageContestsList() {
  const [contests, setContests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const allContests = await firebaseDB.getContests();
        const customContests = allContests.filter((c: any) => c.source === 'custom' || c.id.startsWith('custom-') || /^\d+$/.test(c.id));
        setContests(customContests);
      } catch (err) {
        console.error("Failed to fetch contests", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContests();
  }, [user]);

  const filteredContests = contests.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 pb-20">
      
      {/* Premium Header */}
      <div className="bg-[#0b0f17] border-b border-slate-800 sticky top-0 md:top-[56px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-400">
             <Link to="/company" className="hover:text-white transition-colors">Dashboard</Link>
             <ChevronRight size={14} />
             <span className="text-white">Manage Contests</span>
          </div>
          <div className="flex items-center gap-3">
             <Link 
                to="/contests/create"
                className="px-5 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2"
             >
               <Plus size={16} /> Schedule Contest
             </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Page Title & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Active Contests</h1>
            <p className="text-slate-500 font-medium text-[15px]">Manage your ongoing and upcoming hiring challenges or hackathons.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full md:w-80 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by name or ID..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-sm transition-shadow"
             />
          </motion.div>
        </div>

        {/* Data Grid / Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="animate-spin w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold">Loading contests...</p>
            </div>
          ) : filteredContests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <Trophy size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Contests Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">You haven't scheduled any contests yet, or your search didn't match any results.</p>
              <Link to="/contests/create" className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-md hover:bg-brand-dark transition-colors flex items-center gap-2">
                <Plus size={18} /> Schedule Your First Contest
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContests.map((contest, i) => (
                <div 
                  key={contest.id} 
                  onClick={() => navigate(`/contests/${contest.id}/manage`)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className={`px-2.5 py-1 text-[11px] font-black tracking-wider uppercase rounded-md ${contest.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                          {contest.status || 'Active'}
                        </span>
                        <span className="text-[13px] font-bold text-slate-400 font-mono">ID: {contest.id}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">{contest.title}</h3>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-primary group-hover:border-brand-200 transition-colors shrink-0">
                      <Settings size={20} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-500 mb-1">
                         <CalendarDays size={14} />
                         <span className="text-[12px] font-bold uppercase tracking-wider">Start Date</span>
                       </div>
                       <p className="text-[15px] font-bold text-slate-900">
                         {contest.date ? new Date(contest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                       </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-500 mb-1">
                         <Users size={14} />
                         <span className="text-[12px] font-bold uppercase tracking-wider">Registrations</span>
                       </div>
                       <p className="text-[15px] font-bold text-slate-900">
                         {contest.participants || '0'} <span className="text-[13px] text-slate-500 font-medium">Students</span>
                       </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-brand-primary font-bold">
                      <span>Manage Settings</span>
                      <ChevronRight size={16} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); window.open(`/contests/${contest.id}/landing`, '_blank'); }} className="text-slate-400 hover:text-slate-700 flex items-center gap-1.5 font-bold transition-colors">
                      <ExternalLink size={14} /> Preview Page
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
