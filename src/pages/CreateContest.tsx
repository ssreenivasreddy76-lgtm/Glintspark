import { useState } from 'react';
import { supabaseDB } from '../services/supabaseService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Calendar, Clock, Users, Globe, Lock,
  ChevronRight, ChevronLeft, Check, Plus, Search,
  Settings, FileText, Eye, Zap, X, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Challenge pool to pick from ─────────────────────────────
const challengePool = [
  { id: 'hello-world-js', title: 'Hello World (JS Foundations)', difficulty: 'Easy', topic: 'JavaScript', points: 10 },
  { id: 'arithmetic-operators', title: 'Arithmetic Operators', difficulty: 'Easy', topic: 'JavaScript', points: 15 },
  { id: 'loops-iteration', title: 'Loops & Iteration', difficulty: 'Medium', topic: 'JavaScript', points: 25 },
  { id: 'js-promises', title: 'JavaScript Promises & Async/Await', difficulty: 'Hard', topic: 'JavaScript', points: 60 },
  { id: 'sum-and-difference', title: 'Sum and Difference of Two Numbers', difficulty: 'Easy', topic: 'C', points: 10 },
  { id: '1d-arrays', title: '1D Arrays in C', difficulty: 'Medium', topic: 'C', points: 30 },
  { id: 'querying-document', title: 'Querying the Document', difficulty: 'Hard', topic: 'C', points: 50 },
  { id: 'revising-select', title: 'Revising the Select Query', difficulty: 'Easy', topic: 'SQL', points: 10 },
  { id: 'the-pads', title: 'The PADS (String Manipulation)', difficulty: 'Medium', topic: 'SQL', points: 25 },
  { id: 'print-linked-list', title: 'Print Elements of a Linked List', difficulty: 'Easy', topic: 'DSA', points: 15 },
  { id: 'tree-preorder', title: 'Tree: Preorder Traversal', difficulty: 'Medium', topic: 'DSA', points: 35 },
  { id: 'array-manipulation', title: 'Array Manipulation (Segment Tree)', difficulty: 'Hard', topic: 'DSA', points: 60 },
  { id: 'python-division', title: 'Python: Division & Operators', difficulty: 'Easy', topic: 'Python', points: 10 },
  { id: 'matrix-script', title: 'Matrix Script (Regex Parsing)', difficulty: 'Hard', topic: 'Python', points: 60 },
  { id: 'java-stdin-stdout', title: 'Java Stdin and Stdout', difficulty: 'Easy', topic: 'Java', points: 10 },
];

const diffColor: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  Hard: 'text-rose-600 bg-rose-50 border-rose-200',
};

const steps = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Settings', icon: Settings },
  { id: 3, label: 'Problems', icon: Zap },
  { id: 4, label: 'Review', icon: Eye },
];

