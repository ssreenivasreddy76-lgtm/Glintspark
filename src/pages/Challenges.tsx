import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Code2, Zap, CheckCircle2, ChevronRight, Star, Hexagon, Globe, ArrowRight, AlertCircle, ArrowLeft, Terminal, Cpu, Database, Braces, X } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';
import { useAuth } from '../contexts/AuthContext';

export default function Challenges() {
  const navigate = useNavigate();
  const { topic } = useParams<{ topic?: string }>();
  const [solvedSubmissions, setSolvedSubmissions] = useState<{challengeId: string, language: string}[]>([]);
  const [realRank, setRealRank] = useState<number | null>(null);
  const [challengeStats, setChallengeStats] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const { tracks: practiceTracks, challenges: allChallenges } = useChallenges();

  useEffect(() => {
    if (user) {
      firebaseDB.getUserProgress(user._id).then(progress => {
        if (progress.bookmarks) setBookmarkedIds(progress.bookmarks);
      });
    }
  }, [user]);

  const toggleBookmark = async (id: string) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      if (user) {
        firebaseDB.updateUserProgress(user._id, { bookmarks: next });
      }
      return next;
    });
  };

  const [userProgress, setUserProgress] = useState<any>({});

  useEffect(() => {
    async function fetchSolved() {
      try {
        const stats = await supabaseDB.getGlobalChallengeStats();
        setChallengeStats(stats);
      } catch (err) {
        console.error("Failed to load global challenge stats", err);
      }

      if (user) {
        try {
          const dbSolved = await supabaseDB.getUserSubmissions(user._id);
          if (dbSolved) {
            setSolvedSubmissions(dbSolved.filter((d: any) => d.status === 'PASS').map((d: any) => ({ challengeId: d.challengeId, language: d.language || '' })));
          }
          const rank = await supabaseDB.getUserRank(user.xp || 0);
          setRealRank(rank);
          
          firebaseDB.getUserProgress(user._id).then(progress => {
            if (progress) setUserProgress(progress);
          });
        } catch (err) {
          console.error("Failed to load solved status from Supabase:", err);
        }
      }
    }
    fetchSolved();
  }, [user]);

  // Find active track details
  const activeTrack = practiceTracks.find(t => t.id === topic);

  // If track not found, redirect to catalog
  useEffect(() => {
    if (practiceTracks.length > 0 && !activeTrack) {
      navigate('/practice', { replace: true });
    }
  }, [activeTrack, practiceTracks, navigate]);
  const challenges = activeTrack 
    ? allChallenges
        .filter(c => c.isPractice === false)
        .filter(c => (
          (c.allowedLanguages && Array.isArray(c.allowedLanguages) && c.allowedLanguages.includes(activeTrack.id)) ||
          (!c.allowedLanguages && c.track === 'custom') ||
          (c.tracks && Array.isArray(c.tracks) && c.tracks.includes(activeTrack.id)) || 
          c.track === activeTrack.id
        ))
        .map((c, idx) => ({ ...c, originalIndex: idx + 1, status: solvedSubmissions.some(s => s.challengeId === c.id && (!s.language || s.language.replace(/[^a-zA-Z+#]/g, '').toLowerCase() === activeTrack.name.replace(/[^a-zA-Z+#]/g, '').toLowerCase())) ? 'Solved' : 'Open' })) 
    : [];

  // STAR LOGIC CALCULATION for active topic
  const basePoints = challenges.filter(c => c.status === 'Solved').reduce((sum, c) => sum + c.points, 0);
  const totalPoints = basePoints - (userProgress.penalties || 0);

  const getStarLevel = (points: number) => {
    if (points >= 2000) return { level: 6, next: null, current: points };
    if (points >= 1000) return { level: 5, next: 2000, current: points };
    if (points >= 500) return { level: 4, next: 1000, current: points };
    if (points >= 250) return { level: 3, next: 500, current: points };
    if (points >= 100) return { level: 2, next: 250, current: points };
    if (points >= 30) return { level: 1, next: 100, current: points };
    return { level: 0, next: 30, current: points };
  };

  const starData = getStarLevel(totalPoints);

  const getBadgeTierStyles = (level: number) => {
    switch (level) {
      case 1:
      case 2:
        return { badgeFill: 'fill-[#f8fafc]', badgeStroke: 'text-[#cbd5e1]', starColor: 'text-[#94a3b8] fill-[#94a3b8]' };
      case 3:
      case 4:
        return { badgeFill: 'fill-[#fefce8]', badgeStroke: 'text-[#fde047]', starColor: 'text-[#eab308] fill-[#eab308]' };
      case 5:
        return { badgeFill: 'fill-[#f0fdfa]', badgeStroke: 'text-[#a5f3fc]', starColor: 'text-[#06b6d4] fill-[#06b6d4]' };
      case 6:
        return { badgeFill: 'fill-[#fef2f2]', badgeStroke: 'text-[#fecaca]', starColor: 'text-[#ef4444] fill-[#ef4444]' };
      default:
        return { badgeFill: 'fill-[#f3f7f7]', badgeStroke: 'text-[#e2e8f0]', starColor: 'text-[#64748b] fill-[#64748b]' };
    }
  };

  const badgeStyles = getBadgeTierStyles(starData.level);

  const handleChallengeClick = (id: string) => {
    navigate(`/challenges/${id}`);
  };

  // --- STATE FOR FILTERS (Detail view) ---
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const mapCategory = (rawCat: string | undefined) => {
    if (!rawCat) return '';
    const cat = rawCat.toLowerCase();
    if (cat.includes('condition') || cat.includes('loop')) return 'Conditionals and Loops';
    if (cat.includes('array') || cat.includes('string')) return 'Arrays and Strings';
    if (cat.includes('intro') || cat.includes('basic')) return 'Introduction';
    if (cat.includes('function')) return 'Functions';
    if (cat.includes('struct') || cat.includes('enum')) return 'Structs and Enums';
    if (cat.includes('number')) return 'Number Logic';
    return rawCat;
  };

  const mappedChallenges = challenges.map(c => ({ ...c, category: mapCategory(c.category) }));
  const mappedAllChallenges = allChallenges.map(c => ({ ...c, category: mapCategory(c.category) }));

  const filteredChallenges = mappedChallenges.filter(c => {
    if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(c.difficulty)) return false;
    if (selectedStatus.length > 0 && !selectedStatus.includes(c.status)) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(c.category)) return false;
    if (selectedTopics.length > 0 && !(c.topics || []).some(t => selectedTopics.includes(t))) return false;
    return true;
  });

  const ORDER_PREF = [
    'introduction', 
    'conditionals and loops', 
    'number logic',
    'arrays and strings', 
    'functions', 
    'structs and enums'
  ];
  
  const sortSubdomains = (a: string, b: string) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    let indexA = ORDER_PREF.findIndex(p => aLower.includes(p));
    let indexB = ORDER_PREF.findIndex(p => bLower.includes(p));
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    if (indexA !== indexB) return indexA - indexB;
    return a.localeCompare(b);
  };

  const uniqueCategories = Array.from(new Set(mappedChallenges.map(c => c.category))).filter(Boolean).sort(sortSubdomains);
  const uniqueTopics = Array.from(new Set(mappedChallenges.flatMap(c => c.topics || []))).filter(Boolean);


  if (!activeTrack) return null;
  return (
    <div className="bg-[#f3f7f7] min-h-screen">
      
      {/* Dynamic star badge & progress header */}
      <div className="bg-white border-b border-slate-200 pt-4 shadow-sm relative z-20">
         <div className="max-w-7xl mx-auto px-8 relative">
            
            {/* Breadcrumbs */}
             <div className="flex items-center gap-2 text-[15px] font-medium text-[#738f93] mb-1 leading-none uppercase tracking-wide">
               <span onClick={() => navigate('/dashboard') } className="hover:text-brand-primary cursor-pointer transition">Home</span>
               <ChevronRight size={14} className="opacity-40" />
               <span onClick={() => navigate('/dashboard')} className="hover:text-brand-primary cursor-pointer transition">Challenges</span>
               <ChevronRight size={14} className="opacity-40" />
               <span className="font-bold text-slate-800">{activeTrack.name}</span>
             </div>
 
             <div className="flex flex-col md:flex-row items-end justify-between pb-4">
                
                <div className="flex flex-col items-start gap-2">
                   <h1 className="text-[32px] font-bold text-[#1e2330] tracking-tight leading-none capitalize">
                      {activeTrack.name} Challenges
                   </h1>
                </div>

                {/* Right Layer: Gamification System (Without Rank) */}
                <div className="flex items-center gap-8 text-left">
                   <div className="flex flex-col w-[340px]">
                      <div className="text-[18px] text-[#39424e] mb-2.5 font-medium tracking-tight text-left">
                         {starData.level === 6 ? (
                            'All Stars Earned!'
                         ) : (
                            <>
                               <span className="text-[#c88d5e]">{starData.next! - starData.current} more points</span> to get your {starData.level === 0 ? 'first' : 'next'} star!
                            </>
                         )}
                      </div>
                      
                      <div className="w-full h-2.5 border border-[#c2c7d0] rounded-full overflow-hidden bg-white mb-2.5">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: starData.level === 6 ? '100%' : `${(starData.current / starData.next!) * 100}%` }} 
                           className="h-full bg-[#0e141e] rounded-full" 
                         />
                      </div>
 
                      <div className="flex items-center justify-between text-[15px] text-[#5c6e7a]">
                         <div>
                            Points: <span className="font-bold text-[#39424e]">{starData.current}/{starData.next || 'MAX'}</span>
                         </div>
                         <AlertCircle onClick={() => navigate('/scoring-rules')} size={20} className="text-[#738f93] fill-[#738f93]/20 hover:text-[#5c6e7a] cursor-pointer transition-colors" />
                      </div>
                   </div>
 
                   <div className="relative flex items-center justify-center shrink-0 drop-shadow-sm transition-colors duration-500">
                      <Hexagon 
                         size={90} 
                         strokeWidth={1}
                         className={`transition-colors duration-500 ${badgeStyles.badgeStroke} ${badgeStyles.badgeFill}`} 
                         style={{ transform: 'rotate(90deg)' }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <div className="w-7 h-7 mb-1 mt-0.5 flex items-center justify-center">
                            <img src={activeTrack.icon} alt={activeTrack.name} className="w-full h-full object-contain" />
                         </div>
                         <span className="text-[9px] font-bold text-[#39424e] capitalize tracking-wide max-w-[60px] text-center leading-tight mb-0.5">
                            {activeTrack.initials}
                         </span>
                         <div className="flex items-center justify-center gap-[0.5px]">
                            {Array.from({ length: starData.level }).map((_, i) => (
                               <Star key={i} size={6} className={`${badgeStyles.starColor} transition-colors duration-500 drop-shadow-sm`} />
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
 
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR (FILTERS) --- */}
        <aside className="w-full lg:w-64 space-y-10 lg:sticky lg:top-8 self-start overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-hide">

           {/* Status Filter */}
           <div className="space-y-4">
              <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Status</h4>
              <div className="space-y-2">
                 {["Solved", "Open"].map(status => {
                   const isChecked = selectedStatus.includes(status);
                   return (
                     <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedStatus(prev => 
                              isChecked ? prev.filter(s => s !== status) : [...prev, status]
                            );
                          }}
                          className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-brand-primary transition-colors text-brand-primary focus:ring-0" 
                        />
                        <span className="text-[15px] font-semibold text-slate-700">{status === 'Open' ? 'Unsolved' : 'Solved'}</span>
                     </label>
                   );
                 })}
              </div>
           </div>

           {/* Difficulty Filter */}
           <div className="space-y-4">
              <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Difficulty</h4>
              <div className="space-y-2">
                 {["Easy", "Medium", "Hard"].map(diff => {
                   const isChecked = selectedDifficulty.includes(diff);
                   return (
                     <label key={diff} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedDifficulty(prev => 
                              isChecked ? prev.filter(d => d !== diff) : [...prev, diff]
                            );
                          }}
                          className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-brand-primary transition-colors text-brand-primary focus:ring-0" 
                        />
                        <span className="text-[15px] font-semibold text-slate-700">{diff}</span>
                     </label>
                   );
                 })}
              </div>
           </div>

           {/* Subdomains Filter */}
           <div className="space-y-4">
              <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Subdomains</h4>
              <div className="space-y-2">
                 {uniqueCategories.map(cat => {
                   const isChecked = selectedCategories.includes(cat);
                   return (
                     <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              isChecked ? prev.filter(c => c !== cat) : [...prev, cat]
                            );
                          }}
                          className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-brand-primary transition-colors text-brand-primary focus:ring-0" 
                        />
                        <span className="text-[15px] font-semibold text-slate-700">{cat}</span>
                     </label>
                   );
                 })}
              </div>
           </div>

           {/* Topics Filter */}
           {uniqueTopics.length > 0 && (
             <div className="space-y-4">
                <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Topics</h4>
                <div className="space-y-2">
                   {uniqueTopics.map(topic => {
                     const isChecked = selectedTopics.includes(topic);
                     return (
                       <label key={topic} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedTopics(prev => 
                                isChecked ? prev.filter(t => t !== topic) : [...prev, topic]
                              );
                            }}
                            className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-brand-primary transition-colors text-brand-primary focus:ring-0" 
                          />
                          <span className="text-[15px] font-semibold text-slate-700">{topic}</span>
                       </label>
                     );
                   })}
                </div>
             </div>
           )}
        </aside>

        {/* --- MAIN CHALLENGE AREA --- */}
        <div className="flex-1 space-y-8">
           
           {/* Full Width Warning Banner or Lock Message */}
           {userProgress.proctorLockUntil && Date.now() < userProgress.proctorLockUntil ? (
              <div className="flex items-start md:items-center gap-2 px-4 py-3 bg-red-100 border border-red-300 rounded-lg w-full shadow-sm">
                 <AlertCircle size={18} className="text-red-700 shrink-0 mt-0.5 md:mt-0" />
                 <span className="text-[13px] font-bold text-red-900 leading-relaxed">
                    ACCOUNT LOCKED: You have violated the proctoring rules multiple times. You are locked out of solving challenges until {new Date(userProgress.proctorLockUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.
                 </span>
              </div>
           ) : (
              <div className="flex items-start md:items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg w-full shadow-sm">
                 <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5 md:mt-0" />
                 <span className="text-[13px] font-bold text-rose-800 leading-relaxed">
                    Important: Switching tabs or using a mobile device (camera detection) during a challenge will result in a 5-point deduction! After 2 violations, you will be locked out for 1 hour and unable to solve any challenges.
                 </span>
              </div>
           )}

           {/* CHALLENGES HEADER */}
           <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">Challenges</h2>
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{filteredChallenges.length} Results</span>
            </div>

            {/* CHALLENGE CARDS LIST */}
            <div className="space-y-4">
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((prob, i) => {
                  const isSolved = prob.status === 'Solved' || solvedSubmissions.some(s => s.challengeId === prob.id && (!s.language || activeTrack && s.language.toLowerCase() === activeTrack.name.toLowerCase()));
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={prob.id}
                      className="bg-white border border-slate-300 rounded-[4px] hover:border-slate-800 transition-all group flex flex-col md:flex-row justify-between items-center gap-6 px-8 py-6 relative overflow-hidden"
                    >
                       <div className="flex-1 space-y-2 text-left">
                          <h3 
                            onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: true } })}
                            className="text-[20px] font-medium text-[#1e2330] cursor-pointer"
                          >
                            {prob.title}
                          </h3>
                          <div className="text-[14px] text-slate-500">
                            <span className={prob.difficulty === 'Easy' ? 'text-[#1ba94c]' : prob.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-600'}>
                              {prob.difficulty}
                            </span>
                            , {prob.category}, Max Score: {prob.points}, Success Rate: {challengeStats[prob.id] || '0%'}
                          </div>
                       </div>

                       <div className="flex items-center gap-6 text-slate-300 shrink-0">
                          <Star 
                             size={24} 
                             onClick={(e) => { e.stopPropagation(); toggleBookmark(prob.id); }}
                             className={`cursor-pointer transition ${bookmarkedIds.includes(prob.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-current hover:text-amber-400'}`} 
                          />
                          {isSolved ? (
                            <button
                              onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: true } })}
                              className="flex items-center gap-2 bg-[#0e141e] hover:bg-[#1e2736] text-white font-black text-[11px] uppercase tracking-widest min-w-[160px] justify-center rounded-[4px] px-7 py-2.5 transition active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 size={15} className="text-white" /> Solved
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: true } })}
                              className="px-6 py-2.5 bg-[#4f46e5] text-white rounded-md text-[15px] hover:bg-[#3730a3] transition active:scale-95 min-w-[160px]"
                            >
                               Solve Challenge
                            </button>
                          )}
                       </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
                  <p className="text-lg font-bold">No challenges match your selected filters.</p>
                  <p className="text-sm">Try clearing your filters to see all available challenges.</p>
                </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
