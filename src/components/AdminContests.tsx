import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';

export function AdminContests() {
  const [contests, setContests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dbContests = await firebaseDB.getContests();
        if (dbContests && dbContests.length > 0) {
          setContests(dbContests);
        }
      } catch (e) {
        console.error("Failed to fetch contests", e);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contest?')) {
      try {
        await firebaseDB.deleteContest(id);
        const newContests = contests.filter(c => c.id !== id);
        setContests(newContests);
      } catch (err) {
        console.error("Failed to delete contest:", err);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 ">Contest Management</h2>
          <p className="text-sm text-slate-500 ">View and manage competitive coding arenas.</p>
        </div>
        <button 
          onClick={() => navigate('/contests/create', { state: { fromAdmin: true } })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
        >
          <Plus size={16} /> Create Contest
        </button>
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200  text-slate-500  text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Title & Type</th>
              <th className="px-6 py-4">Schedule</th>
              <th className="px-6 py-4">Prize</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                  Loading contests...
                </td>
              </tr>
            ) : contests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                  No contests found. Click "Create Contest" to build one!
                </td>
              </tr>
            ) : contests.map((contest) => (
              <tr key={contest.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 ">{contest.title || contest.name}</div>
                  <div className="text-xs text-slate-500  mt-0.5">{contest.type} • {contest.visibility}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-700  font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {contest.startDate || contest.date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-700  font-medium">
                    <Trophy size={14} className="text-amber-500" />
                    {contest.prize || 'Standard Glintos'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(contest.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
