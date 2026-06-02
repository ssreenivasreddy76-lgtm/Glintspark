import { useState } from 'react';
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
    <div className="space-y-1.5">
      <label className="text-[13px] font-bold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function CreateContest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const totalPoints = selectedChallenges.reduce((s, c) => s + c.points, 0);

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 3 && form.startDate && form.endDate;
    if (step === 3) return selectedIds.length > 0;
    return true;
  };

  const handlePublish = () => {
    const newContest = {
      id: `custom-${Date.now()}`,
      title: form.name,
      date: `${form.startDate} ${form.startTime}`,
      prize: 'To be announced',
      participants: '0',
      type: form.type,
      color: form.type === 'Hiring' ? 'purple' : 'indigo',
      problems: selectedIds,
    };
    const existing = JSON.parse(localStorage.getItem('glintspark_contests') || '[]');
    localStorage.setItem('glintspark_contests', JSON.stringify([newContest, ...existing]));
    navigate('/contests');
  };

  return (
    <div className="bg-[#f3f7f7] min-h-screen pb-24">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-brand-primary" />
            </div>
            <div>
              <h1 className="text-[17px] font-black text-slate-900">Create Contest</h1>
              <p className="text-[11px] text-slate-400">Set up a new coding contest for your community</p>
            </div>
          </div>
          <button onClick={() => navigate('/contests')} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col lg:flex-row gap-8">

        {/* ── LEFT: Step sidebar ── */}
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {steps.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => done && setStep(s.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left border-b border-slate-100 last:border-0 transition-colors ${active ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : 'hover:bg-slate-50'} ${!done && !active ? 'cursor-default' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-colors ${done ? 'bg-brand-primary text-white' : active ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? <Check size={13} /> : s.id}
                  </div>
                  <div>
                    <div className={`text-[12px] font-bold ${active ? 'text-brand-primary' : done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Summary box (only step 3+) */}
          {step >= 3 && selectedIds.length > 0 && (
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Selection</p>
              <p className="text-[13px] font-bold text-slate-800">{selectedIds.length} Problems</p>
              <p className="text-[13px] font-bold text-brand-primary">{totalPoints} Total Points</p>
            </div>
          )}
        </aside>

        {/* ── RIGHT: Step content ── */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Step header */}
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/60">
                <h2 className="text-[18px] font-black text-slate-900">{steps[step - 1].label}</h2>
                <p className="text-[13px] text-slate-400 mt-0.5">Step {step} of {steps.length}</p>
              </div>

              <div className="px-8 py-8 space-y-7">

                {/* ─── STEP 1: Basic Info ─────────────────── */}
                {step === 1 && (
                  <>
                    <Field label="Contest Name *" hint="Use a clear and descriptive name (min 4 characters)">
                      <input
                        value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Weekly Contest 413"
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                      />
                    </Field>

                    <Field label="Contest Type">
                      <div className="flex gap-3">
                        {['Rated', 'Hiring', 'Practice'].map(t => (
                          <button
                            key={t}
                            onClick={() => set('type', t)}
                            className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold border transition ${form.type === t ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Start Date *">
                        <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition" />
                      </Field>
                      <Field label="Start Time">
                        <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition" />
                      </Field>
                      <Field label="End Date *">
                        <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition" />
                      </Field>
                      <Field label="End Time">
                        <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition" />
                      </Field>
                    </div>

                    <Field label="Description" hint="Briefly explain what participants should expect.">
                      <textarea
                        rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder="Describe your contest goals, theme, or rules..."
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition resize-none"
                      />
                    </Field>
                  </>
                )}

                {/* ─── STEP 2: Settings ───────────────────── */}
                {step === 2 && (
                  <>
                    <Field label="Visibility">
                      <div className="flex gap-3">
                        {[{ val: 'Public', Icon: Globe }, { val: 'Private', Icon: Lock }].map(({ val, Icon }) => (
                          <button
                            key={val}
                            onClick={() => set('visibility', val)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[12px] font-bold border transition ${form.visibility === val ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary'}`}
                          >
                            <Icon size={14} /> {val}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Max Participants" hint="Leave blank for unlimited.">
                      <input
                        type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                      />
                    </Field>

                    <Field label="Scoring Type">
                      <div className="flex gap-3">
                        {['Partial', 'Full', 'Time-based'].map(t => (
                          <button
                            key={t}
                            onClick={() => set('scoringType', t)}
                            className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold border transition ${form.scoringType === t ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {/* Toggles */}
                    <div className="space-y-4 pt-2">
                      {[
                        { key: 'negativeMarking', label: 'Negative Marking', desc: 'Deduct points for wrong answers' },
                        { key: 'showLeaderboard', label: 'Live Leaderboard', desc: 'Show real-time rankings during contest' },
                        { key: 'allowRegistration', label: 'Open Registration', desc: 'Allow participants to self-register' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                          <div>
                            <p className="text-[13px] font-bold text-slate-800">{label}</p>
                            <p className="text-[11px] text-slate-400">{desc}</p>
                          </div>
                          <button
                            onClick={() => set(key, !(form as any)[key])}
                            className={`w-11 h-6 rounded-full transition-colors relative ${(form as any)[key] ? 'bg-brand-primary' : 'bg-slate-200'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${(form as any)[key] ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ─── STEP 3: Problems ───────────────────── */}
                {step === 3 && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] text-slate-500">Select at least 1 problem for your contest.</p>
                      <span className="text-[12px] font-bold text-brand-primary">{selectedIds.length} selected · {totalPoints} pts</span>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title or topic..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition"
                      />
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="col-span-1" />
                        <span className="col-span-5">Problem</span>
                        <span className="col-span-2">Topic</span>
                        <span className="col-span-2">Difficulty</span>
                        <span className="col-span-2 text-right">Points</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {filteredPool.map(c => {
                          const selected = selectedIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => toggleChallenge(c.id)}
                              className={`grid grid-cols-12 items-center px-5 py-3.5 cursor-pointer transition-colors ${selected ? 'bg-brand-primary/5' : 'hover:bg-slate-50'}`}
                            >
                              <div className="col-span-1">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selected ? 'bg-brand-primary border-brand-primary' : 'border-slate-300'}`}>
                                  {selected && <Check size={10} className="text-white" />}
                                </div>
                              </div>
                              <span className={`col-span-5 text-[13px] font-semibold truncate ${selected ? 'text-brand-primary' : 'text-slate-800'}`}>{c.title}</span>
                              <span className="col-span-2 text-[12px] text-slate-400 font-medium">{c.topic}</span>
                              <span className={`col-span-2 text-[11px] font-bold px-2 py-0.5 rounded border w-fit ${diffColor[c.difficulty]}`}>{c.difficulty}</span>
                              <span className="col-span-2 text-right text-[13px] font-bold text-slate-700">+{c.points}</span>
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
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                      <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-emerald-700 font-semibold">Your contest is ready to publish. Review the details below before going live.</p>
                    </div>

                    {[
                      { label: 'Contest Name', value: form.name || '—' },
                      { label: 'Type', value: form.type },
                      { label: 'Visibility', value: form.visibility },
                      { label: 'Start', value: form.startDate ? `${form.startDate} ${form.startTime || ''}` : '—' },
                      { label: 'End', value: form.endDate ? `${form.endDate} ${form.endTime || ''}` : '—' },
                      { label: 'Scoring', value: form.scoringType },
                      { label: 'Max Participants', value: form.maxParticipants || 'Unlimited' },
                      { label: 'Problems', value: `${selectedIds.length} selected (${totalPoints} pts)` },
                      { label: 'Live Leaderboard', value: form.showLeaderboard ? 'Yes' : 'No' },
                      { label: 'Negative Marking', value: form.negativeMarking ? 'Yes' : 'No' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <span className="text-[13px] text-slate-500 font-medium">{label}</span>
                        <span className="text-[13px] font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation footer */}
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <button
                  onClick={() => step > 1 && setStep(s => s - 1)}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} /> Previous
                </button>

                {step < 4 ? (
                  <button
                    onClick={() => canNext() && setStep(s => s + 1)}
                    disabled={!canNext()}
                    className="flex items-center gap-2 px-7 py-2.5 text-[12px] font-black text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    Continue <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-7 py-2.5 text-[12px] font-black text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-600/20"
                  >
                    <Zap size={15} /> Publish Contest
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
