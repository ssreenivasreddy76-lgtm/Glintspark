import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Medal, Star, Target, Crown, Award, Zap, ChevronLeft, ChevronRight, LayoutDashboard, Settings, ArrowUpDown, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../services/supabaseService';


export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'monthly' | 'my-score' | 'batch-wise'>('global');

  
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
          baseXp: u.xp || 0,
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
          codechefHandle: u.codechef || null,
          hackerrankHandle: u.hackerrank || null,
          gfgHandle: u.gfg || null,
          liveLeetcode: undefined,
          liveCodeforces: undefined,
          liveCodechef: undefined,
          liveHackerrank: undefined,
          liveGfg: undefined,
          isFetchingLeetcode: !!u.leetcode,
          isFetchingCodeforces: !!u.codeforces,
          isFetchingCodechef: !!u.codechef,
          isFetchingHackerrank: !!u.hackerrank,
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
                const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-leetcode?handle=${encodeURIComponent(handle)}`);
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
                const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-codeforces?handle=${encodeURIComponent(handle)}`);
                const data = await res.json();
                if (data.status === 'success' || data.status === 'OK') {
                   const rating = data.result?.[0]?.rating || data.rating;
                   if (rating) liveFetched[i].liveCodeforces = rating;
                }
             } catch (e) { console.error('Codeforces fetch error', e) }
             finally { liveFetched[i].isFetchingCodeforces = false; hasUpdates = true; }
           }
           if (u.codechefHandle) {
             try {
                const handle = u.codechefHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-codechef?handle=${encodeURIComponent(handle)}`);
                const data = await res.json();
                if (!data.error) {
                   liveFetched[i].liveCodechef = data.rating;
                }
             } catch (e) { console.error('CodeChef fetch error', e) }
             finally { liveFetched[i].isFetchingCodechef = false; hasUpdates = true; }
           }
           if (u.hackerrankHandle) {
             try {
                const handle = u.hackerrankHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-hackerrank?handle=${encodeURIComponent(handle)}`);
                const data = await res.json();
                if (!data.error) {
                   liveFetched[i].liveHackerrank = data.totalSolved;
                }
             } catch (e) { console.error('HackerRank fetch error', e) }
             finally { liveFetched[i].isFetchingHackerrank = false; hasUpdates = true; }
           }
           if (u.gfgHandle) {
             try {
                const handle = u.gfgHandle.trim().replace(/^@/, '');
                if (!handle) throw new Error('Empty handle');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-gfg?handle=${encodeURIComponent(handle)}`, { signal: controller.signal });
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

  const getSkillRank = (score: number) => {
    if (score >= 1100) return '★ Legend';
    if (score >= 950) return '✧ Master';
    if (score >= 850) return '⬟ Veteran';
    if (score >= 700) return '✪ Elite';
    if (score >= 550) return '✦ Specialist';
    if (score >= 400) return '⬡ Expert';
    if (score >= 300) return '⬢ Adept';
    if (score >= 200) return '◆ Practitioner';
    if (score >= 100) return '◈ Apprentice';
    return '◎ Beginner';
  };

  const getFilteredLeaders = () => {
    let currentLeaders = realLeaders.map(l => {
      // Calculate Dynamic Glint Score based on weighted metrics
      // 1000 per platform limit
      const lcBase = Math.min((l.liveLeetcode || 0) * 1.5, 1000); 
      const gfgBase = Math.min((l.liveGfg || 0) * 1.5, 1000); 
      const ccBase = Math.max(0, Math.min(((l.liveCodechef || 0) - 800) * 1.5, 1000)); 
      const cfBase = Math.max(0, Math.min(((l.liveCodeforces || 0) - 800) * 1.5, 1000));
      const gsBase = Math.min((l.baseXp || 0) * 0.1, 1000);

      const weightedScore = (lcBase * 0.2) + (gfgBase * 0.2) + (gsBase * 0.2) + (ccBase * 0.2) + (cfBase * 0.2);
      const streakMultiplier = Math.min((l.streak || 0) * 0.005, 0.20);
      
      const finalScore = Math.floor(weightedScore * (1 + streakMultiplier));

      return { 
        ...l, 
        points: finalScore,
        level: getSkillRank(finalScore)
      };
    });

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
      if (selectedPlatform === 'CodeChef') currentLeaders = currentLeaders.filter(l => l.codechefHandle);
      if (selectedPlatform === 'HackerRank') currentLeaders = currentLeaders.filter(l => l.hackerrankHandle);
      if (selectedPlatform === 'GFG') currentLeaders = currentLeaders.filter(l => l.gfgHandle);
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

  const currentUserData = filteredLeaders.find(l => l.email === user?.email);
  const currentUserRank = currentUserData ? currentUserData.rank : '-';
  const currentUserScore = currentUserData ? currentUserData.points : '-';

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* --- HEADER & FILTERS CARD --- */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                   Leaderboard
                   <div className="relative group flex items-center">
                     <button className="text-slate-400 hover:text-brand-primary transition-colors cursor-help">
                       <Info size={20} strokeWidth={2.5} />
                     </button>
                     {/* Tooltip */}
                     <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none border border-slate-700">
                        <h4 className="font-bold text-[13px] mb-1 text-white">Aggregate Score</h4>
                        <p className="text-slate-300 mb-3">Weighted score (0-1000 per platform) + streak bonus. Your score can only go up.</p>
                        <ul className="space-y-1.5 text-slate-300 font-medium">
                          <li className="flex justify-between"><span>LeetCode</span> <span className="text-white font-bold">20%</span></li>
                          <li className="flex justify-between"><span>GFG</span> <span className="text-white font-bold">20%</span></li>
                          <li className="flex justify-between"><span>GlintSpark</span> <span className="text-white font-bold">20%</span></li>
                          <li className="flex justify-between"><span>CodeChef</span> <span className="text-white font-bold">20%</span></li>
                          <li className="flex justify-between"><span>Codeforces</span> <span className="text-white font-bold">20%</span></li>
                          <li className="flex justify-between"><span>HackerRank</span> <span className="text-white font-bold text-[10px]">Tracked, not scored</span></li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-slate-700 text-amber-400 font-bold flex items-center gap-1.5">
                          🔥 Streak Bonus: Up to +20% extra (+0.5% per active day)
                        </div>
                     </div>
                   </div>
                 </h2>
                 <p className="text-slate-500 font-medium text-sm mt-1">Top performers across the platform</p>
               </div>
             </div>
             
             {/* Tabs */}
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('global')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Glint Score</button>
                <button onClick={() => setActiveTab('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>This Week</button>
             </div>
           </div>

           <div className="flex flex-wrap items-center gap-3">
             <div className="relative group flex-1 md:flex-none min-w-[220px]">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
               </div>
               <input
                 type="text"
                 placeholder="Search developers..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
               />
             </div>
             
             <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className="bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-8 cursor-pointer shadow-sm transition-all h-[38px] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_.7rem_top_50%] bg-[length:.65rem_auto]">
               <option value="All Colleges">College</option>
               {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             
             <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-8 cursor-pointer shadow-sm transition-all h-[38px] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_.7rem_top_50%] bg-[length:.65rem_auto]">
               <option value="All Branches">Branch</option>
               {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
             </select>

             <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-8 cursor-pointer shadow-sm transition-all h-[38px] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_.7rem_top_50%] bg-[length:.65rem_auto]">
               <option value="All Batches">Batch</option>
               {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
             </select>



             <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

             <div className="flex items-center gap-2">
                 <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-8 cursor-pointer shadow-sm transition-all h-[38px] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_.7rem_top_50%] bg-[length:.65rem_auto]">
                   <option value="Total Score">Sort: Score</option>
                   <option value="Streak">Sort: Streak</option>
                 </select>
                 <button onClick={() => setSortDirection(prev => prev === 'High - Low' ? 'Low - High' : 'High - Low')} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 border border-slate-200 hover:text-slate-900 transition-colors h-[38px] w-[38px] flex items-center justify-center bg-white shadow-sm">
                    <ArrowUpDown size={16} />
                 </button>
             </div>
           </div>
           
           <div className="mt-6 flex flex-wrap items-center gap-2">
             {['All', 'GlintSpark', 'LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GFG'].map(plat => (
                <button key={plat} onClick={() => setSelectedPlatform(plat)} className={`px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors border ${selectedPlatform === plat ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  {plat}
                </button>
             ))}
           </div>
        </div>

        {/* ── Main Table ── */}
        <div className="w-full bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-8 relative">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[240px]">Student</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">GlintSpark</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">LeetCode</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Codeforces</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CodeChef</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">HackerRank</th>
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
                        <td colSpan={9} className="py-12 text-center text-slate-400">Loading leaderboard...</td>
                      </tr>
                    ) : currentLeadersList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">No developers found.</td>
                      </tr>
                    ) : currentLeadersList.map((l) => {
                      const displayRank = l.rank;
                      return (
                      <tr 
                        key={l.rank}
                        className="group hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-500 font-bold text-[13px] mx-auto group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100">
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
                              </div>
                              <span className="text-[12px] text-slate-400 font-medium">
                                {l.usn ? l.usn : l.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-[14px] text-slate-900 tabular-nums">{l.points.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.baseXp.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingLeetcode ? <span className="animate-pulse">...</span> : l.liveLeetcode !== undefined ? l.liveLeetcode : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingCodeforces ? <span className="animate-pulse">...</span> : l.liveCodeforces !== undefined ? l.liveCodeforces : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingCodechef ? <span className="animate-pulse">...</span> : l.liveCodechef !== undefined ? l.liveCodechef : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingHackerrank ? <span className="animate-pulse">...</span> : l.liveHackerrank !== undefined ? l.liveHackerrank : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium tabular-nums">
                          {l.isFetchingGfg ? <span className="animate-pulse">...</span> : l.liveGfg !== undefined ? l.liveGfg : '-'}
                        </td>
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

           {/* ── "You" Footer ── */}
           <div className="w-full bg-slate-50/80 border-t border-slate-100 py-4 px-8 flex items-center justify-between rounded-b-3xl">
              <div className="flex items-center gap-6">
                 <div className="px-4 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 font-black text-[12px] uppercase tracking-widest rounded-full shadow-sm">
                   You
                 </div>
                 <div className="text-[15px] font-medium text-slate-500">
                    Rank <span className="font-black text-slate-900 ml-1">{currentUserRank !== '-' ? `#${currentUserRank}` : '-'}</span>
                 </div>
                 <div className="text-[15px] font-medium text-slate-500">
                    Score <span className="font-black text-slate-900 ml-1">{currentUserScore}</span>
                 </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white font-bold text-[13px] rounded-xl hover:bg-slate-800 transition-all shadow-sm">
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
                     className={`px-2 py-1 rounded border text-[12px] ${itemsPerPage === r ? 'border-slate-900 text-slate-900 bg-slate-50 font-bold' : 'border-slate-200 hover:bg-slate-50 font-medium'}`}>
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
                         className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === i ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200 hover:bg-slate-50 font-bold text-slate-700'} text-[13px]`}>
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


    </div>
  );
}
