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
  const [lastSolved, setLastSolved]   = useState<{ challenge_id: string; language: string; solved_at: string } | null>(null);
  const [totalSolved, setTotalSolved] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAllInterviews, setShowAllInterviews] = useState(false);

  // Fetch real stats from Supabase
  useEffect(() => {
    if (!user) { setLoadingStats(false); return; }
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('solved_challenges')
          .select('challenge_id, language, solved_at')
          .eq('user_id', user._id)
          .order('solved_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setTotalSolved(data.length);
          setLastSolved(data[0] ?? null);
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
    <div className="bg-[#fcfdfd] min-h-screen pb-24 relative overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div animate={{ x: [0,60,-30,0], y:[0,-30,60,0] }} transition={{ duration:30, repeat:Infinity, ease:'linear' }}
          className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-100 blur-[120px] rounded-full opacity-60" />
        <motion.div animate={{ x:[0,-40,20,0], y:[0,40,-20,0] }} transition={{ duration:35, repeat:Infinity, ease:'linear' }}
          className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-50 blur-[100px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage:'radial-gradient(circle,#000 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-14 relative z-10">

        {/* ── 2. CONTINUE WHERE YOU LEFT OFF ── */}
        {!loadingStats && lastSolved && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Play size={18} className="text-brand-primary fill-brand-primary" />
                Continue where you left off
              </h2>
            </div>
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="bg-white border-2 border-brand-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-brand-primary/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Code2 size={22} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 capitalize tracking-tight group-hover:text-brand-primary transition">
                    {lastSolved.challenge_id.replace(/-/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} /> Last solved in {lastSolved.language}
                    </span>
                    <span>•</span>
                    <span>{new Date(lastSolved.solved_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/challenges/${lastSolved.challenge_id}`}
                className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-dark transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 shrink-0"
              >
                Solve Again <ArrowRight size={14} />
              </Link>
            </motion.div>
          </section>
        )}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {/* Global Rank */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Trophy size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">#629,826</div>
          </div>

          {/* Streak */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <Flame size={16} className="fill-orange-500" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Streak</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{streak} days</div>
          </div>

          {/* Points / XP */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Zap size={16} className="fill-indigo-500" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points (XP)</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{xp}</div>
          </div>

          {/* Solved */}
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Challenges</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {loadingStats ? <Loader2 size={20} className="animate-spin text-slate-200" /> : totalSolved}
            </div>
          </div>
        </motion.div>

        {/* ── 3. AI-POWERED MOCK INTERVIEWS ── */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI-powered Mock Interviews</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-10">
            Ace your next job interview by practicing with AI-powered mock interviews.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {(showAllInterviews ? mockInterviews : mockInterviews.slice(0, 5)).map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity:0, y:10, height: 0 }} 
                  animate={{ opacity:1, y:0, height: 'auto' }} 
                  exit={{ opacity:0, y:-10, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border-2 border-[#eff2f4] rounded-[32px] p-8 flex flex-col items-start min-h-[320px] shadow-sm hover:border-slate-200 hover:shadow-md transition-all group overflow-hidden"
                >
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold mb-6 flex-grow">{item.desc}</p>

                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6">
                  <Clock size={16} /> {item.time}
                </div>

                {item.tags && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black bg-brand-primary/5 text-brand-dark px-3 py-1 rounded-full uppercase tracking-tight">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {item.lock ? (
                  <div className="w-10 h-10 border-2 border-[#eff2f4] rounded-xl flex items-center justify-center text-slate-300">
                    <Lock size={20} />
                  </div>
                ) : (
                  <Link
                    to={`/mock-interview/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-sm font-bold transition active:scale-95 shadow-lg shadow-brand-primary/20"
                  >
                    Start Interview
                  </Link>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ── 4. PRACTICE SKILLS GRID ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Practice Skills</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {skills.map((skill, i) => (
              <Link to={`/challenges/track/${getPracticeTrackId(skill.name)}`} key={skill.name}>
                <motion.div
                  initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.02 }}
                  className="bg-[#f6faff] border-2 border-[#eff2f4] rounded-2xl p-5 flex items-center gap-4 hover:bg-[#f0f6ff] hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                    {skill.icon}
                  </div>
                  <span className="text-sm font-black text-slate-800 tracking-tight leading-tight">{skill.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 5. QUICK STATS STRIP ── */}
        {user && (
          <section>
            <div className="bg-slate-950 rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: <Trophy size={22} className="text-amber-400" />, label: 'Global Rank', value: '#629,826' },
                { icon: <CheckCircle2 size={22} className="text-emerald-400" />, label: 'Solved', value: totalSolved },
                { icon: <Flame size={22} className="text-orange-400" />, label: 'Streak', value: `${streak} days` },
                { icon: <Star size={22} className="text-amber-400 fill-amber-400" />, label: 'Stars Earned', value: stars },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
                  className="flex flex-col items-center gap-2">
                  {stat.icon}
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
