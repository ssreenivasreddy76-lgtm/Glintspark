import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';
import { Trophy, BarChart2, CheckSquare, Settings, List, ChevronRight } from 'lucide-react';

export default function ContestChallengesPage() {
  const { id } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ value: '0', unit: 'days', status: 'Starts in' });

  useEffect(() => {
    async function fetchData() {
      const allContests = await firebaseDB.getContests();
      const found = allContests.find(c => c.id === id || c.id.toString() === id);
      if (found) {
        setContest(found);
      }
      
      const allChallenges = await firebaseDB.getChallenges();
      const contestChallenges = allChallenges.filter(ch => ch.contestId === id || ch.contestId === id?.toString());
      setChallenges(contestChallenges);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!contest || !contest.date) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(contest.date).getTime();
      let target = start;
      let statusStr = 'THE CONTEST HAS NOT YET STARTED. IT BEGINS IN';

      if (now > start) {
         if (contest.duration && contest.duration !== 999999) {
           const end = start + (contest.duration * 60000);
           if (now > end) {
             statusStr = 'THE CONTEST HAS ENDED';
             target = end;
           } else {
             statusStr = 'THE CONTEST ENDS IN';
             target = end;
           }
         } else {
           statusStr = 'THE CONTEST HAS STARTED';
           target = start;
         }
      }

      const difference = target - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        if (days > 0) {
          return { value: days.toString(), unit: `day${days > 1 ? 's' : ''}`, status: statusStr };
        } else if (hours > 0) {
          return { value: hours.toString(), unit: `hr${hours > 1 ? 's' : ''}`, status: statusStr };
        } else {
          return { value: minutes.toString(), unit: `min${minutes > 1 ? 's' : ''}`, status: statusStr };
        }
      } else {
        return { value: '', unit: '', status: statusStr };
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [contest]);

  if (!contest) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-1">
              <Link to="/contests" className="hover:text-brand-primary">All Contests</Link>
              <ChevronRight size={14} />
              <span className="text-slate-400 capitalize">{contest.title || `Glintspark ${id}`}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold text-slate-800 capitalize">
                {contest.title || `Glintspark ${id}`}
              </h1>
              <Link to={`/contests/${id}/landing`} className="text-[#2ec866] text-[13px] font-bold hover:underline flex items-center gap-1">
                Details <span className="text-[10px]">▶</span>
              </Link>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {timeLeft.status}
            </div>
            {timeLeft.value && (
              <div className="text-3xl font-bold text-slate-800">
                {timeLeft.value} <span className="text-xl">{timeLeft.unit}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Challenges */}
        <div className="flex-1">
          {challenges.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md py-16 text-center shadow-sm">
              <p className="text-slate-400 text-[15px]">There are no matching challenges.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((ch, idx) => (
                <div key={ch.id} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer">
                  <div>
                    <h3 className="text-lg font-bold text-[#4a90e2] mb-1">{ch.title || `Challenge ${idx + 1}`}</h3>
                    <p className="text-[13px] text-slate-500 line-clamp-1">{ch.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-[12px] font-bold capitalize">
                      {ch.difficulty || 'Medium'}
                    </span>
                    <button className="ml-4 px-6 py-2 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[13px] font-bold rounded-[3px] transition-colors">
                      Solve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-8">
          
          {/* Status Filter */}
          <div>
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                <span className="text-[15px] font-bold text-slate-700">Solved</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                <span className="text-[15px] font-bold text-slate-700">Unsolved</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
             <div className="flex justify-between items-center text-[13px] text-slate-500 mb-6">
                <span>Current Rank:</span>
                <span className="font-bold text-slate-800">N/A</span>
             </div>
             
             <div className="space-y-4">
                <Link to="#" className="flex items-center gap-3 text-[14px] text-[#4a90e2] hover:underline">
                   <Trophy size={16} />
                   Current Leaderboard
                </Link>
                <Link to="#" className="flex items-center gap-3 text-[14px] text-[#4a90e2] hover:underline">
                   <BarChart2 size={16} />
                   Compare Progress
                </Link>
                <Link to="#" className="flex items-center gap-3 text-[14px] text-[#4a90e2] hover:underline">
                   <CheckSquare size={16} />
                   Review Submissions
                </Link>
             </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
             <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Options</h3>
             <div className="space-y-4">
                <Link to={`/contests/${id}/manage`} className="flex items-center gap-3 text-[14px] text-[#4a90e2] hover:underline">
                   <Settings size={16} />
                   Manage Contest
                </Link>
                <Link to="#" className="flex items-center gap-3 text-[14px] text-[#4a90e2] hover:underline">
                   <List size={16} />
                   View All Submissions
                </Link>
             </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6 flex gap-3 text-slate-400">
             <div className="w-6 h-6 bg-slate-300 hover:bg-slate-400 rounded flex items-center justify-center text-white cursor-pointer transition-colors text-[12px] font-bold">f</div>
             <div className="w-6 h-6 bg-slate-300 hover:bg-slate-400 rounded flex items-center justify-center text-white cursor-pointer transition-colors text-[12px] font-bold">t</div>
             <div className="w-6 h-6 bg-slate-300 hover:bg-slate-400 rounded flex items-center justify-center text-white cursor-pointer transition-colors text-[12px] font-bold">in</div>
          </div>

        </div>

      </div>

      {/* Footer text links */}
      <div className="mt-auto py-8 text-center text-[13px] text-[#4a90e2]">
        <Link to="#" className="hover:underline">Blog</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Scoring</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Environment</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">FAQ</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">About Us</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Helpdesk</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Careers</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Terms Of Service</Link> <span className="text-slate-300 px-1">|</span>
        <Link to="#" className="hover:underline">Privacy Policy</Link>
      </div>

    </div>
  );
}
