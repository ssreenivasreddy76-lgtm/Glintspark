import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowLeft, CheckCircle2, ChevronRight, Lock, Code2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';

// ── Countdown Hook ────────────────────────────────────────────
function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const diffColor: Record<string, string> = {
  Easy: 'text-emerald-600',
  Medium: 'text-amber-500',
  Hard: 'text-rose-600',
};

export default function ContestDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { challenges: challengePool } = useChallenges();
  const [contest, setContest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('challenges');
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const countdown = useCountdown(5085); // 01:24:45

  useEffect(() => {
    async function fetchSolved() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        try {
          const dbSolved = await firebaseDB.getUserSubmissions(userData.user.id);
          if (dbSolved) {
            setSolvedIds(dbSolved.map((d: any) => d.challengeId));
          }
        } catch (err) {
          console.error("Failed to load solved status from Firestore:", err);
        }
      }
    }
    fetchSolved();
  }, []);

  useEffect(() => {
    // 1. Try to find in localStorage (custom created contests)
    const stored = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
    const foundLocal = stored.find((c: any) => c.id.toString() === id);
    
    if (foundLocal) {
      if (!foundLocal.problems || foundLocal.problems.length === 0) {
        // Fallback for contests created before problems were saved
        foundLocal.problems = ['1d-arrays', 'the-pads', 'tree-preorder', 'matrix-script'];
      }
      setContest(foundLocal);
      return;
    }

    // 2. Otherwise it's a hardcoded default contest
    // We give it some mock problems from the pool
    setContest({
      id,
      title: `Contest ${id}`,
      type: 'Rated',
      date: 'Tomorrow, 8:00 PM',
      participants: '12,402',
      prize: '300 Glintos',
      problems: ['1d-arrays', 'the-pads', 'tree-preorder', 'matrix-script'] // Mock defaults
    });
  }, [id]);

  if (!contest) return <div className="min-h-screen bg-[#f3f7f7] flex items-center justify-center">Loading...</div>;

  const contestProblems = challengePool.filter(c => (contest.problems || []).includes(c.id));

  return (
    <div className="bg-[#f4f6f8] min-h-screen pb-24 font-sans">
      
      {/* ── HEADER (HackerRank Exact Match Style) ── */}
      <div className="bg-[#ffffff] border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 pt-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[32px] font-bold text-[#0e141e] tracking-tight leading-tight">{contest.title}</h1>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[12px] font-semibold text-slate-500 flex items-center gap-1">
                  <Users size={14} className="text-slate-400" /> {contest.participants} hackers participating
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] font-semibold text-emerald-600 uppercase tracking-wider">{contest.type}</span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-6 border-t border-slate-100 mt-2">
            {(['challenges', 'leaderboard', 'submissions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pt-4 pb-3.5 text-[14px] font-bold capitalize transition-colors relative ${
                  activeTab === tab ? 'text-[#0e141e]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT (2-Column Right Sidebar Layout) ── */}
      <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left main column */}
        <div className="flex-1 min-w-0">
          {activeTab === 'challenges' && (
            <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-sm">
              {contestProblems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-[#738f9c] font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-6 py-4 w-16 text-center">Status</th>
                        <th className="px-6 py-4">Challenge</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4 text-center">Max Score</th>
                        <th className="px-6 py-4 text-center">Success Rate</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contestProblems.map((prob) => {
                        const isSolved = solvedIds.includes(prob.id);
                        return (
                          <tr key={prob.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-center">
                              {isSolved ? (
                                <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border border-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-left">
                              <div className="space-y-0.5">
                                <Link
                                  to={`/challenges/${prob.id}?contest=true`}
                                  className="font-bold text-[#0e141e] hover:text-brand-primary transition text-[15px]"
                                >
                                  {prob.title}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{prob.track}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-left">
                              <span className={`${diffColor[prob.difficulty]} font-bold`}>{prob.difficulty}</span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-slate-600">
                              {prob.points}
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-slate-600">
                              {prob.successRate}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isSolved ? (
                                <span className="inline-block px-5 py-2 text-emerald-600 font-bold text-[12px] uppercase tracking-wider">Solved</span>
                              ) : (
                                <button
                                  onClick={() => navigate(`/challenges/${prob.id}?contest=true`)}
                                  className="px-5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-[4px] font-bold text-[12px] uppercase tracking-wider transition active:scale-95 shadow-sm"
                                >
                                  Solve Challenge
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center">
                  <Code2 size={40} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No Challenges Found</h3>
                  <p className="text-sm text-slate-500 mt-1">This contest doesn't have any challenges assigned to it yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white border border-slate-200 rounded-[4px] p-16 text-center text-slate-500">
              <Trophy size={40} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Leaderboard Hidden</h3>
              <p className="text-sm mt-1">The leaderboard will be revealed after the contest ends.</p>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="bg-white border border-slate-200 rounded-[4px] p-16 text-center text-slate-500">
              <Lock size={40} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Submissions Yet</h3>
              <p className="text-sm mt-1">Start solving challenges to see your submissions here.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">
          
          {/* Stats Card */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-6 space-y-6 shadow-sm text-left">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time Remaining</div>
              <div className="text-[24px] font-bold text-slate-800 font-mono tracking-tight tabular-nums flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> {countdown}
              </div>
            </div>
            <div className="h-px bg-slate-100" />
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Score</div>
              <div className="text-[32px] font-bold text-brand-primary tracking-tight">0</div>
            </div>
          </div>

          {/* Contest Information Card */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-6 space-y-4 shadow-sm text-left">
            <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Contest Rules</h4>
            <div className="text-[13px] text-slate-600 space-y-3 leading-relaxed">
              <p>• Scoring is based on code correctness and test case efficiency.</p>
              <p>• You may submit solutions multiple times; only your highest score will count.</p>
              <p>• Ties are broken automatically using submission timestamps.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
