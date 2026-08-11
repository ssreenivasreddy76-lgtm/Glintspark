import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Code, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { subYears, isBefore, addDays } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

export default function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
  const [codeforcesStats, setCodeforcesStats] = useState<any>(null);

  useEffect(() => {
    async function fetchPlatformStats() {
      if (!user) return;
      try {
        if (user.leetcode) {
           const handle = user.leetcode.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (data.status === 'success') {
               setLeetcodeStats(data);
             }
           }
        }
      } catch (e) { console.error('Leetcode fetch error', e); }

      try {
        if (user.codeforces) {
           const handle = user.codeforces.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (data.status === 'OK' && data.result?.length > 0) {
               setCodeforcesStats(data.result[0]);
             }
           }
        }
      } catch (e) { console.error('Codeforces fetch error', e); }
    }
    fetchPlatformStats();
  }, [user?.leetcode, user?.codeforces]);

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

      <div className="space-y-8 mb-8">
        {/* Detailed Coding Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LeetCode */}
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="font-bold text-[#0e141e]">LeetCode</h4>
                  <p className={`text-xs ${user?.leetcode ? 'text-[#738f93]' : 'text-gray-400 italic'}`}>
                    {user?.leetcode ? `@${user.leetcode}` : 'Not linked'}
                  </p>
                </div>
              </div>
              {user?.leetcode && (
                <ExternalLink size={14} className="text-gray-400 hover:text-brand-primary cursor-pointer" />
              )}
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Solved</p>
                <p className="text-2xl font-black text-orange-500">{user?.leetcode ? (leetcodeStats ? leetcodeStats.totalSolved : '...') : '0'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Easy</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.leetcode ? (leetcodeStats ? leetcodeStats.easySolved : '...') : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Medium</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.leetcode ? (leetcodeStats ? leetcodeStats.mediumSolved : '...') : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hard</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.leetcode ? (leetcodeStats ? leetcodeStats.hardSolved : '...') : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Acceptance</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.leetcode ? (leetcodeStats ? `${leetcodeStats.acceptanceRate}%` : '...') : '0%'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Rank</p>
                <p className="text-sm font-bold text-[#0e141e]">{user?.leetcode ? (leetcodeStats ? leetcodeStats.ranking : '...') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Codeforces */}
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://cdn.iconscout.com/icon/free/png-256/code-forces-3628695-3029920.png" alt="Codeforces" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="font-bold text-[#0e141e]">Codeforces</h4>
                  <p className={`text-xs ${user?.codeforces ? 'text-[#738f93]' : 'text-gray-400 italic'}`}>
                    {user?.codeforces ? `@${user.codeforces}` : 'Not linked'}
                  </p>
                </div>
              </div>
              {user?.codeforces && (
                <ExternalLink size={14} className="text-gray-400 hover:text-brand-primary cursor-pointer" />
              )}
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                <p className="text-2xl font-black text-blue-500">{user?.codeforces ? (codeforcesStats ? codeforcesStats.rating : '...') : '0'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Max Rating</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codeforces ? (codeforcesStats ? codeforcesStats.maxRating : '...') : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rank</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codeforces ? (codeforcesStats ? codeforcesStats.rank : '...') : 'Unrated'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Max Rank</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codeforces ? (codeforcesStats ? codeforcesStats.maxRank : '...') : 'Unrated'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contributions</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codeforces ? (codeforcesStats ? codeforcesStats.contribution : '...') : '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CodeChef */}
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700"></div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://cdn.simpleicons.org/codechef/5B4638" alt="CodeChef" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="font-bold text-[#0e141e]">CodeChef</h4>
                  <p className={`text-xs ${user?.codechef ? 'text-[#738f93]' : 'text-gray-400 italic'}`}>
                    {user?.codechef ? `@${user.codechef}` : 'Not linked'}
                  </p>
                </div>
              </div>
              {user?.codechef && (
                <ExternalLink size={14} className="text-gray-400 hover:text-brand-primary cursor-pointer" />
              )}
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                <p className="text-2xl font-black text-amber-600">{user?.codechef ? '1340' : '0'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Highest</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '1420' : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stars</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '2★' : '0★'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solved</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '45' : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Rank</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '54,231' : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* GeeksForGeeks */}
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-600"></div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg" alt="GeeksForGeeks" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="font-bold text-[#0e141e]">GeeksForGeeks</h4>
                  <p className={`text-xs ${user?.gfg ? 'text-[#738f93]' : 'text-gray-400 italic'}`}>
                    {user?.gfg ? `@${user.gfg}` : 'Not linked'}
                  </p>
                </div>
              </div>
              {user?.gfg && (
                <ExternalLink size={14} className="text-gray-400 hover:text-brand-primary cursor-pointer" />
              )}
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-black text-green-600">{user?.gfg ? '588' : '0'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solved</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? '281' : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Inst. Rank</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? '18' : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Score</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? '42' : '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* HackerRank */}
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png" alt="HackerRank" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="font-bold text-[#0e141e]">HackerRank</h4>
                  <p className={`text-xs ${user?.hackerrank ? 'text-[#738f93]' : 'text-gray-400 italic'}`}>
                    {user?.hackerrank ? `@${user.hackerrank}` : 'Not linked'}
                  </p>
                </div>
              </div>
              {user?.hackerrank && (
                <ExternalLink size={14} className="text-gray-400 hover:text-brand-primary cursor-pointer" />
              )}
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-black text-emerald-500">{user?.hackerrank ? '20' : '0'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? '5' : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Badges</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? '2' : '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certs</p>
                  <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? '0' : '0'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Comparison Radar Chart */}
          <div className="bg-white border border-[#d1d5db] rounded-xl shadow-sm p-6 flex flex-col">
            <h4 className="font-bold text-[#0e141e] mb-4 text-center">Platform Comparison</h4>
            <div className="flex-1 w-full flex items-center justify-center min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                  { subject: 'LeetCode', A: user?.leetcode ? 85 : 0, fullMark: 100 },
                  { subject: 'Codeforces', A: user?.codeforces ? 40 : 0, fullMark: 100 },
                  { subject: 'CodeChef', A: user?.codechef ? 60 : 0, fullMark: 100 },
                  { subject: 'GFG', A: user?.gfg ? 90 : 0, fullMark: 100 },
                  { subject: 'HackerRank', A: user?.hackerrank ? 50 : 0, fullMark: 100 },
                  { subject: 'Glintspark', A: user ? 80 : 0, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Platform Stats" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Submission Activity Heatmap */}
        <div className="bg-white border border-[#d1d5db] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-[#0e141e]">Submission Activity</h4>
            <div className="text-xs text-[#738f93]">
              <span className="font-bold text-[#0e141e] mr-1">{submissions.length}</span> total submissions
            </div>
          </div>
          <div className="flex justify-center overflow-x-auto pb-4">
            {(() => {
              // Generate mock data for the calendar + user submissions
              const generateHeatmapData = () => {
                const data = [];
                const today = new Date();
                const startDate = subYears(today, 1);
                let curr = startDate;
                while (isBefore(curr, today) || curr.getTime() === today.getTime()) {
                  // If we want random mock data we can add it, but since they asked for actual submissions, let's use actual array
                  // We map actual dates from `submissions` array
                  const dateStr = curr.toISOString().split('T')[0];
                  const subsOnDate = submissions.filter(s => new Date(s.created_at).toISOString().split('T')[0] === dateStr).length;
                  
                  data.push({
                    date: dateStr,
                    count: subsOnDate,
                    level: Math.min(subsOnDate, 4) // cap level at 4
                  });
                  curr = addDays(curr, 1);
                }
                return data;
              };
              
              return (
                <ActivityCalendar 
                  data={generateHeatmapData()}
                  theme={{
                    light: ['#ebedf0', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'],
                    dark: ['#1e293b', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed']
                  }}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={12}
                  showWeekdayLabels
                  renderBlock={(block, activity) => 
                    React.cloneElement(block, {
                      'data-tooltip-id': 'react-tooltip',
                      'data-tooltip-content': `${activity.date}: ${activity.count} submissions`,
                    })
                  }
                />
              );
            })()}
            <Tooltip id="react-tooltip" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0e141e]">Recent Submissions</h2>
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
