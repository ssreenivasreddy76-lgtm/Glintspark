import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Layers, CheckCircle2, Check, Star, Play, Terminal, Sparkles, ChevronRight, Users } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';
import { useAuth } from '../contexts/AuthContext';

export default function PracticeMaster() {
  const navigate = useNavigate();
  const [solvedSubmissions, setSolvedSubmissions] = useState<{challengeId: string, language: string}[]>([]);
  const [realRank, setRealRank] = useState<number | null>(null);
  const [challengeStats, setChallengeStats] = useState<Record<string, { accuracy: string, total: number }>>({});
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

  const toggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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
            setSolvedSubmissions(dbSolved.filter((d: any) => d.status === 'PASS').map((d: any) => ({ challengeId: d.challengeId, language: d.language || '' })));
          }
          const rank = await supabaseDB.getUserRank(user.xp || 0);
          setRealRank(rank);
        } catch (err) {
          console.error("Failed to load solved status from Supabase:", err);
        }
      }
    }
    fetchSolved();
  }, [user]);

  const practiceChallenges = allChallenges.filter(c => c.isPractice !== false);
  const challenges = practiceChallenges.map((c, idx) => ({ ...c, originalIndex: idx + 1, status: solvedSubmissions.some(s => s.challengeId === c.id) ? 'Solved' : 'Open' }));

  const handleChallengeClick = (id: string) => {
    navigate(`/challenges/${id}`);
  };

  // --- STATE FOR FILTERS (Detail view) ---
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Oldest');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const filteredChallenges = challenges.filter(c => {
    // Search Query
    if (searchQuery.trim() !== '' && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Bookmark
    if (showBookmarkedOnly && !bookmarkedIds.includes(c.id)) return false;

    if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(c.difficulty)) return false;
    if (selectedStatus.length > 0 && !selectedStatus.includes(c.status)) return false;
    if (selectedTopic.length > 0 && !(c.topics || []).some(t => selectedTopic.includes(t))) return false;
    if (selectedCompany.length > 0 && !(c.companies || []).some(comp => selectedCompany.includes(comp))) return false;
    return true;
  });

  const difficultyRank = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortBy === 'Difficulty (Asc)') return (difficultyRank[a.difficulty as keyof typeof difficultyRank] || 0) - (difficultyRank[b.difficulty as keyof typeof difficultyRank] || 0);
    if (sortBy === 'Difficulty (Desc)') return (difficultyRank[b.difficulty as keyof typeof difficultyRank] || 0) - (difficultyRank[a.difficulty as keyof typeof difficultyRank] || 0);
    if (sortBy === 'Newest') return b.originalIndex - a.originalIndex;
    if (sortBy === 'Oldest') return a.originalIndex - b.originalIndex;
    return 0;
  });

  const dynamicTopics = Array.from(new Set(challenges.flatMap(c => c.topics || []))).filter(Boolean);
  const uniqueTopics = dynamicTopics.length > 0 ? dynamicTopics : ['Arrays', 'Strings', 'Math', 'Trees'];
  
  const dynamicCompanies = Array.from(new Set(challenges.flatMap(c => c.companies || []))).filter(Boolean);
  const uniqueCompanies = dynamicCompanies.length > 0 ? dynamicCompanies : ['Google', 'Amazon', 'Microsoft', 'Meta'];

  const toggleFilter = (setState: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setState(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* --- HEADER & FILTERS CARD --- */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Practice</h2>
            <div className="bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-200">
              {solvedSubmissions.length} OF {challenges.length} SOLVED
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group flex-1 md:flex-none min-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
              />
            </div>
            
            <MultiSelectDropdown label="Topic" options={uniqueTopics} selected={selectedTopic} onChange={(val) => toggleFilter(setSelectedTopic, val)} />
            <MultiSelectDropdown label="Difficulty" options={['Easy', 'Medium', 'Hard']} selected={selectedDifficulty} onChange={(val) => toggleFilter(setSelectedDifficulty, val)} />
            <MultiSelectDropdown label="Company" options={uniqueCompanies} selected={selectedCompany} onChange={(val) => toggleFilter(setSelectedCompany, val)} />
            <MultiSelectDropdown label="Status" options={['Open', 'Solved']} selected={selectedStatus} onChange={(val) => toggleFilter(setSelectedStatus, val)} />
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none pr-8 cursor-pointer shadow-sm transition-all h-[38px]"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
            >
              <option value="Newest">Sort: Newest</option>
              <option value="Oldest">Sort: Oldest</option>
              <option value="Difficulty (Asc)">Difficulty (Asc)</option>
              <option value="Difficulty (Desc)">Difficulty (Desc)</option>
            </select>
          </div>
        </div>

        {sortedChallenges.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No challenges found</h3>
            <p className="text-slate-500">Try adjusting your filters to see more challenges.</p>
            <button 
              onClick={() => { setSelectedDifficulty([]); setSelectedStatus([]); setSelectedTopic([]); setSelectedCompany([]); setSearchQuery(''); setShowBookmarkedOnly(false); setSortBy('Newest'); }}
              className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-lg font-bold shadow-sm hover:bg-brand-secondary transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              {/* Table Header */}
              <div className="flex items-center px-6 py-3 border-b-2 border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="w-16 text-center">Status</div>
                <div className="flex-1 pl-4">Problem</div>
                <div className="w-32 text-center">Difficulty</div>
                <div className="w-32 text-center hidden md:block">Submissions</div>
                <div className="w-32 text-center hidden md:block">Accuracy</div>
                <div className="w-16"></div>
              </div>

              {/* Table Body */}
              <AnimatePresence>
                {sortedChallenges.map((challenge, idx) => {
                  const isSolved = challenge.status === 'Solved';
                  const isBookmarked = bookmarkedIds.includes(challenge.id);
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      key={challenge.id}
                      onClick={() => handleChallengeClick(challenge.id)}
                      className="flex items-center px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group last:border-b-0"
                    >
                      <div className="w-16 flex justify-center">
                        {isSolved ? (
                          <div className="w-[18px] h-[18px] rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                            <Check size={12} strokeWidth={4} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-slate-300 group-hover:border-slate-900 transition-colors"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pl-4 pr-4">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                          {challenge.title}
                        </h3>
                      </div>

                      <div className="w-32 flex justify-center">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest border ${challenge.difficulty === 'Easy' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : challenge.difficulty === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                          {challenge.difficulty}
                        </span>
                      </div>

                      <div className="w-32 text-center text-[13px] font-bold text-slate-500 hidden md:block flex items-center justify-center gap-1.5">
                        <Users size={14} className="inline-block text-slate-400 mr-1" />
                        {challengeStats[challenge.id]?.total || 0}
                      </div>

                      <div className="w-32 text-center text-[13px] font-bold text-slate-500 hidden md:block">
                        {challengeStats[challenge.id]?.accuracy || '0%'}
                      </div>

                      <div className="w-16 flex justify-end items-center gap-2">
                        <button 
                          onClick={(e) => toggleBookmark(e, challenge.id)}
                          className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100'}`}
                        >
                          <Star size={18} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MultiSelectDropdown({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = selected.length === 0 ? label : selected.length === 1 ? selected[0] : `${label} (${selected.length})`;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white border text-sm font-bold rounded-lg px-4 py-2 hover:border-slate-300 focus:outline-none transition-all flex items-center gap-2 h-[38px] ${selected.length > 0 ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-slate-200 text-slate-700'}`}
      >
        {displayLabel}
        <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {options.map(opt => {
            const isSelected = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 border-2 border-slate-300 rounded group-hover:border-brand-primary transition-colors text-brand-primary focus:ring-0"
                />
                <span className="text-[14px] font-semibold text-slate-700">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
