import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Users, ArrowRight,
  Calendar, Flame, Zap, Star,
  Lock, TrendingUp, Award, Target,
  ChevronRight, Filter, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// ── Data ──────────────────────────────────────────────────────
const upcoming = [
  {
    id: 1, title: 'Biweekly Contest 120',
    date: 'Tomorrow, 8:00 PM', prize: '300 Glintos',
    participants: '4,102', type: 'Rated', color: 'indigo',
  },
  {
    id: 2, title: 'Glintspark Hiring Fair',
    date: 'Jul 24, 10:00 AM', prize: 'Interview Call',
    participants: '15,800', type: 'Hiring', color: 'purple',
  },
  {
    id: 3, title: 'Algorithm Masters',
    date: 'Jul 26, 4:00 PM', prize: '1,000 Glintos',
    participants: '2,900', type: 'Rated', color: 'indigo',
  },
  {
    id: 4, title: 'SQL Sprint Challenge',
    date: 'Jul 28, 6:00 PM', prize: '500 Glintos',
    participants: '3,100', type: 'Rated', color: 'indigo',
  },
  {
    id: 5, title: 'Frontend Blitz',
    date: 'Aug 1, 9:00 AM', prize: 'Internship Referral',
    participants: '6,400', type: 'Hiring', color: 'purple',
  },
  {
    id: 6, title: 'DSA Weekly Cup',
    date: 'Aug 3, 7:00 PM', prize: '750 Glintos',
    participants: '8,200', type: 'Rated', color: 'indigo',
  },
];

const typeStyles: Record<string, string> = {
  Rated:  'bg-indigo-50 text-brand-primary border-brand-primary/20',
  Hiring: 'bg-purple-50 text-purple-600 border-purple-200',
  Practice: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const stats = [
  { label: 'Active Participants', value: '128K+', icon: Users },
  { label: 'Contests Held', value: '412', icon: Trophy },
  { label: 'Prizes Awarded', value: '₹2.4M', icon: Award },
  { label: 'Companies Hiring', value: '340+', icon: Target },
];

// ── Component ─────────────────────────────────────────────────
export default function Contests() {
  const countdown = useCountdown(5085); // 01:24:45

  const [localContests, setLocalContests] = useState<any[]>([]);
  const [deletedHc, setDeletedHc] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
    setLocalContests(stored);
    const deleted = JSON.parse(localStorage.getItem('glintspark_deleted_hc') || '[]');
    setDeletedHc(deleted);
  }, []);

  const visibleUpcoming = upcoming.filter(c => !deletedHc.includes(c.id.toString()));
  const allContests = [...localContests, ...visibleUpcoming];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 font-sans text-[#0e141e]">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <div className="relative bg-[#0e141e] overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left text */}
            <div className="flex-1">
              <motion.span
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[11px] font-bold uppercase tracking-widest rounded mb-6"
              >
                <Flame size={12} /> Competitive Arena
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight"
              >
                Scale the{' '}
                <span className="text-brand-primary">Leaderboard.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
                className="text-slate-400 text-lg mt-6 leading-relaxed max-w-lg"
              >
                Compete in timed coding battles, climb global rankings, win Glintos, and get discovered by top hiring companies.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="flex flex-wrap gap-4 mt-10"
              >
                <button
                  onClick={() => document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-brand-primary text-white font-bold rounded text-sm hover:bg-brand-dark transition shadow-lg shadow-brand-primary/30 flex items-center gap-2 active:scale-95"
                >
                  Explore Contests <ArrowRight size={16} />
                </button>
                <Link to="/contests/create" className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded text-sm hover:bg-white/10 transition flex items-center gap-2">
                  Create Contest <Plus size={16} />
                </Link>
              </motion.div>
            </div>

            {/* Live Contest Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12, type: 'spring', stiffness: 200 }}
              className="w-full max-w-[360px] shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 relative overflow-hidden border border-white/10">
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-purple-500 rounded-t-2xl" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
                    <Trophy className="text-brand-primary" size={22} />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                    Live Now
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900">Weekly Contest 412</h3>
                <p className="text-xs text-slate-400 mt-1">Time-bound • 4 Problems • Rated</p>

                <div className="flex items-stretch gap-6 mt-8 mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ends In</div>
                    <div className="text-2xl font-black text-slate-900 font-mono tabular-nums tracking-tight">{countdown}</div>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participants</div>
                    <div className="text-2xl font-black text-brand-primary">12,402</div>
                  </div>
                </div>

                <Link
                  to="/challenges/solve-me-first"
                  className="w-full py-3.5 bg-brand-primary text-white font-black text-sm rounded hover:bg-brand-dark transition flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                  Join Now <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/5 bg-white/[0.03]">
          <div className="max-w-7xl mx-auto px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-brand-primary" />
                </div>
                <div>
                  <div className="text-white font-black text-lg leading-none">{value}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          UPCOMING EVENTS
      ══════════════════════════════════════════════ */}
      <div id="upcoming" className="max-w-7xl mx-auto px-8 py-16">

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Calendar className="text-brand-primary" size={20} />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Upcoming Events</h2>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-primary uppercase tracking-widest transition">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allContests.map((contest, i) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 220, damping: 22 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
              className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between group transition-all duration-300"
            >
              {/* Card top */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest border ${typeStyles[contest.type]}`}>
                    {contest.type}
                  </span>
                  <Users size={15} className="text-slate-300" />
                </div>

                <h3 className="text-[17px] font-black text-slate-900 group-hover:text-brand-primary transition-colors leading-tight mb-5">
                  {contest.title}
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium">
                    <Clock size={14} className="text-slate-300 shrink-0" />
                    {contest.date}
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium">
                    <Trophy size={14} className="text-slate-300 shrink-0" />
                    Prize: <span className="font-bold text-slate-700">{contest.prize}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-medium">
                    <Users size={14} className="text-slate-300 shrink-0" />
                    {contest.participants} registered
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link 
                to={`/contests/${contest.id}`}
                className="mt-7 w-full py-2.5 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest rounded hover:bg-brand-dark transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
              >
                Start Contest <ChevronRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
