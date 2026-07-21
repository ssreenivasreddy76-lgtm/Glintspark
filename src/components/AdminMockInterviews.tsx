import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminMockInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [editingInterview, setEditingInterview] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mock_interviews_templates');
    if (saved) {
      try {
        setInterviews(JSON.parse(saved));
      } catch {
        setInterviews([]);
      }
    } else {
      const initial = [
        { id: 'mi-1', title: 'Senior React Engineer', role: 'Frontend', difficulty: 'Hard', techStack: 'React, TypeScript, Redux', prompt: 'You are a strict technical interviewer from FAANG. Ask deep questions about React reconciliation, hooks, and performance optimization.' },
        { id: 'mi-2', title: 'System Design Architect', role: 'Backend', difficulty: 'Hard', techStack: 'System Design, Microservices', prompt: 'You are a Staff Engineer evaluating system design. Focus on scalability, fault tolerance, and database choice for a high-throughput system.' },
        { id: 'mi-3', title: 'Data Structures & Algos', role: 'General', difficulty: 'Medium', techStack: 'DSA, Problem Solving', prompt: 'You are a friendly interviewer. Ask algorithmic questions and hint the candidate towards the optimal time complexity.' },
      ];
      setInterviews(initial);
      localStorage.setItem('mock_interviews_templates', JSON.stringify(initial));
    }
  }, []);

  const saveToStorage = (newInterviews: any[]) => {
    localStorage.setItem('mock_interviews_templates', JSON.stringify(newInterviews));
    setInterviews(newInterviews);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mock interview template?')) {
      saveToStorage(interviews.filter(i => i.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Mock Interview Templates</h2>
          <p className="text-sm text-slate-500">Create AI personas and templates for mock technical interviews.</p>
        </div>
        <button 
          onClick={() => setEditingInterview({ id: '', title: '', role: '', difficulty: 'Medium', techStack: '', prompt: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
        >
          <Plus size={16} /> Add Template
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Title & Role</th>
              <th className="px-6 py-4">Tech Stack</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {interviews.map((interview) => (
              <tr key={interview.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{interview.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{interview.role}</p>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">{interview.techStack}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    interview.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                    interview.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {interview.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingInterview(interview)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(interview.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {interviews.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No interview templates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingInterview && (
          <InterviewModal 
            initial={editingInterview}
            onSave={(data) => {
              const id = data.id || `mi-${Date.now()}`;
              const updated = { ...data, id };
              let newInterviews = [...interviews];
              if (data.id) {
                newInterviews = newInterviews.map(i => i.id === id ? updated : i);
              } else {
                newInterviews.push(updated);
              }
              saveToStorage(newInterviews);
              setEditingInterview(null);
            }}
            onClose={() => setEditingInterview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InterviewModal({ initial, onSave, onClose }: { initial: any, onSave: (data: any) => void, onClose: () => void }) {
  const [form, setForm] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-slate-900">{form.id ? 'Edit Template' : 'Add Template'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
        </div>
        
        <div className="px-8 py-6 flex-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title (e.g. Senior React Engineer)</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role Category</label>
              <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Frontend, Backend..." className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tech Stack / Focus Areas</label>
            <input value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} placeholder="e.g. React, TypeScript, Redux" className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">AI System Prompt / Instructions</label>
            <textarea value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5" rows={4} placeholder="You are an expert interviewer..." />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={() => form.title.trim() && onSave(form)} disabled={!form.title.trim()} className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary disabled:opacity-50">
            Save Template
          </button>
        </div>
      </motion.div>
    </div>
  );
}
