import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';
import { useAuth } from '../contexts/AuthContext';

export default function PracticeCatalog() {
  const navigate = useNavigate();
  const [solvedSubmissions, setSolvedSubmissions] = useState<{challengeId: string}[]>([]);
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
            setSolvedSubmissions(dbSolved.filter((d: any) => d.status === 'PASS').map((d: any) => ({ challengeId: d.challengeId })));
          }
        } catch (err) {
          console.error("Failed to load solved status from Supabase:", err);
        }
      }
    }
    fetchSolved();
  }, [user]);

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

  const mappedAllChallenges = allChallenges.map(c => ({ ...c, category: mapCategory(c.category) }));

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatus, setCatalogStatus] = useState<string[]>([]);
  const [catalogDifficulty, setCatalogDifficulty] = useState<string[]>([]);
  const [catalogSubdomains, setCatalogSubdomains] = useState<string[]>([]);

  const computedAllChallenges = mappedAllChallenges.map((c, idx) => {
    const track = practiceTracks.find(t => t.id === c.track);
    return { 
      ...c, 
      language: track?.name ?? c.track, 
      languageId: c.track, 
      languageIcon: track?.icon,
      originalIndex: idx + 1 
    };
  });

  const allSubdomains = Array.from(new Set(computedAllChallenges.map(c => c.category || 'Uncategorized'))).sort(sortSubdomains);

  const filteredAll = computedAllChallenges.filter(c => {
    const isSolved = solvedSubmissions.some(s => s.challengeId === c.id);
    const computedStatus = isSolved ? 'Solved' : 'Open';
    if (catalogSearch.trim()) {
      const query = catalogSearch.toLowerCase().trim();
      const matchesTitle = c.title.toLowerCase().includes(query);
      const matchesNumber = c.originalIndex.toString() === query || `${c.originalIndex}.`.includes(query);
      if (!matchesTitle && !matchesNumber) return false;
    }
    if (catalogStatus.length > 0 && !catalogStatus.includes(computedStatus)) return false;
    if (catalogDifficulty.length > 0 && !catalogDifficulty.includes(c.difficulty)) return false;
    if (catalogSubdomains.length > 0 && !catalogSubdomains.includes(c.category)) return false;
    return true;
  });

  const toggleFilter = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  return (
    <div className="bg-[#f3f7f7] min-h-screen">
      <div className="bg-white border-b border-slate-200 shadow-sm py-7">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0e141e]">Practice Challenges</h1>
            <p className="text-sm text-[#738f93] mt-1">Solve coding problems across languages and difficulty levels.</p>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              value={catalogSearch}
              onChange={e => setCatalogSearch(e.target.value)}
              placeholder="Search practice..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-56 shrink-0 space-y-8 lg:sticky lg:top-8 self-start overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-hide">
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status</h4>
            {['Solved', 'Open'].map(s => (
              <label key={s} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={catalogStatus.includes(s)} onChange={() => toggleFilter(catalogStatus, setCatalogStatus, s)}
                  className="w-4 h-4 border-2 border-slate-300 rounded text-brand-primary focus:ring-0" />
                <span className="text-[13px] font-semibold text-slate-700">{s === 'Open' ? 'Unsolved' : 'Solved'}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Difficulty</h4>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <label key={d} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={catalogDifficulty.includes(d)} onChange={() => toggleFilter(catalogDifficulty, setCatalogDifficulty, d)}
                  className="w-4 h-4 border-2 border-slate-300 rounded text-brand-primary focus:ring-0" />
                <span className="text-[13px] font-semibold text-slate-700">{d}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Subdomains</h4>
            {allSubdomains.map(sub => (
              <label key={sub} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={catalogSubdomains.includes(sub)} onChange={() => toggleFilter(catalogSubdomains, setCatalogSubdomains, sub)}
                  className="w-4 h-4 border-2 border-slate-300 rounded text-brand-primary focus:ring-0" />
                <span className="text-[13px] font-semibold text-slate-700">{sub}</span>
              </label>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{filteredAll.length} Results</span>
          </div>

          <div className="space-y-3">
            {filteredAll.length > 0 ? filteredAll.map((prob, i) => {
              const isSolved = solvedSubmissions.some(s => s.challengeId === prob.id);
              return (
                <motion.div
                  key={`${prob.languageId}-${prob.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white border border-slate-300 rounded-[4px] hover:border-slate-800 transition-all group flex flex-col md:flex-row justify-between items-center gap-6 px-8 py-6 relative overflow-hidden"
                >
                  <div className="flex-1 space-y-2 text-left">
                    <h3
                      onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: false } })}
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

                  <div className="flex items-center gap-5 shrink-0">
                    <Star 
                      size={18} 
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(prob.id); }}
                      className={`cursor-pointer transition ${bookmarkedIds.includes(prob.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} 
                    />
                    {isSolved ? (
                      <button
                        onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: false } })}
                        className="flex items-center gap-2 bg-[#0e141e] hover:bg-[#1e2736] text-white font-black text-[11px] uppercase tracking-widest min-w-[160px] justify-center rounded-[4px] px-7 py-2.5 transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 size={15} className="text-white" /> Solved
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/challenges/${prob.id}`, { state: { isProctored: false } })}
                        className="px-7 py-2.5 bg-brand-primary text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-brand-dark transition active:scale-95 min-w-[160px] text-center"
                      >
                        Solve Problem
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
                <AlertCircle size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-bold">No challenges match your filters.</p>
                <p className="text-sm mt-1">Try clearing some filters or search again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
