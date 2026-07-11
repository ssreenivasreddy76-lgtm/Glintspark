import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Clock, BrainCircuit, Layout, Terminal,
  Database, DatabaseZap, Cpu, Lock,
  Braces, Binary, Calculator, Flame,
  Zap, Trophy, ArrowRight, Play, Star,
  TrendingUp, CheckCircle2, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';

// ─── Skill grid data ──────────────────────────────────────────────
const skills = [
  { name: "Javascript",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS"  className="w-5 h-5" /> },
  { name: "Python",      icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"               alt="Py"  className="w-5 h-5" /> },
  { name: "Java",        icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"                    alt="Java"className="w-5 h-5" /> },
  { name: "C++",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"           alt="C++" className="w-5 h-5" /> },
  { name: "C",           icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"                          alt="C"   className="w-5 h-5" /> },
  { name: "C#",          icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"                alt="C#"  className="w-5 h-5" /> },
  { name: "SQL",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"                 alt="SQL" className="w-5 h-5" /> },
  { name: "PostgreSQL",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"        alt="Postgres" className="w-5 h-5" /> },
  { name: "Data Structures", icon: <img src="https://img.icons8.com/color/96/data-configuration.png" alt="DS" className="w-6 h-6" /> },
  { name: "Algorithms",      icon: <img src="https://img.icons8.com/color/96/flow-chart.png" alt="Algo" className="w-6 h-6" /> },
];

const mockInterviews = [
  { title: "Frontend Architecture", desc: "Deep dive into React internals, state management, rendering optimization, and modern web vitals.", time: "45 mins", tags: ["React", "UI/UX", "Performance"], lock: false },
  { title: "Backend & APIs",        desc: "Design robust REST/GraphQL APIs, handle database scaling, caching strategies, and security.",        time: "60 mins", tags: ["Node.js", "System Design", "Databases"], lock: false },
  { title: "Data Structures",       desc: "Tackle classic FAANG-style algorithmic challenges. Focus on optimal time/space complexity.",               time: "60 mins", tags: ["Algorithms", "Problem Solving"], lock: false },
  { title: "Leadership & Culture",  desc: "Master the STAR method. Answer behavioral questions focused on conflict resolution and leadership.",                time: "45 mins", tags: ["Behavioral", "Soft Skills"], lock: false },
  { title: "Full-Stack Design",     desc: "Architect an end-to-end scalable application. Connect frontend systems to distributed backends.",   time: "90 mins", tags: ["System Design", "Architecture"], lock: false },
  { title: "DevOps & Cloud",        desc: "Design cloud infrastructures, CI/CD pipelines, and manage container orchestration.", time: "60 mins", tags: ["AWS", "Docker", "Kubernetes"], lock: false },
  { title: "Database Architecture", desc: "Optimize complex SQL queries, design schemas, and handle large-scale database migrations.", time: "45 mins", tags: ["SQL", "PostgreSQL", "NoSQL"], lock: false },
  { title: "Security & Crypto",     desc: "Identify vulnerabilities, implement authentication, and secure systems against modern threats.", time: "60 mins", tags: ["Cybersecurity", "Pen-testing"], lock: false },
];

// ─── Helper ───────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function xpToStars(xp: number) {
  // Every 30 xp = 1 star (matches the mastery header system)
  return Math.floor(xp / 30);
}

// ─── Component ────────────────────────────────────────────────────
// ─── Practice track mapping helper ───
function getPracticeTrackId(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes('javascript') || norm.includes('js')) return 'javascript';
  if (norm.includes('python')) return 'python';
  if (norm.includes('java') && !norm.includes('javascript')) return 'java';
  if (norm.includes('c++') || norm.includes('c#') || norm === 'c') return 'c';
  if (norm.includes('sql') || norm.includes('postgres')) return 'sql';
  if (norm.includes('structure') || norm.includes('algorithm') || norm.includes('ds')) return 'data-structures';
  return 'javascript';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { challenges } = useChallenges();
  const [lastSolved, setLastSolved]   = useState<{ challenge_id: string; language: string; solved_at: string } | null>(null);
  const [totalSolved, setTotalSolved] = useState(0);
  const [solvedCountByLang, setSolvedCountByLang] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAllInterviews, setShowAllInterviews] = useState(false);

  // Fetch real stats from Firestore
  useEffect(() => {
    if (!user) { setLoadingStats(false); return; }
    const fetchStats = async () => {
      try {
        const dbSolved = await firebaseDB.getUserSubmissions(user._id);

        if (dbSolved && dbSolved.length > 0) {
          // Sort descending by createdAt
          const sorted = [...dbSolved].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTotalSolved(sorted.length);
          setLastSolved({
            challenge_id: sorted[0].challengeId,
            language: sorted[0].language,
            solved_at: sorted[0].createdAt
          });
          
          const langCounts: Record<string, number> = {};
          sorted.forEach(d => {
             langCounts[d.language] = (langCounts[d.language] || 0) + 1;
          });
          setSolvedCountByLang(langCounts);
        }
      } catch (_) {}
      setLoadingStats(false);
    };
    fetchStats();
  }, [user]);

  const firstName  = user?.firstName || user?.name?.split(' ')[0] || 'Developer';
  const xp         = user?.xp ?? 0;
  const streak     = user?.streak ?? 0;
  const stars      = xpToStars(xp);
  const nextStarXp = (stars + 1) * 30;
  const xpProgress = Math.min((xp % 30) / 30, 1);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 relative overflow-hidden font-sans">
      {/* ── Background Gradients ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 50, -30, 0], y:[0, -50, 30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full" />
        <motion.div animate={{ x:[0, -40, 40, 0], y:[0, 40, -20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] -right-[10%] w-[45%] h-[45%] bg-fuchsia-400/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage:'radial-gradient(circle,#000 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16 relative z-10">

        {/* ── 1. STATS ROW ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {/* Global Rank */}
          <div className="relative group p-[1px] rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-amber-400 hover:to-orange-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="h-full bg-white/80 backdrop-blur-xl p-6 rounded-[27px] transition-all group-hover:bg-white/95">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Global Rank</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Trophy size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">#629,826</div>
            </div>
          </div>

          {/* Streak */}
          <div className="relative group p-[1px] rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-orange-400 hover:to-red-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="h-full bg-white/80 backdrop-blur-xl p-6 rounded-[27px] transition-all group-hover:bg-white/95">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Day Streak</span>
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Flame size={20} className="fill-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{streak} <span className="text-xl text-slate-400">days</span></div>
            </div>
          </div>

          {/* Points / XP */}
          <div className="relative group p-[1px] rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-indigo-400 hover:to-purple-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="h-full bg-white/80 backdrop-blur-xl p-6 rounded-[27px] transition-all group-hover:bg-white/95">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Points (XP)</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Zap size={20} className="fill-indigo-500" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{xp}</div>
            </div>
          </div>

          {/* Solved */}
          <div className="relative group p-[1px] rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-emerald-400 hover:to-teal-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="h-full bg-white/80 backdrop-blur-xl p-6 rounded-[27px] transition-all group-hover:bg-white/95">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Challenges</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loadingStats ? <Loader2 size={24} className="animate-spin text-slate-200" /> : totalSolved}
              </div>
            </div>
          </div>
        </motion.div>

        {/* OLD CONTINUE WHERE YOU LEFT OFF SECTION REMOVED */}

        {/* ── 3. AI-POWERED MOCK INTERVIEWS ── */}
        <section>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">AI-Powered Mock Interviews</h2>
              <p className="text-slate-500 text-lg font-medium">Ace your next job interview by practicing with intelligent simulations.</p>
            </div>
            <button 
              onClick={() => setShowAllInterviews(!showAllInterviews)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline underline-offset-4"
            >
              {showAllInterviews ? 'Show Less' : 'View All Interviews'} <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {(showAllInterviews ? mockInterviews : mockInterviews.slice(0, 3)).map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity:0, y:20 }} 
                  animate={{ opacity:1, y:0 }} 
                  exit={{ opacity:0, y:-20 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-400 hover:to-cyan-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 group"
                >
                  <div className="h-full bg-white/90 backdrop-blur-xl p-8 rounded-[31px] flex flex-col items-start transition-all group-hover:bg-white/95 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl rounded-full group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
                    
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-500/30">
                      {i % 3 === 0 ? <Layout size={24} /> : i % 3 === 1 ? <DatabaseZap size={24} /> : <BrainCircuit size={24} />}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6 flex-grow relative z-10">{item.desc}</p>

                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6 relative z-10">
                      <Clock size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> {item.time}
                    </div>

                    {item.tags && (
                      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative z-10 w-full mt-auto">
                      {item.lock ? (
                        <div className="w-full h-[52px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shadow-sm">
                          <Lock size={20} />
                        </div>
                      ) : (
                        <Link
                          to={`/mock-interview/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="w-full flex px-6 py-4 bg-slate-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/25 justify-center items-center gap-2 group/btn"
                        >
                          Start Interview <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ── 4. PRACTICE SKILLS GRID ── */}
        <section>
          {/* CONTINUE PRACTICING (Moved here and redesigned) */}
          {!loadingStats && lastSolved && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="relative p-[1px] rounded-[32px] bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/15 group mb-10">
              <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl -z-10 group-hover:bg-white/10 transition-all"></div>
              <div className="bg-white/95 backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all">
                <div className="flex items-center gap-6 w-full sm:w-auto flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-blue-100/50">
                    {skills.find(s => getPracticeTrackId(s.name) === lastSolved.language)?.icon || <Code2 size={28} className="text-blue-600" />}
                  </div>
                  <div className="flex-1 w-full max-w-md">
                    <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <TrendingUp size={12} /> Continue Practicing
                    </h2>
                    <h3 className="text-2xl font-black text-slate-800 capitalize tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                      {skills.find(s => getPracticeTrackId(s.name) === lastSolved.language)?.name || lastSolved.language}
                    </h3>
                    
                    {/* Progress Bar */}
                    {(() => {
                      const activeLang = lastSolved.language;
                      const solvedInLang = solvedCountByLang[activeLang] || 0;
                      const totalInLang = challenges.filter(c => c.track === activeLang).length || 1;
                      const progressPercent = Math.round((solvedInLang / totalInLang) * 100);
                      return (
                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{solvedInLang} / {totalInLang} Solved ({progressPercent}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <Link
                  to={`/challenges/track/${lastSolved.language}`}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 shrink-0"
                >
                  Resume <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Challenges</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {skills.map((skill, i) => (
              <Link to={`/challenges/track/${getPracticeTrackId(skill.name)}`} key={skill.name}>
                <motion.div
                  initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.02 }}
                  className="relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-400 hover:to-cyan-400 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/15 group overflow-hidden hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                  <div className="h-full bg-white/95 backdrop-blur-xl rounded-[15px] p-4 flex items-center gap-4 transition-all relative z-10 group-hover:bg-white/90">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      <div className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">{skill.icon}</div>
                    </div>
                    <span className="text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">{skill.name}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
