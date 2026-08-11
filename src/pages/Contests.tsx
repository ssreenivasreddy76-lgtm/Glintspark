import { useState, useEffect } from 'react';
import { firebaseDB } from '../services/firebaseService';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Users, ArrowRight,
  Calendar, Flame, Zap, Star,
  Lock, TrendingUp, Award, Target,
  ChevronRight, Filter, Plus
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
const stats = [
  { label: 'Active Participants', value: '128K+', icon: Users },
  { label: 'Contests Held', value: '412', icon: Trophy },
  { label: 'Prizes Awarded', value: '₹2.4M', icon: Award },
  { label: 'Companies Hiring', value: '340+', icon: Target },
];

// ── Component ─────────────────────────────────────────────────
export default function Contests() {
  const { user, loading } = useAuth();
  const countdown = useCountdown(5085); // 01:24:45

  const [localContests, setLocalContests] = useState<any[]>([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const dbContests = await firebaseDB.getContests();
        if (dbContests && dbContests.length > 0) {
          setLocalContests(dbContests);
        }
      } catch (err) {
        console.error("Failed to load contests from Firebase:", err);
      }
    };
    fetchContests();
  }, []);

  const isCompanyUser = user?._id === 'mock_company' || user?.role === 'company' || user?.email?.endsWith('@glintspark.team') || user?.email === 'company@glintspark.com';

  const now = Date.now();
  const allContests = localContests.filter(contest => {
    if (!contest.date) return true;
    const durationMins = contest.duration || 20; // Default to 20 mins for old tests
    const contestStart = new Date(contest.date).getTime();
    const contestEnd = contestStart + (durationMins * 60 * 1000);
    return now <= contestEnd;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 font-sans text-[#0e141e]">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <div className="relative bg-slate-900 overflow-hidden border-b border-slate-200 min-h-[500px] flex items-center">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/contest_normal_photo.png" 
            alt="Coding Contest" 
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-7xl mx-auto px-8 py-24 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-[11px] font-bold uppercase tracking-widest rounded mb-6 backdrop-blur-md"
            >
              <Flame size={12} /> Competitive Arena
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight"
            >
              Scale the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Leaderboard.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
              className="text-slate-200 text-lg md:text-xl mt-6 leading-relaxed max-w-xl"
            >
              Compete in timed coding battles, climb global rankings, win Glintos, and get discovered by top hiring companies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link
                to="/contests/manage"
                className="px-8 py-3.5 bg-brand-primary text-white font-bold rounded text-sm hover:bg-brand-dark transition shadow-lg shadow-brand-primary/30 flex items-center gap-2 active:scale-95 uppercase tracking-widest"
              >
                Manage Contests <ArrowRight size={16} />
              </Link>
              <Link to="/contests/create" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded text-sm hover:bg-white/20 transition flex items-center gap-2 backdrop-blur-md uppercase tracking-widest">
                Create Contest <Plus size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>



      {/* ══════════════════════════════════════════════
          UPCOMING EVENTS
      ══════════════════════════════════════════════ */}
      <div id="upcoming" className="max-w-7xl mx-auto px-8 py-16 relative">
        {/* Floating 3D Trophy Background */}
        <motion.img 
          src="/assets/3d_trophy_light.png" 
          alt="Trophy" 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] object-contain opacity-20 mix-blend-multiply pointer-events-none z-0"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <Calendar className="text-brand-primary" size={20} />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Upcoming Events</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {allContests.map((contest, i) => (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(99,102,241,0.15)' }}
              className="relative p-[1px] rounded-[24px] bg-gradient-to-b from-slate-200 to-slate-100 hover:from-brand-primary hover:to-purple-500 transition-all duration-500 group"
            >
              <div className="bg-white backdrop-blur-xl rounded-[23px] p-7 h-full flex flex-col justify-between transition-all duration-500 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-brand-primary/5 to-purple-500/5 blur-3xl rounded-full group-hover:from-brand-primary/20 group-hover:to-purple-500/20 transition-all duration-500"></div>

              {/* Card top */}
              <div className="relative z-10">
                <div className="flex items-center justify-end mb-5">
                  <Users size={15} className="text-slate-400 group-hover:text-brand-primary transition-colors duration-500" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-primary group-hover:to-purple-600 transition-all duration-500 leading-tight mb-5">
                  {contest.title}
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-bold">
                    <Clock size={14} className="text-slate-400 group-hover:text-brand-primary transition-colors duration-500 shrink-0" />
                    {contest.date}
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-bold">
                    <Trophy size={14} className="text-slate-400 group-hover:text-brand-primary transition-colors duration-500 shrink-0" />
                    Prize: <span className="font-black text-slate-700 group-hover:text-brand-primary transition-colors duration-500">{contest.prize}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-slate-500 font-bold">
                    <Users size={14} className="text-slate-400 group-hover:text-brand-primary transition-colors duration-500 shrink-0" />
                    {contest.participants} registered
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link 
                to={`/contests/${contest.id}`}
                className="mt-7 relative z-10 w-full py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gradient-to-r hover:from-brand-primary hover:to-purple-600 transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 shadow-md hover:shadow-xl hover:shadow-brand-primary/25 group/btn"
              >
                Start Contest <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
