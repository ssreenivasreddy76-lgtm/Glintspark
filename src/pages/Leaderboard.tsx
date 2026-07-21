import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Search, Globe, Users, Target, Crown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../services/supabaseService';
import StudentAnalyticsPanel from '../components/StudentAnalyticsPanel';
import { useEffect } from 'react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'monthly' | 'my-score' | 'batch-wise'>('global');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [realLeaders, setRealLeaders] = useState<any[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        setLoadingLeaders(true);
        const data = await supabaseDB.getLeaderboard(50);
        // Map backend users to leaderboard format
        const formatted = data.map((u: any, idx: number) => ({
          rank: idx + 1,
          name: u.name || `${u.firstName || 'Unknown'} ${u.lastName || 'User'}`,
          email: u.email,
          points: u.xp || 0,
          streak: u.streak || 0,
          country: u.country || 'Unknown', // Fallback if no country in DB
          level: (u.xp || 0) > 10000 ? 'Diamond' : (u.xp || 0) > 5000 ? 'Platinum' : (u.xp || 0) > 1000 ? 'Gold' : (u.xp || 0) > 500 ? 'Silver' : 'Bronze'
        }));
        setRealLeaders(formatted);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoadingLeaders(false);
      }
    }
    fetchLeaders();
  }, []);

  const isCompanyUser = user?._id === 'mock_company' || user?.role === 'company' || user?.email?.endsWith('@glintspark.team') || user?.email === 'company@glintspark.com';
  const companyDomain = (isCompanyUser && user?.email) ? user.email.split('@')[1] : null;

  // Filter data based on active tab
  const getFilteredLeaders = () => {
    // Create a deep copy to avoid mutating React state
    let currentLeaders = realLeaders.map(l => ({ ...l }));

    if (activeTab === 'monthly') {
      currentLeaders = currentLeaders.filter(l => l.points > 0).sort((a, b) => b.points - a.points);
    } else if (activeTab === 'batch-wise' && searchQuery.trim() !== '') {
      currentLeaders = currentLeaders.filter(l => 
        l.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
        l.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    // Recalculate ranks based on the filtered set
    currentLeaders.forEach((l, index) => {
      l.rank = index + 1;
    });

    if (activeTab === 'global') return currentLeaders;
    if (activeTab === 'monthly') return currentLeaders.slice(0, 5); 
    if (activeTab === 'my-score') return [
      { rank: 12042, name: 'You (Alex_Dev)', points: 1482, streak: 12, country: 'USA', level: 'Platinum' }
    ];
    return currentLeaders;
  };

  const filteredLeaders = getFilteredLeaders();

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900 pb-24 selection:bg-brand-primary/20">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leaderboard</h1>
              <p className="text-[13px] text-slate-500 font-medium">See how you rank against top developers globally</p>
            </div>
          </div>
          
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search developers..." 
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all w-full md:w-72 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ── Hero Section with Background Image ── */}
      <div className="relative bg-[#f8fafc] border-b border-slate-200 overflow-hidden min-h-[400px] flex items-center">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/leaderboard_hero_banner.png" 
            alt="Leaderboard Hero" 
            className="w-full h-full object-cover"
          />
          {/* Soft White Overlay for Readability */}
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[4px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              The Hall of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-500">Champions</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
              Compete globally, solve challenges daily, and cement your legacy among the world's elite developers.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* ── Main Leaderboard Container ── */}
        <div className="flex-1 max-w-5xl mx-auto">
          
          <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden">
            
            {/* Header Tabs */}
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(!isCompanyUser ? (['global', 'monthly', 'my-score'] as const) : (['global', 'batch-wise'] as const)).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-100' 
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {tab === 'global' ? (companyDomain ? 'College Ranking' : 'Global Ranking') : tab === 'monthly' ? 'This Month' : tab === 'batch-wise' ? 'Year Wise' : 'Your Progress'}
                  </button>
                ))}
              </div>

              {isCompanyUser && activeTab === 'batch-wise' && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search Roll No..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary placeholder:text-slate-400 transition-colors w-40 md:w-48"
                    />
                  </div>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-brand-primary cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <option value="All Years">All Years</option>
                    <option value="2024">Class of 2024</option>
                    <option value="2025">Class of 2025</option>
                    <option value="2026">Class of 2026</option>
                    <option value="2027">Class of 2027</option>
                  </select>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24">Rank</th>
                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Developer</th>
                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Glinto Score</th>
                    {companyDomain && <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>}
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="divide-y divide-slate-50"
                  >
                    {loadingLeaders ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          Loading leaderboard...
                        </td>
                      </tr>
                    ) : filteredLeaders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          No developers found.
                        </td>
                      </tr>
                    ) : filteredLeaders.map((l, idx) => {
                      const displayRank = l.rank;
                      return (
                      <tr 
                        key={l.rank}
                        className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-[15px] ${displayRank <= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                              #{displayRank}
                            </span>
                            {companyDomain && (
                              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider" title="Global Rank">
                                Global #{l.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/60 flex items-center justify-center text-[14px] font-black text-slate-500 shadow-inner">
                              {l.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[15px] text-slate-900 group-hover:text-brand-primary cursor-pointer transition-colors flex items-center gap-2">
                                {l.name}
                                {l.streak > 100 && <span title="100+ Day Streak"><Star size={14} className="text-amber-500 fill-amber-500 drop-shadow-sm" /></span>}
                              </div>
                              <div className="text-[13px] text-slate-500 font-medium mt-0.5">{l.country} • {l.streak} Day Streak</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-[16px] text-slate-900 tabular-nums">
                          {l.points.toLocaleString()}
                        </td>
                        {companyDomain && (
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => setSelectedStudent(l)}
                              className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-[12px] rounded-lg transition-colors uppercase tracking-widest"
                            >
                              View Details
                            </button>
                          </td>
                        )}
                      </tr>
                      );
                    })}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        {!isCompanyUser && (
        <div className="w-full lg:w-[340px] space-y-8">
          
          {/* Your Standing Card */}
          <div className="bg-white border border-slate-100/80 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={16} className="text-brand-primary" /> Your Standing
            </h3>
            
            <div className="space-y-8">
              <div className="flex flex-col gap-1.5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
                <span className="text-4xl font-black text-brand-primary tracking-tight">#12,042</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Points</span>
                  <span className="text-xl font-black text-slate-900">1,482</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Percentile</span>
                  <span className="text-xl font-black text-slate-900">Top 8%</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold text-[13px] rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 transition-all uppercase tracking-widest shadow-sm">
              View Detailed Analytics
            </button>
          </div>

          {/* Global Sync Card */}
          <div className="bg-brand-primary rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-brand-primary/20">
            {/* Background Graphic */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700 ease-out">
              <Globe size={120} />
            </div>
            
            <h3 className="text-lg font-black mb-4 flex items-center gap-2 relative z-10">
              <Globe size={20} className="text-blue-200" />
              Global Sync
            </h3>
            <p className="text-[14px] text-blue-100 font-medium leading-relaxed mb-8 relative z-10">
              Rankings are synchronized in real-time across all regions. Keep solving challenges daily to climb higher.
            </p>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Community</div>
                  <div className="text-[14px] font-black">85k+ Active Players</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Target size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Reset</div>
                  <div className="text-[14px] font-black">Daily Score Sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Slide-in Analytics Panel */}
      <StudentAnalyticsPanel 
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
      />
    </div>
  );
}
