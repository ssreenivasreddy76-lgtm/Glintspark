import React from 'react';
import { useChallenges } from '../contexts/ChallengesContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Props {
  onAdd: () => void;
  onEdit: (q: any) => void;
  onDelete: (q: any) => void;
}

export function AdminPracticeQuestions({ onAdd, onEdit, onDelete }: Props) {
  const { challenges } = useChallenges();
  const practiceQuestions = challenges.filter(c => c.isPractice !== false);

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Practice Questions Management</h2>
          <p className="text-sm text-slate-500">View standalone practice coding questions grouped by topic.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Topic / Category</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4">Points</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {practiceQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No practice questions found. Add some from the Challenges tab.
                </td>
              </tr>
            ) : (
              practiceQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{q.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[12px] font-semibold">
                      {q.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[12px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${
                      q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600">{q.points}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(q)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(q)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
