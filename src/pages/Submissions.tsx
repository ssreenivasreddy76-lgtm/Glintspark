import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Code, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

export default function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        // Fetch all solved challenges for this user, including created_at date
        const { data, error } = await supabase
          .from('solved_challenges')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching submissions:", error);
        } else if (data) {
          setSubmissions(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0e141e] mb-2 flex items-center gap-3">
            <Code className="text-brand-primary" size={32} />
            My Submissions
          </h1>
          <p className="text-[#738f93]">Track your coding journey and past solutions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-[#d1d5db] shadow-sm">
          <p className="text-sm text-[#738f93] font-bold uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-black text-[#0e141e]">{submissions.length}</p>
        </div>
      </div>

      <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <CheckCircle size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-bold text-[#0e141e]">No submissions yet</p>
            <p className="mt-2 text-sm">Start practicing challenges to see your submissions here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f7f7] border-b border-[#d1d5db]">
                  <th className="p-4 font-bold text-[#0e141e] text-sm uppercase tracking-wider">Date & Time</th>
                  <th className="p-4 font-bold text-[#0e141e] text-sm uppercase tracking-wider">Challenge ID</th>
                  <th className="p-4 font-bold text-[#0e141e] text-sm uppercase tracking-wider">Language</th>
                  <th className="p-4 font-bold text-[#0e141e] text-sm uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={sub.id || idx} 
                    className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-[#0e141e] font-medium">
                        <Calendar size={16} className="text-[#738f93]" />
                        {new Date(sub.created_at).toLocaleDateString()}
                        <span className="text-xs text-[#738f93] flex items-center gap-1 ml-2">
                          <Clock size={12} />
                          {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm bg-slate-100 text-[#0e141e] px-2 py-1 rounded">
                        {sub.challenge_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold capitalize text-brand-primary">
                        {sub.language}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${sub.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sub.status === 'PASS' ? 'Accepted' : 'Failed'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
