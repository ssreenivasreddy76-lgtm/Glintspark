import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Search, Globe, Users, Target, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../services/supabaseService';
import StudentAnalyticsPanel from '../components/StudentAnalyticsPanel';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'monthly' | 'my-score' | 'batch-wise'>('global');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<string>('All Colleges');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [selectedBatch, setSelectedBatch] = useState<string>('All Batches');
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Total Score');
  const [sortDirection, setSortDirection] = useState<'High - Low' | 'Low - High'>('High - Low');

  const [realLeaders, setRealLeaders] = useState<any[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'All'>(50);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        setLoadingLeaders(true);
        const data = await supabaseDB.getLeaderboard(200); // fetch more for pagination demo
        const formatted = data.map((u: any, idx: number) => ({
          rank: idx + 1,
          name: u.name || `${u.firstName || 'Unknown'} ${u.lastName || 'User'}`,
          email: u.email,
          points: u.xp || 0,
          streak: u.streak || 0,
          country: u.country || 'Unknown',
          college: u.college || 'Unknown',
          branch: u.branch || 'Unknown',
          batch: u.batch || 'Unknown',
          graduationYear: u.graduationYear || 'Unknown',
          usn: u.usn || null,
          avatar: u.avatar || null,
          level: (u.xp || 0) > 10000 ? 'Diamond' : (u.xp || 0) > 5000 ? 'Platinum' : (u.xp || 0) > 1000 ? 'Gold' : (u.xp || 0) > 500 ? 'Silver' : 'Bronze',
          leetcodeHandle: u.leetcode || null,
          codeforcesHandle: u.codeforces || null,
          gfgHandle: u.gfg || null,
          liveLeetcode: undefined,
          liveCodeforces: undefined,
          liveGfg: undefined,
          isFetchingLeetcode: !!u.leetcode,
          isFetchingCodeforces: !!u.codeforces,
          isFetchingGfg: !!u.gfg
        }));
        setRealLeaders(formatted);

        // Background Live Fetching
        const liveFetched = [...formatted];
        let hasUpdates = false;

        const promises = liveFetched.map(async (u, i) => {
           if (u.leetcodeHandle) {
             try {
                const handle = u.leetcodeHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(handle)}`);
                const data = await res.json();
                if (data.status === 'success') {
                   liveFetched[i].liveLeetcode = data.totalSolved;
                }
             } catch (e) { console.error('LeetCode fetch error', e) }
             finally { liveFetched[i].isFetchingLeetcode = false; hasUpdates = true; }
           }
           if (u.codeforcesHandle) {
             try {
                const handle = u.codeforcesHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
                const data = await res.json();
                if (data.status === 'OK') {
                   liveFetched[i].liveCodeforces = data.result[0].rating;
                }
             } catch (e) { console.error('Codeforces fetch error', e) }
             finally { liveFetched[i].isFetchingCodeforces = false; hasUpdates = true; }
           }
           if (u.gfgHandle) {
             try {
                const handle = u.gfgHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const res = await fetch(`https://geeks-for-geeks-api.vercel.app/${encodeURIComponent(handle)}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.json();
                if (data.info && data.info.totalProblemsSolved) {
                   liveFetched[i].liveGfg = data.info.totalProblemsSolved;
                }
             } catch (e) { console.error('GFG fetch error', e) }
             finally { liveFetched[i].isFetchingGfg = false; hasUpdates = true; }
           }
        });

        Promise.all(promises).then(() => {
           if (hasUpdates) {
             setRealLeaders([...liveFetched]);
           }
        });

      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoadingLeaders(false);
      }
    }
    fetchLeaders();
  }, []);

  const uniqueColleges = Array.from(new Set(realLeaders.map(l => l.college))).filter(c => c && c !== 'Unknown').sort();
  const uniqueBranches = Array.from(new Set(realLeaders.map(l => l.branch))).filter(b => b && b !== 'Unknown').sort();
  const uniqueBatches = Array.from(new Set(realLeaders.map(l => l.batch))).filter(b => b && b !== 'Unknown').sort();
  const uniqueYears = Array.from(new Set(realLeaders.map(l => l.graduationYear))).filter(y => y && y !== 'Unknown').sort();

  const getFilteredLeaders = () => {
    let currentLeaders = realLeaders.map(l => ({ ...l }));

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      currentLeaders = currentLeaders.filter(l => 
        (l.email && l.email.toLowerCase().includes(q)) || 
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.country && l.country.toLowerCase().includes(q))
      );
    }

    if (selectedCollege !== 'All Colleges') {
      currentLeaders = currentLeaders.filter(l => l.college === selectedCollege);
    }
    if (selectedBranch !== 'All Branches') {
      currentLeaders = currentLeaders.filter(l => l.branch === selectedBranch);
    }
    if (selectedBatch !== 'All Batches') {
      currentLeaders = currentLeaders.filter(l => l.batch === selectedBatch);
    }
    if (selectedYear !== 'All Years') {
      currentLeaders = currentLeaders.filter(l => l.graduationYear === selectedYear);
    }
    if (selectedPlatform !== 'All') {
      if (selectedPlatform === 'LeetCode') currentLeaders = currentLeaders.filter(l => l.leetcodeHandle);
      if (selectedPlatform === 'Codeforces') currentLeaders = currentLeaders.filter(l => l.codeforcesHandle);
      if (selectedPlatform === 'GeeksForGeeks') currentLeaders = currentLeaders.filter(l => l.gfgHandle);
    }

    if (activeTab === 'monthly') {
      currentLeaders = currentLeaders.filter(l => l.points > 0);
    }

    currentLeaders.sort((a, b) => {
      let valA = a.points;
      let valB = b.points;
      if (sortBy === 'Streak') {
         valA = a.streak;
         valB = b.streak;
      }
      return sortDirection === 'High - Low' ? valB - valA : valA - valB;
    });

    currentLeaders.forEach((l, index) => {
      l.rank = index + 1;
    });

    return currentLeaders;
  };

  const filteredLeaders = getFilteredLeaders();
  
  // Pagination logic
  const totalItems = filteredLeaders.length;
  const effectiveItemsPerPage = itemsPerPage === 'All' ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / effectiveItemsPerPage) || 1;
  const currentLeadersList = itemsPerPage === 'All' 
    ? filteredLeaders 
    : filteredLeaders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const top3 = filteredLeaders.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  // Helper to get initials
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Helper to mock stats for the requested view
  const getMockStat = (points: number, multiplier: number) => {
      const val = Math.floor((points * multiplier) % 1500);
      return val > 0 ? val : '-';
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900 pb-12 selection:bg-brand-primary/20">
      
      {/* ── Page Header / Search Bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm relative overflow-hidden">
         {/* Subtle background glow mimicking the image */}
         <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
         
         <div className="max-w-7xl mx-auto px-8 py-4">
            
            {/* Top Row: Search and Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-2xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                  <span>Sort:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer">
                    <option value="Total Score">Total Score</option>
                    <option value="Streak">Streak</option>
                  </select>
                </div>
                <button onClick={() => setSortDirection(prev => prev === 'High - Low' ? 'Low - High' : 'High - Low')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                   {sortDirection}
                </button>
              </div>
            </div>

            {/* Bottom Row: Filters & Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 relative z-10">
               {/* Dropdowns */}
               <div className="flex flex-wrap items-center gap-3">
                  <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 bg-white outline-none focus:border-brand-primary min-w-[140px] cursor-pointer hover:bg-slate-50">
                    <option value="All Colleges">All Colleges</option>
                    {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  
                  <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 bg-white outline-none focus:border-brand-primary min-w-[140px] cursor-pointer hover:bg-slate-50">
                    <option value="All Branches">All Branches</option>
                    {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 bg-white outline-none focus:border-brand-primary min-w-[140px] cursor-pointer hover:bg-slate-50">
                    <option value="All Batches">All Batches</option>
                    {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 bg-white outline-none focus:border-brand-primary min-w-[140px] cursor-pointer hover:bg-slate-50">
                    <option value="All Years">All Years</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>

               {/* Platform Pills */}
               <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-2">Platform</span>
                  {['All', 'LeetCode', 'Codeforces', 'CodeChef', 'GFG'].map(plat => (
                    <button key={plat} onClick={() => setSelectedPlatform(plat)} className={`px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors ${selectedPlatform === plat ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                      {plat}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        
        {/* ── Tabs (Skill Score / This Week) ── */}
        <div className="flex items-center gap-3 mb-12">
           <button onClick={() => setActiveTab('global')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[14px] transition-colors ${activeTab === 'global' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
             <Star size={16} className={activeTab === 'global' ? "fill-brand-primary" : ""} /> Skill Score
           </button>
           <button onClick={() => setActiveTab('monthly')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[14px] transition-colors ${activeTab === 'monthly' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
             This Week <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] uppercase">New</span>
           </button>
        </div>

        {/* ── Top 3 Podium ── */}
        <div className="flex justify-center items-end gap-4 md:gap-8 mb-16 h-[220px]">
          {/* Rank 2 */}
          {rank2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center relative z-10 w-28 md:w-36 pb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-slate-200 to-white p-1 shadow-lg border border-slate-200 relative mb-4">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-black text-xl text-slate-500 overflow-hidden shadow-inner">
                  {getInitials(rank2.name)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-md">
                   <span className="text-[14px]">🥈</span>
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 text-center w-full relative z-20">
                <div className="font-bold text-[13px] text-slate-900 truncate">{rank2.name.split(' ')[0]}</div>
                <div className="font-black text-[15px] text-slate-700 mt-0.5">{rank2.points}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">#2</div>
              </div>
              {/* Podium Base */}
              <div className="absolute bottom-0 w-full h-2 bg-gradient-to-t from-slate-300 to-transparent -z-10 opacity-30 rounded-t-xl" />
            </motion.div>
          )}

          {/* Rank 1 */}
          {rank1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center relative z-20 w-32 md:w-44 pb-8">
              <div className="absolute -top-12">
                 <Crown size={32} className="text-amber-400 fill-amber-400 drop-shadow-md animate-pulse" />
              </div>
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-amber-200 to-amber-50 p-1.5 shadow-xl shadow-amber-500/20 border-2 border-amber-300 relative mb-4">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-3xl text-amber-600 overflow-hidden shadow-inner">
                  {getInitials(rank1.name)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shadow-md">
                   <span className="text-[20px]">🥇</span>
                </div>
              </div>
              <div className="bg-white px-5 py-4 rounded-xl shadow-lg shadow-brand-primary/5 border border-amber-100/50 text-center w-full relative z-20 transform scale-110">
                <div className="font-black text-[15px] text-slate-900 truncate">{rank1.name.split(' ')[0]}</div>
                <div className="font-black text-[18px] text-amber-600 mt-0.5">{rank1.points}</div>
                <div className="text-[11px] font-black text-amber-400/80 mt-1 uppercase tracking-widest">#1</div>
              </div>
              {/* Podium Base */}
              <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-amber-300 to-transparent -z-10 opacity-20 rounded-t-xl" />
            </motion.div>
          )}

          {/* Rank 3 */}
          {rank3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center relative z-10 w-28 md:w-36 pb-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-orange-200 to-orange-50 p-1 shadow-lg border border-orange-200 relative mb-4">
                <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center font-black text-xl text-orange-600 overflow-hidden shadow-inner">
                  {getInitials(rank3.name)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center shadow-md">
                   <span className="text-[14px]">🥉</span>
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 text-center w-full relative z-20">
                <div className="font-bold text-[13px] text-slate-900 truncate">{rank3.name.split(' ')[0]}</div>
                <div className="font-black text-[15px] text-slate-700 mt-0.5">{rank3.points}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">#3</div>
              </div>
              {/* Podium Base */}
              <div className="absolute bottom-0 w-full h-1 bg-gradient-to-t from-orange-300 to-transparent -z-10 opacity-30 rounded-t-xl" />
            </motion.div>
          )}
        </div>

        {/* ── Main Table ── */}
        <div className="w-full bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-8 relative">
           <div className="overflow-x-auto pb-16"> {/* Padding for sticky footer */}
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[240px]">Student</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">LeetCode</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Codeforces</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CodeChef</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">GFG</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Streak</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody 
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-slate-50"
                  >
                    {loadingLeaders ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">Loading leaderboard...</td>
                      </tr>
                    ) : currentLeadersList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">No developers found.</td>
                      </tr>
                    ) : currentLeadersList.map((l) => {
                      const displayRank = l.rank;
                      return (
                      <tr 
                        key={l.rank}
                        className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(l)}
                      >
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-500 font-bold text-[12px] mx-auto">
                             {displayRank}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shadow-inner shrink-0 overflow-hidden ${
                              l.level === 'Diamond' ? 'bg-blue-100 text-blue-700' :
                              l.level === 'Platinum' ? 'bg-slate-200 text-slate-700' :
                              l.level === 'Gold' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {l.avatar ? (
                                <img src={l.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                getInitials(l.name)
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[14px] text-slate-900">{l.name}</span>
                                {l.usn && (
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                    {l.usn}
                                  </span>
                                )}
                              </div>
                              <span className="text-[12px] text-slate-400 font-medium">{l.college !== 'Unknown' ? l.college : l.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-[14px] text-brand-primary tabular-nums">{l.points.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingLeetcode ? <span className="animate-pulse">...</span> : l.liveLeetcode !== undefined ? l.liveLeetcode : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingCodeforces ? <span className="animate-pulse">...</span> : l.liveCodeforces !== undefined ? l.liveCodeforces : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingGfg ? <span className="animate-pulse">...</span> : l.liveGfg !== undefined ? l.liveGfg : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">-</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 w-full">
                            <span className="text-[12px]">🔥</span>
                            <span className="font-bold text-[12px] text-rose-600 tabular-nums">{l.streak}d</span>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </motion.tbody>
                </AnimatePresence>
              </table>
           </div>

           {/* ── Sticky "You" Footer ── */}
           <div className="absolute bottom-0 left-0 w-full bg-indigo-50/90 backdrop-blur-md border-t border-indigo-100 py-3 px-6 flex items-center justify-between z-30">
              <div className="flex items-center gap-4">
                 <div className="px-3 py-1 bg-indigo-200 text-indigo-700 font-black text-[11px] uppercase tracking-widest rounded-full">
                   You
                 </div>
                 <div className="text-[14px] font-medium text-slate-600">
                    Rank <span className="font-black text-brand-primary">#1184</span>
                 </div>
                 <div className="text-[14px] font-medium text-slate-600">
                    Score <span className="font-black text-brand-primary">1482</span>
                 </div>
              </div>
              <button className="px-5 py-2 border border-brand-primary/30 text-brand-primary font-bold text-[13px] rounded-full hover:bg-brand-primary hover:text-white transition-colors bg-white">
                 Jump to my rank →
              </button>
           </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium pb-8">
           <div className="flex items-center gap-3">
              <span>Rows</span>
              <div className="flex gap-1.5">
                 {[25, 50, 100, 'All'].map(r => (
                   <button 
                     key={r} 
                     onClick={() => { setItemsPerPage(r as any); setCurrentPage(1); }}
                     className={`px-2 py-1 rounded border text-[12px] ${itemsPerPage === r ? 'border-brand-primary text-brand-primary bg-brand-primary/5 font-bold' : 'border-slate-200 hover:bg-slate-50 font-medium'}`}>
                     {r}
                   </button>
                 ))}
              </div>
              <span className="ml-4 text-[13px]">
                {totalItems === 0 ? '0-0 of 0' : `${itemsPerPage === 'All' ? 1 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(itemsPerPage === 'All' ? totalItems : currentPage * itemsPerPage, totalItems)} of ${totalItems}`}
              </span>
           </div>

           <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>
                <ChevronLeft size={16} />
              </button>
              
              {(() => {
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    pages.push(
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i)}
                        className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === i ? 'border-brand-primary bg-brand-primary text-white font-bold' : 'border-slate-200 hover:bg-slate-50 font-bold text-slate-700'} text-[13px]`}>
                        {i}
                      </button>
                    );
                  } else if (i === currentPage - 2 || i === currentPage + 2) {
                    pages.push(<span key={i} className="px-1 text-slate-400">...</span>);
                  }
                }
                return pages;
              })()}

              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p+1)}>
                <ChevronRight size={16} />
              </button>
           </div>
        </div>

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
