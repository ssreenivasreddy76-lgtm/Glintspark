import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ArrowUpRight, Search, ChevronRight, Globe, Users, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const leaders = [
  { rank: 1, name: 'Alex_Dev', points: 15420, streak: 124, country: 'USA', level: 'Diamond' },
  { rank: 2, name: 'SarahCodes', points: 14850, streak: 89, country: 'CAN', level: 'Platinum' },
  { rank: 3, name: 'K_Master', points: 12100, streak: 45, country: 'GER', level: 'Platinum' },
  { rank: 4, name: 'DebugDivina', points: 11950, streak: 210, country: 'UK', level: 'Gold' },
  { rank: 5, name: 'BitWiz', points: 10500, streak: 32, country: 'FRA', level: 'Gold' },
  { rank: 6, name: 'PixelPusha', points: 9800, streak: 15, country: 'NLD', level: 'Silver' },
  { rank: 7, name: 'CodeRunner', points: 9450, streak: 67, country: 'ITA', level: 'Silver' },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'global' | 'monthly' | 'my-score'>('global');

  // Filter data based on active tab
  const getFilteredLeaders = () => {
    if (activeTab === 'global') return leaders;
    if (activeTab === 'monthly') return leaders.slice(0, 4); // Mock monthly data
    if (activeTab === 'my-score') return [
      { rank: 12042, name: 'You (Alex_Dev)', points: 1482, streak: 12, country: 'USA', level: 'Platinum' }
    ];
    return leaders;
  };

  const filteredLeaders = getFilteredLeaders();

  return (
    <div className="bg-[#f3f7f7] min-h-screen font-sans text-[#0e141e] pb-20">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-[#d1d5db] py-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0e141e]">Leaderboard</h1>
              <nav className="flex items-center gap-2 text-sm text-[#738f93] mt-2">
                <Link to="/" className="hover:text-brand-primary transition-colors">Dashboard</Link>
                <ChevronRight size={14} />
                <span className="text-[#0e141e] font-medium">Leaderboard</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#738f93] group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Find user..." 
                  className="pl-11 pr-6 py-2.5 bg-[#f3f7f7] border border-[#d1d5db] rounded text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all w-full md:w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* ── Main Leaderboard Table ── */}
        <div className="flex-1">
          
          {/* HackerRank Style Leaderboard Tabs */}
          <div className="flex border-b border-[#d1d5db] mb-8 bg-white rounded-t">
            {(['global', 'monthly', 'my-score'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-5 text-[12px] font-bold uppercase tracking-[0.15em] transition-all relative ${
                  activeTab === tab 
                    ? 'text-[#0e141e] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand-primary' 
                    : 'text-[#738f93] hover:text-[#0e141e]'
                }`}
              >
                {tab === 'global' ? 'All Time' : tab === 'monthly' ? 'This Month' : 'Your Progress'}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#d1d5db] rounded shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f3f7f7] border-b border-[#d1d5db]">
                  <th className="px-8 py-4 text-[11px] font-bold text-[#738f93] uppercase tracking-wider w-20">Rank</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#738f93] uppercase tracking-wider">User</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#738f93] uppercase tracking-wider">Skill Level</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#738f93] uppercase tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d5db]">
                {filteredLeaders.map((l) => (
                  <tr key={l.rank} className="group hover:bg-[#f3f7f7]/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${l.rank <= 3 ? 'text-brand-primary' : 'text-[#738f93]'}`}>
                          {l.rank}
                        </span>
                        {l.rank === 1 && <Trophy size={14} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                          {l.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#0e141e] hover:text-brand-primary cursor-pointer transition-colors flex items-center gap-2">
                            {l.name}
                            {l.streak > 100 && <Star size={14} className="fill-amber-400 text-amber-400" />}
                          </div>
                          <div className="text-xs text-[#738f93]">{l.country} • {l.streak} Day Streak</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        l.level === 'Diamond' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        l.level === 'Platinum' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {l.level}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-[#0e141e] tabular-nums">
                      {l.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="w-full lg:w-80 space-y-6">
          
          {/* Your Standing Card */}
          <div className="bg-white border border-[#d1d5db] rounded p-8 shadow-sm">
            <h3 className="text-sm font-black text-[#0e141e] uppercase tracking-widest mb-6 border-b border-[#f3f7f7] pb-3">Your Standing</h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#738f93] uppercase tracking-widest">Global Rank</span>
                <span className="text-3xl font-black text-brand-primary">#12,042</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#738f93] uppercase tracking-widest">Points</span>
                  <span className="text-lg font-bold">1,482</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#738f93] uppercase tracking-widest">Percentile</span>
                  <span className="text-lg font-bold">Top 8%</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all uppercase tracking-widest">
              View Detailed Analytics
            </button>
          </div>

          {/* Quick Stats Features */}
          <div className="bg-[#0e141e] rounded p-8 text-white relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Trophy size={64} />
            </div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Globe size={18} className="text-brand-light" />
              Global Sync
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Rankings are synchronized in real-time across all regions. Stay consistent to climb higher.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-brand-light" />
                <span className="text-xs font-medium">85k+ Active Players</span>
              </div>
              <div className="flex items-center gap-3">
                <Target size={16} className="text-brand-light" />
                <span className="text-xs font-medium">Daily Score Reset</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
