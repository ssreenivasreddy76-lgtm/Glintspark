import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Code2, Trophy, Users, ArrowLeft, BookOpen,
  Plus, Pencil, Trash2, X, BarChart2, Save, AlertTriangle,
  Search, Settings
} from 'lucide-react';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { useChallenges } from '../contexts/ChallengesContext';
import type { Challenge, PracticeTrack } from '../contexts/ChallengesContext';

type AdminTab = 'overview' | 'challenges' | 'tracks' | 'contests' | 'users';

const DIFF_BADGE: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border border-amber-200',
  Hard: 'text-rose-700 bg-rose-50 border border-rose-200',
};

const HARDCODED_CONTESTS = [
  { id: 'hc-1', title: 'Biweekly Contest 120', date: 'Tomorrow, 8:00 PM', prize: '300 Glintos', participants: '4,102', type: 'Rated' },
  { id: 'hc-2', title: 'Glintspark Hiring Fair', date: 'Jul 24, 10:00 AM', prize: 'Interview Call', participants: '15,800', type: 'Hiring' },
  { id: 'hc-3', title: 'Algorithm Masters', date: 'Jul 26, 4:00 PM', prize: '1,000 Glintos', participants: '2,900', type: 'Rated' },
  { id: 'hc-4', title: 'SQL Sprint Challenge', date: 'Jul 28, 6:00 PM', prize: '500 Glintos', participants: '3,100', type: 'Rated' },
  { id: 'hc-5', title: 'Frontend Blitz', date: 'Aug 1, 9:00 AM', prize: 'Internship Referral', participants: '6,400', type: 'Hiring' },
  { id: 'hc-6', title: 'DSA Weekly Cup', date: 'Aug 3, 7:00 PM', prize: '750 Glintos', participants: '8,200', type: 'Rated' },
];

const emptyChallenge = (): Omit<Challenge, 'id'> => ({
  title: '', difficulty: 'Easy', category: '', points: 10, successRate: '80.0%', track: 'javascript', description: '',
});

