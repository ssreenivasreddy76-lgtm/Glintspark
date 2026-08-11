import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Clock, BrainCircuit, Layout, Terminal,
  Database, DatabaseZap, Cpu, Lock,
  Braces, Binary, Calculator, Flame,
  Zap, Trophy, ArrowRight, Play, Star,
  TrendingUp, CheckCircle2, Loader2, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';

// ─── Skill grid data ──────────────────────────────────────────────
const skills = [
  { name: "C",           icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"                          alt="C"   className="w-5 h-5" /> },
  { name: "Python",      icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"               alt="Py"  className="w-5 h-5" /> },
  { name: "Javascript",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS"  className="w-5 h-5" /> },
  { name: "SQL",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"                 alt="SQL" className="w-5 h-5" /> },
  { name: "Java",        icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"                    alt="Java"className="w-5 h-5" /> },
  { name: "C#",          icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"                alt="C#"  className="w-5 h-5" /> },
  { name: "PostgreSQL",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"        alt="Postgres" className="w-5 h-5" /> },
  { name: "C++",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"           alt="C++" className="w-5 h-5" /> },
  { name: "Data Structures", icon: <img src="https://img.icons8.com/color/96/data-configuration.png" alt="DS" className="w-6 h-6" /> },
  { name: "Algorithms",      icon: <img src="https://img.icons8.com/color/96/flow-chart.png" alt="Algo" className="w-6 h-6" /> },
];

// Removed hardcoded mock interviews, these are now fetched from state

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
  if (!name) return 'javascript';
  const norm = name.toLowerCase();
  if (norm.includes('javascript') || norm.includes('js')) return 'javascript';
  if (norm.includes('python')) return 'python';
  if (norm.includes('java') && !norm.includes('javascript')) return 'java';
  if (norm.includes('c++')) return 'c++';
  if (norm.includes('c#') || norm.includes('c sharp')) return 'c#';
  if (norm === 'c' || norm.startsWith('c ') || norm.includes(' c ')) return 'c';
  if (norm.includes('sql') || norm.includes('postgres')) return 'sql';
  if (norm.includes('structure') || norm.includes('algorithm') || norm.includes('ds')) return 'data-structures';
  return 'javascript';
}

const DEFAULT_TEMPLATES = [
  { id: 'dt-1', title: 'C Programming', role: 'Software Engineer', difficulty: 'Medium', techStack: 'C, Pointers, Memory Management' },
  { id: 'dt-2', title: 'Java Developer', role: 'Backend', difficulty: 'Medium', techStack: 'Java, OOP, Spring Boot' },
  { id: 'dt-3', title: 'Python Engineer', role: 'Software Engineer', difficulty: 'Medium', techStack: 'Python, Django, Data Processing' },
  { id: 'dt-4', title: 'C++ Developer', role: 'Systems Engineer', difficulty: 'Hard', techStack: 'C++, STL, Memory' },
  { id: 'dt-5', title: 'Data Structures & Algorithms', role: 'General', difficulty: 'Hard', techStack: 'DSA, Problem Solving' },
  { id: 'dt-6', title: 'Java Full Stack', role: 'Full Stack', difficulty: 'Hard', techStack: 'Java, React, Spring, SQL' },
  { id: 'dt-7', title: 'Frontend (HTML/CSS/JS)', role: 'Frontend', difficulty: 'Medium', techStack: 'HTML, CSS, JavaScript, React' },
  { id: 'dt-8', title: 'Database & SQL', role: 'Data', difficulty: 'Medium', techStack: 'SQL, PostgreSQL, Database Design' },
  { id: 'dt-9', title: 'System Design Architect', role: 'Architect', difficulty: 'Hard', techStack: 'System Design, Microservices, Cloud' },
];

const INITIAL_MOCK_INTERVIEWS = DEFAULT_TEMPLATES.map((t: any) => ({
  id: t.id,
  title: t.title,
  desc: `Practice your ${t.title || t.role} skills in an interactive AI coding interview environment.`,
  time: "45 mins",
  lock: false
}));

export default function Dashboard() {
  const { user } = useAuth();
  const { challenges } = useChallenges();
  const [lastSolved, setLastSolved]   = useState<{ challenge_id: string; language: string; solved_at: string } | null>(null);
  const [totalSolved, setTotalSolved] = useState(0);
  const [solvedCountByLang, setSolvedCountByLang] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const [mockInterviews, setMockInterviews] = useState<any[]>(INITIAL_MOCK_INTERVIEWS);
  const [showDevMessage, setShowDevMessage] = useState(false);

  // Fetch mock interviews from Firebase + defaults
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const dbTemplates = await firebaseDB.getMockTemplates();
        
        // Merge DB templates with default templates to ensure Java, Python, C++, etc. always exist
        const dbTitles = new Set(dbTemplates.map((t: any) => (t.title || '').toLowerCase().trim()));
        const missingDefaults = DEFAULT_TEMPLATES.filter(dt => !dbTitles.has(dt.title.toLowerCase().trim()));
        const allTemplates = [...dbTemplates, ...missingDefaults];

        const mapped = allTemplates.map((t: any) => {
          let cleanDesc = t.description;
          if (!cleanDesc) {
            if (t.role) {
              cleanDesc = `Practice your ${t.title || t.role} skills in an interactive AI coding interview environment.`;
            } else {
              cleanDesc = `Interactive technical mock interview simulation with real-time AI feedback and scoring.`;
            }
          }
          return {
            id: t.id || Math.random().toString(),
            title: t.title || 'Untitled',
            desc: cleanDesc,
            time: "45 mins",
            lock: false
          };
        });
        setMockInterviews(mapped);
      } catch (e) {
        console.error(e);
      }
    };

    fetchTemplates();
  }, []);

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
      <AnimatePresence>
        {showDevMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-white border-2 border-red-500 rounded-lg shadow-2xl px-8 py-5 flex items-center justify-center gap-5 w-[95%] max-w-4xl"
          >
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[16px] font-black">X</span>
            </div>
            <p className="text-slate-800 text-xl font-bold tracking-tight">
              Sorry, this feature is currently under development. Check back soon!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Background Gradients ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 50, -30, 0], y:[0, -50, 30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full" />
        <motion.div animate={{ x:[0, -40, 40, 0], y:[0, 40, -20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] -right-[10%] w-[45%] h-[45%] bg-fuchsia-400/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage:'radial-gradient(circle,#000 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16 relative z-10">



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
                  key={item.id}
                  initial={{ opacity:0, y:20 }} 
                  animate={{ opacity:1, y:0 }} 
                  exit={{ opacity:0, y:-20 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-400 hover:to-cyan-400 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 group"
                >
                  <div className="h-full bg-white backdrop-blur-xl p-8 rounded-[31px] flex flex-col items-start transition-all group-hover:bg-white relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl rounded-full group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
                    
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-500/30">
                      {(() => {
                        const trackId = getPracticeTrackId(item.title);
                        const skill = skills.find(s => getPracticeTrackId(s.name) === trackId);
                        if (skill) return <div className="group-hover:brightness-0 group-hover:invert transition-all">{skill.icon}</div>;
                        return i % 3 === 0 ? <Layout size={24} /> : i % 3 === 1 ? <DatabaseZap size={24} /> : <BrainCircuit size={24} />;
                      })()}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6 flex-grow relative z-10">{item.desc}</p>

                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-8 relative z-10">
                      <Clock size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> {item.time}
                    </div>

                    <div className="relative z-10 w-full mt-auto">
                      {item.lock ? (
                        <div className="w-full h-[52px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shadow-sm">
                          <Lock size={20} />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowDevMessage(true);
                            setTimeout(() => setShowDevMessage(false), 4000);
                          }}
                          className="w-full flex px-6 py-4 bg-slate-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/25 justify-center items-center gap-2 group/btn"
                        >
                          Start Interview <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
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
              <div className="absolute top-0 right-0 p-12 bg-white rounded-full blur-3xl -z-10 group-hover:bg-white transition-all"></div>
              <div className="bg-white backdrop-blur-2xl rounded-[31px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all">
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
                  <div className="h-full bg-white backdrop-blur-xl rounded-[15px] p-4 flex items-center gap-4 transition-all relative z-10 group-hover:bg-white">
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