// ── Reusable form input ─────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[14px] font-bold text-slate-900">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-slate-500 font-medium">{hint}</p>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function CreateContest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customPoints, setCustomPoints] = useState<Record<string, number | ''>>({});

  // Form state
  const [form, setForm] = useState({
    name: '',
    type: 'Rated',
    visibility: 'Public',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
    maxParticipants: '',
    scoringType: 'Partial',
    negativeMarking: false,
    negativeMarksEasy: '0',
    negativeMarksMedium: '0',
    negativeMarksHard: '0',
    showLeaderboard: true,
    allowRegistration: true,
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const toggleChallenge = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredPool = challengePool.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.topic.toLowerCase().includes(search.toLowerCase())
  );

  const selectedChallenges = challengePool.filter(c => selectedIds.includes(c.id));
  const totalPoints = selectedChallenges.reduce((s, c) => {
    const pts = customPoints[c.id] !== undefined ? customPoints[c.id] : c.points;
    return s + (Number(pts) || 0);
  }, 0);

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 3 && form.startDate && form.endDate;
    if (step === 3) return selectedIds.length > 0;
    return true;
  };

  const handlePublish = async () => {
    const newContest = {
      id: `custom-${Date.now()}`,
      title: form.name,
      date: `${form.startDate} ${form.startTime}`,
      prize: `${totalPoints} Points`,
      participants: '0',
      type: form.type,
      color: form.type === 'Hiring' ? 'purple' : 'indigo',
      problems: selectedIds,
    };
    const existing = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
    localStorage.setItem('glintspark_contests', JSON.stringify([newContest, ...existing]));
    try {
      await supabaseDB.addContest({
        id: newContest.id,
        title: newContest.title,
        date: newContest.date,
        prize: newContest.prize,
        participants: newContest.participants,
        type: newContest.type,
        source: 'custom'
      });
    } catch (err) {
      console.error("Failed to publish contest to Supabase:", err);
    }
    navigate('/contests');
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32 font-sans selection:bg-brand-primary/20">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Contest</h1>
              <p className="text-[13px] text-slate-500 font-medium">Set up a new coding contest for your community</p>
            </div>
          </div>
          <button onClick={() => navigate('/contests')} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition border border-slate-200">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* ── Horizontal Stepper ── */}
        <div className="mb-12">
          <div className="relative flex justify-between items-center w-full px-4">
            {/* Background Line */}
            <div className="absolute left-4 right-4 top-5 -translate-y-1/2 h-[3px] bg-slate-200 rounded-full" />
            {/* Active Progress Line */}
            <div 
              className="absolute left-4 top-5 -translate-y-1/2 h-[3px] bg-brand-primary transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 2rem)` }} 
            />
            
            {steps.map(s => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 w-24">
                  <button 
                    onClick={() => done && setStep(s.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${done ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30 scale-100 hover:scale-105' : active ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-110' : 'bg-white border-[3px] border-slate-200 text-slate-400 scale-100'}`}
                  >
                    {done ? <Check size={18} /> : s.id}
                  </button>
                  <span className={`text-[13px] font-bold transition-colors ${active ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Form Container ── */}
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step Header */}
              <div className="px-10 py-8 border-b border-slate-100/60 bg-white">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{steps[step - 1].label}</h2>
                <p className="text-[15px] text-slate-500 font-medium mt-1">
                  {step === 1 && "Fill out the foundational details of your contest."}
                  {step === 2 && "Configure rules, scoring, and visibility."}
                  {step === 3 && "Select challenges from the problem bank."}
                  {step === 4 && "Review your configuration before publishing."}
                </p>
              </div>

              <div className="px-10 py-10 space-y-8 bg-white min-h-[400px]">

                {/* ─── STEP 1: Basic Info ─────────────────── */}
                {step === 1 && (
                  <>
                    <Field label="Contest Name *" hint="Use a clear and descriptive name (min 4 characters)">
                      <input
                        value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Weekly Contest 413"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium placeholder:text-slate-400"
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Start Date *">
                        <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                      </Field>
                      <Field label="Start Time">
                        <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                      </Field>
                      <Field label="End Date *">
                        <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                      </Field>
                      <Field label="End Time">
                        <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                      </Field>
                    </div>

                    <Field label="Description" hint="Briefly explain what participants should expect.">
                      <textarea
                        rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder="Describe your contest goals, theme, or rules..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium placeholder:text-slate-400 resize-none"
                      />
                    </Field>
                  </>
                )}

                {/* ─── STEP 2: Settings ───────────────────── */}
                {step === 2 && (
                  <>
                    <Field label="Visibility">
                      <div className="flex gap-4">
                        {[{ val: 'Public', Icon: Globe }, { val: 'Private', Icon: Lock }].map(({ val, Icon }) => (
                          <button
                            key={val}
                            onClick={() => set('visibility', val)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-bold border-2 transition-all ${form.visibility === val ? 'bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            <Icon size={18} /> {val}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Max Participants" hint="Leave blank for unlimited.">
                      <input
                        type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium placeholder:text-slate-400"
                      />
                    </Field>

                    <Field label="Scoring Type">
                      <div className="flex gap-4">
                        {['Partial', 'Full', 'Time-based'].map(t => (
                          <button
                            key={t}
                            onClick={() => set('scoringType', t)}
                            className={`flex-1 py-4 rounded-xl text-[14px] font-bold border-2 transition-all ${form.scoringType === t ? 'bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {/* Toggles */}
                    <div className="space-y-4 pt-4">
                      {[
                        { key: 'negativeMarking', label: 'Negative Marking', desc: 'Deduct points for wrong answers' },
                        { key: 'showLeaderboard', label: 'Live Leaderboard', desc: 'Show real-time rankings during contest' },
                        { key: 'allowRegistration', label: 'Open Registration', desc: 'Allow participants to self-register' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className={`border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 ${form.negativeMarking && key === 'negativeMarking' ? 'ring-2 ring-brand-primary/20' : ''}`}>
                          <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="text-[15px] font-bold text-slate-900">{label}</p>
                              <p className="text-[13px] text-slate-500 mt-1">{desc}</p>
                            </div>
                            <button
                              onClick={() => set(key, !(form as any)[key])}
                              className={`w-14 h-7 rounded-full transition-colors relative border ${
                                (form as any)[key] ? 'bg-brand-primary border-brand-primary' : 'bg-slate-200 border-slate-300'
                              }`}
                            >
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(form as any)[key] ? 'left-[26px]' : 'left-1'}`} />
                            </button>
                          </div>
                          
                          {/* Expanded content for Negative Marking */}
                          {key === 'negativeMarking' && form.negativeMarking && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-[13px] font-bold text-slate-700 mb-4">Penalty per incorrect submission:</p>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[12px] font-bold text-emerald-600 block mb-1.5">Easy</label>
                                    <div className="relative">
                                      <input type="number" max="0" value={form.negativeMarksEasy} onChange={e => set('negativeMarksEasy', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="0" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[12px] font-bold text-amber-600 block mb-1.5">Medium</label>
                                    <div className="relative">
                                      <input type="number" max="0" value={form.negativeMarksMedium} onChange={e => set('negativeMarksMedium', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="0" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[12px] font-bold text-rose-600 block mb-1.5">Hard</label>
                                    <div className="relative">
                                      <input type="number" max="0" value={form.negativeMarksHard} onChange={e => set('negativeMarksHard', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" placeholder="0" />
                                    </div>
                                  </div>
                                </div>
                             </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ─── STEP 3: Problems ───────────────────── */}
                {step === 3 && (
                  <>
                    <div className="flex items-center justify-between mb-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5">
                      <div>
                        <p className="text-[15px] font-black text-slate-900">Selection Summary</p>
                        <p className="text-[13px] text-slate-500 font-medium">Select at least 1 problem for your contest.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-brand-primary">{selectedIds.length}</span>
                        <span className="text-[13px] text-slate-500 font-bold ml-1">selected</span>
                        <div className="text-[14px] font-bold text-slate-700">{totalPoints} pts total</div>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title or topic..."
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[15px] focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium placeholder:text-slate-400"
                      />
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-12 text-[12px] font-black uppercase tracking-widest text-slate-500">
                        <span className="col-span-1" />
                        <span className="col-span-5">Problem</span>
                        <span className="col-span-2">Topic</span>
                        <span className="col-span-2">Difficulty</span>
                        <span className="col-span-2 text-right">Points</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                        {filteredPool.map(c => {
                          const selected = selectedIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => toggleChallenge(c.id)}
                              className={`grid grid-cols-12 items-center px-6 py-4 cursor-pointer transition-all ${selected ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                            >
                              <div className="col-span-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? 'bg-brand-primary border-brand-primary' : 'border-slate-300'}`}>
                                  {selected && <Check size={12} className="text-white" />}
                                </div>
                              </div>
                              <span className="col-span-5 text-[15px] font-bold truncate pr-4 text-slate-800">{c.title}</span>
                              <span className="col-span-2 text-[13px] text-slate-500 font-medium">{c.topic}</span>
                              <span className={`col-span-2 text-[12px] font-black px-2.5 py-1 rounded-md border w-fit ${diffColor[c.difficulty]}`}>{c.difficulty}</span>
                              <div className="col-span-2 text-right flex justify-end" onClick={e => e.stopPropagation()}>
                                {selected ? (
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={customPoints[c.id] !== undefined ? customPoints[c.id] : c.points} 
                                    onChange={e => {
                                      const val = e.target.value;
                                      setCustomPoints(prev => ({ ...prev, [c.id]: val === '' ? '' : Number(val) }));
                                    }}
                                    className="w-16 px-2 py-1 bg-white border border-brand-primary/40 rounded-lg text-right text-[14px] font-black text-brand-primary focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all shadow-sm"
                                  />
                                ) : (
                                  <span className="text-[15px] font-black text-slate-400">+{c.points}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ─── STEP 4: Review ─────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-[17px] text-emerald-800 font-black">Ready to Publish</h3>
                        <p className="text-[14px] text-emerald-700/80 font-medium mt-1">Your contest is ready to go live. Review the details below to ensure everything is correct.</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                      {[
                        { label: 'Contest Name', value: form.name || '—' },
                        { label: 'Visibility', value: form.visibility },
                        { label: 'Start', value: form.startDate ? `${form.startDate} ${form.startTime || ''}` : '—' },
                        { label: 'End', value: form.endDate ? `${form.endDate} ${form.endTime || ''}` : '—' },
                        { label: 'Scoring', value: form.scoringType },
                        { label: 'Max Participants', value: form.maxParticipants || 'Unlimited' },
                        { label: 'Problems', value: `${selectedIds.length} selected (${totalPoints} pts)` },
                        { label: 'Live Leaderboard', value: form.showLeaderboard ? 'Yes' : 'No' },
                        { label: 'Negative Marking', value: form.negativeMarking ? `Yes (Easy: ${form.negativeMarksEasy || 0}, Med: ${form.negativeMarksMedium || 0}, Hard: ${form.negativeMarksHard || 0})` : 'No' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-4 px-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                          <span className="text-[15px] text-slate-500 font-bold">{label}</span>
                          <span className="text-[15px] font-black text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation footer */}
          <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-[15px] font-bold text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-white hover:text-slate-900 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            {step < 4 ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-10 py-3 text-[15px] font-black text-white bg-brand-primary rounded-xl hover:bg-brand-dark transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-brand-primary/30"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-10 py-3 text-[15px] font-black text-white bg-brand-primary rounded-xl hover:bg-brand-dark transition active:scale-95 shadow-lg shadow-brand-primary/30"
              >
                <Zap size={18} fill="currentColor" /> Publish Contest
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
