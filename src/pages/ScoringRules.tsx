import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Target, Trophy, Code2, Zap, Hexagon } from 'lucide-react';

export default function ScoringRules() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f3f7f7] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 shadow-sm relative z-20">
         <div className="max-w-4xl mx-auto px-8 relative">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[14px] font-bold text-[#738f93] hover:text-brand-primary transition-colors mb-6 uppercase tracking-widest">
               <ChevronLeft size={16} /> Back to Practice
             </button>
             <h1 className="text-[36px] font-bold text-[#1e2330] tracking-tight leading-none mb-3">
                Scoring & Leaderboard Rules
             </h1>
             <p className="text-[#5c6e7a] text-[16px]">
                Understand how points are calculated, stars are awarded, and how you rank globally.
             </p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 mt-10 space-y-10">
        
        {/* Points System */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-[#f8fafc] px-8 py-5 flex items-center gap-3">
             <Target className="text-brand-primary" size={24} />
             <h2 className="text-[20px] font-bold text-slate-800">1. Earning Points</h2>
          </div>
          <div className="p-8 space-y-4 text-[15px] text-slate-600 leading-relaxed">
             <p>Every practice challenge is assigned a specific point value based on its difficulty and complexity. You earn these points when your solution passes <strong>all</strong> hidden test cases successfully.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border border-slate-200 rounded-lg p-5 bg-[#f3f7f7]">
                  <div className="text-[13px] font-bold uppercase tracking-widest text-[#1ba94c] mb-1">Easy</div>
                  <div className="text-[24px] font-black text-slate-800">15<span className="text-[14px] text-slate-400 font-medium ml-1">pts</span></div>
                </div>
                <div className="border border-slate-200 rounded-lg p-5 bg-[#f3f7f7]">
                  <div className="text-[13px] font-bold uppercase tracking-widest text-amber-500 mb-1">Medium</div>
                  <div className="text-[24px] font-black text-slate-800">25<span className="text-[14px] text-slate-400 font-medium ml-1">pts</span></div>
                </div>
                <div className="border border-slate-200 rounded-lg p-5 bg-[#f3f7f7]">
                  <div className="text-[13px] font-bold uppercase tracking-widest text-rose-600 mb-1">Hard</div>
                  <div className="text-[24px] font-black text-slate-800">50<span className="text-[14px] text-slate-400 font-medium ml-1">pts</span></div>
                </div>
             </div>
             <div className="mt-4 flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100">
               <Zap size={20} className="shrink-0 mt-0.5 text-blue-500" />
               <p className="text-[14px]">You do not lose points for wrong submissions, but excessive incorrect submissions during active contests may incur a time penalty.</p>
             </div>
          </div>
        </div>

        {/* Stars System */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-[#f8fafc] px-8 py-5 flex items-center gap-3">
             <Star className="text-amber-500 fill-amber-500" size={24} />
             <h2 className="text-[20px] font-bold text-slate-800">2. The Star System</h2>
          </div>
          <div className="p-8 space-y-4 text-[15px] text-slate-600 leading-relaxed">
             <p>As you accumulate points within a specific domain (like JavaScript or Algorithms), your rank increases. Stars are awarded automatically when you cross specific point thresholds.</p>
             
             <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { stars: 1, points: '30', styles: { badgeFill: 'fill-[#f8fafc]', badgeStroke: 'text-[#cbd5e1]', starColor: 'text-[#94a3b8] fill-[#94a3b8]' } },
                  { stars: 2, points: '100', styles: { badgeFill: 'fill-[#f8fafc]', badgeStroke: 'text-[#cbd5e1]', starColor: 'text-[#94a3b8] fill-[#94a3b8]' } },
                  { stars: 3, points: '250', styles: { badgeFill: 'fill-[#fefce8]', badgeStroke: 'text-[#fde047]', starColor: 'text-[#eab308] fill-[#eab308]' } },
                  { stars: 4, points: '500', styles: { badgeFill: 'fill-[#fefce8]', badgeStroke: 'text-[#fde047]', starColor: 'text-[#eab308] fill-[#eab308]' } },
                  { stars: 5, points: '1,000', styles: { badgeFill: 'fill-[#f0fdfa]', badgeStroke: 'text-[#a5f3fc]', starColor: 'text-[#06b6d4] fill-[#06b6d4]' } },
                  { stars: 6, points: '2,000+', styles: { badgeFill: 'fill-[#fef2f2]', badgeStroke: 'text-[#fecaca]', starColor: 'text-[#ef4444] fill-[#ef4444]' } }
                ].map((tier, i) => (
                  <div key={i} className="flex flex-col items-center p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                     <div className="relative flex items-center justify-center shrink-0 mb-4">
                        <Hexagon 
                           size={72} 
                           strokeWidth={1.5}
                           className={`${tier.styles.badgeStroke} ${tier.styles.badgeFill}`} 
                           style={{ transform: 'rotate(90deg)' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <Code2 size={20} className={`mb-1 opacity-80 ${tier.styles.starColor}`} />
                           <div className="flex items-center justify-center gap-[1px]">
                              {Array.from({length: tier.stars}).map((_, j) => (
                                 <Star key={j} size={6} className={`${tier.styles.starColor}`} />
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="font-black text-slate-800 text-[16px] mb-1">{tier.stars} Star{tier.stars > 1 ? 's' : ''}</div>
                     <div className="text-[14px] font-medium text-slate-500">{tier.points} pts</div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Leaderboard Calculation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-[#f8fafc] px-8 py-5 flex items-center gap-3">
             <Trophy className="text-emerald-500" size={24} />
             <h2 className="text-[20px] font-bold text-slate-800">3. Leaderboard Calculation</h2>
          </div>
          <div className="p-8 space-y-6 text-[15px] text-slate-600 leading-relaxed">
             <p>The global leaderboard ranks users across the entire platform. Your rank is calculated using the following metrics, evaluated in this exact order:</p>
             
             <ul className="space-y-4">
                <li className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">1</div>
                   <div>
                      <strong className="text-slate-800 block mb-1">Total Points (Score)</strong>
                      <p>The primary sorting metric is your total combined points across all solved challenges. The more challenges you solve, the higher you climb.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
                   <div>
                      <strong className="text-slate-800 block mb-1">Tie-Breaker: Time Taken</strong>
                      <p>If two users have the exact same score, the system breaks the tie based on the time taken to solve the challenges. A faster aggregate solve time results in a higher rank.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0">3</div>
                   <div>
                      <strong className="text-slate-800 block mb-1">Contest Multipliers</strong>
                      <p>Points earned during live, timed contests carry a higher weight in your overall global rank than points earned on the standard practice tracks.</p>
                   </div>
                </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
