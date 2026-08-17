
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Code2, ArrowLeft, ArrowRight, Play, Trophy, Sparkles, BookOpen, Clock, BarChart, Check, Target } from 'lucide-react';
import { useChallenges } from '../contexts/ChallengesContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDB } from '../services/firebaseService';
import { supabaseDB } from '../services/supabaseService';

export default function PracticeSheet() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { challenges } = useChallenges();
  const { user } = useAuth();
  
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [solvedSubmissions, setSolvedSubmissions] = useState<any[]>([]);
  const [sheet, setSheet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sheet details
  React.useEffect(() => {
    const fetchSheet = async () => {
      setIsLoading(true);
      const sheets = await supabaseDB.getPracticeSheets();
      const found = sheets.find(s => s.id === sheetId);
      setSheet(found);
      setIsLoading(false);
    };
    fetchSheet();
  }, [sheetId]);

  // Fetch solved stats
  React.useEffect(() => {
    if (user) {
      firebaseDB.getUserSubmissions(user._id).then(dbSolved => {
        if (dbSolved) setSolvedSubmissions(dbSolved);
      }).catch(console.error);
    }
  }, [user]);

  // Helper to get challenges and auto-generate mock ones if empty
  const getStepChallenges = (step: any) => {
    let stepChallenges = challenges.filter(c => 
      c.topics?.some((t: string) => step.tags.includes(t)) || 
      step.tags.includes(c.track) ||
      step.tags.includes(c.category)
    );

    if (stepChallenges.length === 0) {
      stepChallenges = [
        {
          id: `mock-${step.id}-1`,
          title: `Introduction to ${step.title}`,
          difficulty: 'Easy',
          points: 10,
          category: step.title,
          track: 'DSA',
          successRate: '95%'
        },
        {
          id: `mock-${step.id}-2`,
          title: `Standard ${step.title} Algorithm`,
          difficulty: 'Medium',
          points: 20,
          category: step.title,
          track: 'DSA',
          successRate: '75%'
        },
        {
          id: `mock-${step.id}-3`,
          title: `Advanced ${step.title} Problem`,
          difficulty: 'Hard',
          points: 40,
          category: step.title,
          track: 'DSA',
          successRate: '45%'
        }
      ] as any[];
    }
    return stepChallenges;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-slate-600">Loading Practice Sheet...</h2>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-32 pb-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Practice Sheet Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">Return to Dashboard</button>
      </div>
    );
  }

  // Calculate overall progress
  let totalProblems = 0;
  let solvedProblems = 0;
  
  sheet.steps.forEach(step => {
    const stepChallenges = getStepChallenges(step);
    totalProblems += stepChallenges.length;
    solvedProblems += stepChallenges.filter(c => solvedSubmissions.some(s => s.challengeId === c.id)).length;
  });

  const overallProgress = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      
      
      
      {/* Professional Light Header with Analytics */}
      <div className="bg-slate-50 border-b border-slate-200 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-slate-400 hover:text-blue-600 transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            {/* Title & Description */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
                {sheet.title}
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed font-medium">
                {sheet.description || 'A highly structured, professional roadmap to mastering technical concepts for top-tier tech interviews.'}
              </p>
            </div>
            
            {/* Analytics Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full lg:w-auto shadow-sm flex flex-col sm:flex-row items-center gap-8 min-w-[380px]">
              
              {(() => {
                // Calculate breakdowns
                const allSheetChallenges = sheet.steps.flatMap(step => 
                  challenges.filter(c => 
                    c.topics?.some(t => step.tags.includes(t)) || 
                    step.tags.includes(c.track) ||
                    step.tags.includes(c.category)
                  )
                );
                // remove duplicates
                const uniqueChallenges = Array.from(new Map(allSheetChallenges.map(c => [c.id, c])).values());
                
                const totalEasy = uniqueChallenges.filter(c => c.difficulty === 'Easy').length;
                const totalMed = uniqueChallenges.filter(c => c.difficulty === 'Medium').length;
                const totalHard = uniqueChallenges.filter(c => c.difficulty === 'Hard').length;
                
                const solvedSet = new Set(solvedSubmissions.map(s => s.challengeId));
                const solvedEasy = uniqueChallenges.filter(c => c.difficulty === 'Easy' && solvedSet.has(c.id)).length;
                const solvedMed = uniqueChallenges.filter(c => c.difficulty === 'Medium' && solvedSet.has(c.id)).length;
                const solvedHard = uniqueChallenges.filter(c => c.difficulty === 'Hard' && solvedSet.has(c.id)).length;
                
                const total = uniqueChallenges.length;
                const solved = solvedEasy + solvedMed + solvedHard;
                const percent = total === 0 ? 0 : Math.round((solved / total) * 100);
                
                // SVG Circle Math
                const radius = 42;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percent / 100) * circumference;

                return (
                  <>
                    {/* Circular Progress (Donut Chart) */}
                    <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        {/* Progress */}
                        <circle 
                          cx="50" cy="50" r={radius} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-slate-800 leading-none">{solved}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">/ {total}</span>
                      </div>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="flex-1 w-full space-y-3">
                      {/* Easy */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-green-600 uppercase tracking-wider">Easy</span>
                          <span className="text-slate-600">{solvedEasy} <span className="text-slate-400">/ {totalEasy}</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalEasy ? (solvedEasy/totalEasy)*100 : 0}%` }}></div>
                        </div>
                      </div>
                      {/* Medium */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-amber-500 uppercase tracking-wider">Medium</span>
                          <span className="text-slate-600">{solvedMed} <span className="text-slate-400">/ {totalMed}</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalMed ? (solvedMed/totalMed)*100 : 0}%` }}></div>
                        </div>
                      </div>
                      {/* Hard */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-rose-500 uppercase tracking-wider">Hard</span>
                          <span className="text-slate-600">{solvedHard} <span className="text-slate-400">/ {totalHard}</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totalHard ? (solvedHard/totalHard)*100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}



      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {sheet.steps.map((step, idx) => {
            const isExpanded = expandedStep === step.id;
            const stepChallenges = getStepChallenges(step);
            
            const solvedCount = stepChallenges.filter(c => 
              solvedSubmissions.some(s => s.challengeId === c.id)
            ).length;
            const totalCount = stepChallenges.length;
            const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
            const isCompleted = totalCount > 0 && solvedCount === totalCount;

            return (
              <div key={step.id} className="border-b border-slate-200 last:border-b-0">
                {/* Accordion Header */}
                <button 
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  className={`w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors ${isExpanded ? 'bg-slate-50/80' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCompleted ? <Check size={16} /> : idx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-500 hidden md:block mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{solvedCount} / {totalCount}</span>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Problems Table View (Professional) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-white">
                      <div className="p-0 border-t border-slate-200">
                        {stepChallenges.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            No problems listed for this topic yet.
                          </div>
                        ) : (
                          <div className="w-full overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-6 py-4 font-semibold w-12 text-center">Status</th>
                                  <th className="px-6 py-4 font-semibold">Problem Title</th>
                                  <th className="px-6 py-4 font-semibold w-32">Difficulty</th>
                                  <th className="px-6 py-4 font-semibold w-32">Points</th>
                                  <th className="px-6 py-4 font-semibold w-24 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stepChallenges.map((prob, i) => {
                                  const isSolved = solvedSubmissions.some(s => s.challengeId === prob.id);
                                  return (
                                    <tr key={prob.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-b-0 group">
                                      <td className="px-6 py-4 text-center">
                                        {isSolved ? (
                                          <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                                        ) : (
                                          <div className="w-4 h-4 rounded border-2 border-slate-300 mx-auto group-hover:border-blue-400 transition-colors"></div>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 font-medium text-slate-900">
                                        <Link to={`/challenges/${prob.id}`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                          {prob.title}
                                        </Link>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                                          prob.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                          prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                          'bg-rose-100 text-rose-700'
                                        }`}>{prob.difficulty}</span>
                                      </td>
                                      <td className="px-6 py-4 font-medium text-slate-500 flex items-center gap-1">
                                        <Trophy size={14} className="text-amber-500" /> {prob.points}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <Link 
                                          to={`/challenges/${prob.id}`}
                                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            isSolved 
                                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                              : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                          }`}
                                        >
                                          {isSolved ? 'Review' : 'Solve'}
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