// ── MODAL ───────────────────────────────────────────────────────
function ChallengeModal({
  initial, tracks, onSave, onClose,
}: {
  initial: Partial<Challenge>;
  tracks: PracticeTrack[];
  onSave: (data: Omit<Challenge, 'id'> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...emptyChallenge(), ...initial });
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">{initial.id ? 'Edit Challenge' : 'Add New Challenge'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
              placeholder="Challenge title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Track</label>
              <select value={form.track} onChange={e => set('track', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition bg-white">
                {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value as any)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition bg-white">
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition"
                placeholder="e.g. Arrays" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Points</label>
              <input type="number" value={form.points} onChange={e => set('points', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Success Rate</label>
            <input value={form.successRate} onChange={e => set('successRate', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition"
              placeholder="e.g. 75.4%" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition resize-none"
              placeholder="Problem statement..." />
          </div>
        </div>
        <div className="flex gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-lg hover:bg-slate-100 transition">
            Cancel
          </button>
          <button onClick={() => { if (form.title.trim()) onSave({ ...form, id: initial.id }); }}
            disabled={!form.title.trim()}
            className="flex-1 py-2.5 bg-brand-primary text-white font-bold text-[13px] rounded-lg hover:bg-brand-dark transition flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={15} /> {initial.id ? 'Save Changes' : 'Add Challenge'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── CONTEST MODAL ────────────────────────────────────────────────
function ContestModal({ initial, onSave, onClose }: { initial: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">Edit Contest</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="px-8 py-6 space-y-4">
          {['title', 'date', 'prize', 'participants'].map(k => (
            <div key={k}>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{k}</label>
              <input value={form[k] || ''} onChange={e => set(k, e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition" />
            </div>
          ))}
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
            <select value={form.type || 'Rated'} onChange={e => set('type', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-brand-primary transition bg-white">
              {['Rated', 'Hiring', 'Practice'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-lg hover:bg-slate-100 transition">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-brand-primary text-white font-bold text-[13px] rounded-lg hover:bg-brand-dark transition flex items-center justify-center gap-2">
            <Save size={15} /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── DELETE CONFIRM ───────────────────────────────────────────────
function DeleteConfirm({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Delete "{label}"?</h3>
        <p className="text-slate-500 text-sm mb-6">This will immediately remove it from the user panel. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold text-[13px] hover:bg-slate-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-bold text-[13px] hover:bg-rose-600 transition">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── MAIN ADMIN COMPONENT ─────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const { tracks, challenges, addChallenge, updateChallenge, deleteChallenge, addTrack, updateTrack, deleteTrack: contextDeleteTrack } = useChallenges();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<{ users: number; submissions: number } | null>(null);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);

  // Challenge modal state
  const [challengeModal, setChallengeModal] = useState<Partial<Challenge> | null>(null);
  const [deleteChallengeTarget, setDeleteChallengeTarget] = useState<Challenge | null>(null);

  // Contest modal state
  const [contestModal, setContestModal] = useState<any | null>(null);
  const [deleteContestTarget, setDeleteContestTarget] = useState<any | null>(null);

  // Track modal state
  const [trackModal, setTrackModal] = useState<Partial<PracticeTrack> | null>(null);
  const [deleteTrackTarget, setDeleteTrackTarget] = useState<PracticeTrack | null>(null);

  // Track filter for challenges tab
  const [filterTrack, setFilterTrack] = useState('all');

  // Load overview stats
  useEffect(() => {
    async function load() {
      try {
        const [{ count: uc }, sc] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          firebaseDB.getAllSubmissionsCount(),
        ]);
        setStats({ users: uc ?? 0, submissions: sc ?? 0 });
      } catch { setStats({ users: 0, submissions: 0 }); }
    }
    load();
  }, []);

  // Load users for Users tab
  useEffect(() => {
    if (tab !== 'users') return;
    supabase.from('users').select('id,name,email,xp,streak,created_at').limit(100)
      .then(({ data }) => setDbUsers(data || []));
  }, [tab]);

  // Load contests
  const loadContests = async () => {
    try {
      const dbContests = await supabaseDB.getContests();
      const custom = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
      const deleted = JSON.parse(localStorage.getItem('glintspark_deleted_hc') || '[]');
      const visible = HARDCODED_CONTESTS.filter(c => !deleted.includes(c.id)).map(c => ({ ...c, source: 'hardcoded' }));
      
      const combinedCustom = [...dbContests, ...custom.filter((cc: any) => !dbContests.find((dc: any) => dc.id === cc.id))];
      const customTagged = combinedCustom.map((c: any) => ({ ...c, source: 'custom' }));
      setContests([...customTagged, ...visible]);
    } catch {
      const custom = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
      const deleted = JSON.parse(localStorage.getItem('glintspark_deleted_hc') || '[]');
      const visible = HARDCODED_CONTESTS.filter(c => !deleted.includes(c.id)).map(c => ({ ...c, source: 'hardcoded' }));
      const customTagged = custom.map((c: any) => ({ ...c, source: 'custom' }));
      setContests([...customTagged, ...visible]);
    }
  };

  useEffect(() => { if (tab === 'contests') loadContests(); }, [tab]);

  // Filtered challenges
  const displayChallenges = filterTrack === 'all' ? challenges : challenges.filter(c => c.track === filterTrack);

  // ── Challenge handlers
  const handleSaveChallenge = (data: Omit<Challenge, 'id'> & { id?: string }) => {
    if (data.id) {
      updateChallenge(data.id, data);
    } else {
      addChallenge({
        ...data,
        id: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
      } as Challenge);
    }
    setChallengeModal(null);
  };

  // ── Contest handlers
  const handleSaveContest = async (form: any) => {
    if (form.source === 'hardcoded') {
      const del = JSON.parse(localStorage.getItem('glintspark_deleted_hc') || '[]');
      localStorage.setItem('glintspark_deleted_hc', JSON.stringify([...del, form.id]));
      
      const newCustom = { ...form, id: `custom-${Date.now()}`, source: 'custom' };
      const custom = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
      localStorage.setItem('glintspark_contests', JSON.stringify([newCustom, ...custom]));
      
      try {
        await supabaseDB.addContest({
          id: newCustom.id,
          title: newCustom.title,
          date: newCustom.date,
          prize: newCustom.prize,
          participants: newCustom.participants,
          type: newCustom.type,
          source: 'custom'
        });
      } catch (err) {
        console.error("Failed to add contest to Supabase:", err);
      }
    } else {
      const custom = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
      localStorage.setItem('glintspark_contests', JSON.stringify(custom.map((c: any) => c.id === form.id ? form : c)));
      
      try {
        await supabaseDB.updateContest(form.id, {
          title: form.title,
          date: form.date,
          prize: form.prize,
          participants: form.participants,
          type: form.type
        });
      } catch (err) {
        console.error("Failed to update contest in Supabase:", err);
      }
    }
    setContestModal(null);
    loadContests();
  };

  const handleDeleteContest = async (c: any) => {
    if (c.source === 'hardcoded') {
      const del = JSON.parse(localStorage.getItem('glintspark_deleted_hc') || '[]');
      localStorage.setItem('glintspark_deleted_hc', JSON.stringify([...del, c.id]));
    } else {
      const custom = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
      localStorage.setItem('glintspark_contests', JSON.stringify(custom.filter((sc: any) => sc.id !== c.id)));
      
      try {
        await supabaseDB.deleteContest(c.id);
      } catch (err) {
        console.error("Failed to delete contest from Supabase:", err);
      }
    }
    setDeleteContestTarget(null);
    loadContests();
  };

  // ── Track handlers
  const handleSaveTrack = (data: PracticeTrack) => {
    if (tracks.find(t => t.id === data.id) && data.id === trackModal?.id) {
      updateTrack(data.id, data);
    } else if (!tracks.find(t => t.id === data.id)) {
      addTrack(data);
    }
    setTrackModal(null);
  };

  const SIDE_NAV = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'challenges' as AdminTab, label: 'Challenges', icon: <Code2 size={17} />, badge: challenges.length },
    { id: 'tracks' as AdminTab, label: 'Practice Tracks', icon: <BookOpen size={17} />, badge: tracks.length },
    { id: 'contests' as AdminTab, label: 'Contests', icon: <Trophy size={17} /> },
    { id: 'users' as AdminTab, label: 'Users', icon: <Users size={17} /> },
  ];

  return (
    <div className="flex h-screen bg-[#f3f7f7] font-sans overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-56 bg-[#0e141e] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Admin Portal</p>
          <p className="text-white font-black text-base mt-0.5">Glintspark</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDE_NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                tab === item.id ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {item.icon} <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${tab === item.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 text-[13px] font-semibold transition">
            <ArrowLeft size={15} /> Back to App
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {tab === 'overview' ? 'Dashboard Overview' : tab === 'challenges' ? 'Challenges' : tab === 'tracks' ? 'Practice Tracks' : tab === 'contests' ? 'Contests' : 'Users'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {tab === 'challenges' ? 'Changes apply live to the user-facing challenges page.' :
               tab === 'tracks' ? 'Manage programming language tracks and categories.' :
               tab === 'contests' ? 'Manage upcoming and active contests.' :
               tab === 'users' ? 'View registered users and their stats.' : 'Platform metrics at a glance.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {tab === 'challenges' && (
              <button onClick={() => setChallengeModal({})}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold text-[13px] rounded-lg hover:bg-brand-dark transition shadow-sm active:scale-95">
                <Plus size={15} /> Add Challenge
              </button>
            )}
            {tab === 'tracks' && (
              <button onClick={() => setTrackModal({})}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold text-[13px] rounded-lg hover:bg-brand-dark transition shadow-sm active:scale-95">
                <Plus size={15} /> Add Track
              </button>
            )}
            {tab === 'contests' && (
              <button onClick={() => navigate('/contests/create')}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold text-[13px] rounded-lg hover:bg-brand-dark transition shadow-sm active:scale-95">
                <Plus size={15} /> Create Contest
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ─── OVERVIEW ─────────────────────────────── */}
          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Users', value: stats?.users ?? '…', icon: <Users size={22} className="text-indigo-500" />, bg: 'bg-indigo-50' },
                  { label: 'Total Challenges', value: challenges.length, icon: <Code2 size={22} className="text-emerald-500" />, bg: 'bg-emerald-50' },
                  { label: 'Total Submissions', value: stats?.submissions ?? '…', icon: <BarChart2 size={22} className="text-amber-500" />, bg: 'bg-amber-50' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <p className="text-3xl font-black text-slate-900 mt-0.5">{s.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick navigation cards */}
              <div>
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Manage Challenges', desc: 'Add, edit, or delete coding challenges', tab: 'challenges' as AdminTab, color: 'brand-primary' },
                    { label: 'Manage Contests', desc: 'Edit contest details and prizes', tab: 'contests' as AdminTab, color: 'purple-600' },
                    { label: 'View Users', desc: 'See all registered accounts and stats', tab: 'users' as AdminTab, color: 'indigo-600' },
                  ].map(card => (
                    <button key={card.tab} onClick={() => setTab(card.tab)}
                      className="bg-white border border-slate-200 rounded-xl p-6 text-left hover:border-slate-400 hover:shadow-md transition-all group">
                      <p className="font-black text-slate-900 text-[15px] group-hover:text-brand-primary transition">{card.label}</p>
                      <p className="text-slate-500 text-[13px] mt-1">{card.desc}</p>
                      <p className="text-brand-primary text-[12px] font-bold mt-4 flex items-center gap-1">Go →</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── CHALLENGES ───────────────────────────── */}
          {tab === 'challenges' && (
            <div className="space-y-5">
              {/* Track filter pills */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterTrack('all')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition ${filterTrack === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:border-slate-700'}`}>
                  All ({challenges.length})
                </button>
                {tracks.map(t => (
                  <button key={t.id} onClick={() => setFilterTrack(t.id)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition ${filterTrack === t.id ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:border-slate-700'}`}>
                    {t.name} ({challenges.filter(c => c.track === t.id).length})
                  </button>
                ))}
              </div>

              {/* Challenges table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8fafc] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Track</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Points</th>
                      <th className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayChallenges.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono text-[12px]">{i + 1}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900 max-w-[280px]">{c.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {tracks.find(t => t.id === c.track)?.name ?? c.track}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${DIFF_BADGE[c.difficulty]}`}>{c.difficulty}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{c.category}</td>
                        <td className="px-6 py-4 text-center font-black text-slate-700">{c.points}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => setChallengeModal(c)}
                              className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setDeleteChallengeTarget(c)}
                              className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {displayChallenges.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-sm">No challenges found for this track.</div>
                )}
              </div>
            </div>
          )}

          {/* ─── TRACKS ────────────────────────────────── */}
          {tab === 'tracks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map(t => (
                <div key={t.id} onClick={() => { setTab('challenges'); setFilterTrack(t.id); }} className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all relative group cursor-pointer">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-4 group-hover:scale-110 transition-transform">
                    {t.icon ? <img src={t.icon} alt={t.name} className="w-full h-full object-contain" /> : <div className="text-xl font-black text-slate-300">{t.initials}</div>}
                  </div>
                  <h3 className="text-[17px] font-black text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">{t.name}</h3>
                  <p className="text-[13px] text-slate-500 font-medium line-clamp-2">{t.desc}</p>
                  
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setTrackModal(t); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTrackTarget(t); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── CONTESTS ─────────────────────────────── */}
          {tab === 'contests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contests.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 shadow-sm relative group hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-widest ${
                        c.type === 'Rated' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        c.type === 'Hiring' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>{c.type}</span>
                      <h3 className="text-[15px] font-black text-slate-900 mt-2 leading-tight">{c.title}</h3>
                      <p className="text-[12px] text-slate-500 mt-1">{c.date}</p>
                      <p className="text-[12px] text-slate-500">Prize: <span className="font-bold text-slate-700">{c.prize}</span></p>
                      <p className="text-[12px] text-slate-500">{c.participants} registered</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setContestModal(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => setDeleteContestTarget(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ─── USERS ────────────────────────────────── */}
          {tab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f8fafc] border-b border-slate-200">
                  <tr>
                    {['#', 'Name', 'Email', 'XP', 'Streak', 'Joined'].map(h => (
                      <th key={h} className="px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">Loading users…</td></tr>
                  )}
                  {dbUsers.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono text-[12px]">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary text-white text-[11px] font-black flex items-center justify-center shrink-0">
                            {(u.name || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900">{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4 font-black text-indigo-600">{u.xp ?? 0}</td>
                      <td className="px-6 py-4 text-slate-600">{u.streak ?? 0} days</td>
                      <td className="px-6 py-4 text-slate-400 text-[12px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────── */}
      <AnimatePresence>
        {challengeModal !== null && (
          <ChallengeModal
            initial={challengeModal}
            tracks={tracks}
            onSave={handleSaveChallenge}
            onClose={() => setChallengeModal(null)}
          />
        )}
        {deleteChallengeTarget && (
          <DeleteConfirm
            label={deleteChallengeTarget.title}
            onConfirm={() => { deleteChallenge(deleteChallengeTarget.id); setDeleteChallengeTarget(null); }}
            onCancel={() => setDeleteChallengeTarget(null)}
          />
        )}
        {contestModal && (
          <ContestModal
            initial={contestModal}
            onSave={handleSaveContest}
            onClose={() => setContestModal(null)}
          />
        )}
        {deleteContestTarget && (
          <DeleteConfirm
            label={deleteContestTarget.title}
            onConfirm={() => handleDeleteContest(deleteContestTarget)}
            onCancel={() => setDeleteContestTarget(null)}
          />
        )}
        {trackModal !== null && (
          <TrackModal initial={trackModal} onSave={handleSaveTrack} onClose={() => setTrackModal(null)} />
        )}
        {deleteTrackTarget && (
          <DeleteConfirm label={deleteTrackTarget.name} onConfirm={() => { contextDeleteTrack(deleteTrackTarget.id); setDeleteTrackTarget(null); }} onCancel={() => setDeleteTrackTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── TRACK MODAL ──────────────────────────────────────────────────
function TrackModal({
  initial, onSave, onClose
}: {
  initial: Partial<PracticeTrack>;
  onSave: (data: PracticeTrack) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<PracticeTrack>>({
    id: '', name: '', initials: '', desc: '', difficulty: 'Beginner to Advanced', icon: '', ...initial
  });
  const set = (k: keyof PracticeTrack, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="bg-[#f8fafc] rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]">
        <div className="bg-white px-10 pt-8 pb-6 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{initial.id ? 'Edit Track' : 'New Practice Track'}</h2>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Add a new language or skill track to the practice syllabus.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <div className="p-10 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Track ID (URL Slug)</label>
              <input value={form.id || ''} onChange={e => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} disabled={!!initial.id}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:outline-none focus:border-brand-primary disabled:opacity-50" placeholder="e.g. rust" />
            </div>
            <div>
              <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
              <input value={form.name || ''} onChange={e => set('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Rust" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Initials (Badge)</label>
              <input value={form.initials || ''} onChange={e => set('initials', e.target.value.toUpperCase().slice(0, 3))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:outline-none focus:border-brand-primary" placeholder="e.g. RS" />
            </div>
            <div>
              <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Difficulty Label</label>
              <input value={form.difficulty || ''} onChange={e => set('difficulty', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Beginner to Advanced" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Icon URL (SVG preferred)</label>
            <input value={form.icon || ''} onChange={e => set('icon', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-bold focus:bg-white focus:outline-none focus:border-brand-primary" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Description</label>
            <textarea value={form.desc || ''} onChange={e => set('desc', e.target.value)} rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] font-medium focus:bg-white focus:outline-none focus:border-brand-primary" placeholder="Describe the track..." />
          </div>
        </div>
        <div className="flex gap-4 px-10 py-6 border-t border-slate-100 bg-slate-50/50">
          <button onClick={() => { if (form.id && form.name) onSave(form as PracticeTrack); }}
            disabled={!form.id || !form.name}
            className="w-full py-4 bg-brand-primary text-white font-bold text-[14px] rounded-xl hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
            <Save size={18} /> {initial.id ? 'Save Track' : 'Create Track'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
