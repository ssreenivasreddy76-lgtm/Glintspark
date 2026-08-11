import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trophy, Video, Target, Calendar, 
  ArrowRight, Shield, Clock, Building, Plus, Layout,
  Search, Filter, Download, MoreVertical, HelpCircle,
  AlertTriangle, DownloadCloud, Activity, Code, MessageSquare, TrendingUp,
  Calculator, Brain, List, Edit, BarChart2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

import { QuizModal } from '../components/AdminQuizzes';

export default function CompanyDashboard({ isCollege = false }: { isCollege?: boolean }) {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'contests' | 'quizzes' | 'interviews' | 'leaderboard'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Assessment State
  const [assessments, setAssessments] = useState([
    { title: 'Campus Recruitment - Aptitude Round 1', type: 'Aptitude', questions: 40, duration: '60 mins', participants: 1250, status: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    { title: 'Software Engineer SDE-1 Technical Quiz', type: 'Programming', questions: 25, duration: '45 mins', participants: 420, status: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    { title: 'Data Structures Mid-Term Lab Exam', type: 'Programming', questions: 30, duration: '90 mins', participants: 180, status: 'Draft', color: 'bg-amber-100 text-amber-700' }
  ]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizType, setQuizType] = useState('Aptitude');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState(30);
  const [newQuizDuration, setNewQuizDuration] = useState('60');
  
  const [skillGapDataByLang, setSkillGapDataByLang] = useState<Record<string, any[]>>({
    'All Languages': [
      { subject: 'Arrays & Strings', score: 0, fullMark: 100 },
      { subject: 'Linked Lists', score: 0, fullMark: 100 },
      { subject: 'Trees & Graphs', score: 0, fullMark: 100 },
      { subject: 'Dynamic Programming', score: 0, fullMark: 100 },
      { subject: 'Sorting & Searching', score: 0, fullMark: 100 },
      { subject: 'Math & Geometry', score: 0, fullMark: 100 },
    ]
  });
  const [languageData, setLanguageData] = useState<any[]>([
    { name: 'Loading...', value: 100 }
  ]);
  
  useEffect(() => {
    async function loadData() {
      // 1. Fetch Companies (Permissions)
      const data = await firebaseDB.getCompanyPermissions();
      const savedComps = data.permissions || [];
      setCompanies(savedComps);
      if (savedComps.length > 0) {
        setSelectedCompanyId(savedComps[0].id);
      }

      // 2. Fetch real data (Global Stats preferred, fallback to recent 200 submissions)
      try {
        const stats = await firebaseDB.getGlobalStats();
        if (stats && stats.languageData && stats.skillGapDataByLang) {
          setLanguageData(stats.languageData);
          setSkillGapDataByLang(stats.skillGapDataByLang);
        } else {
          // Fallback: Compute from recent 200 submissions if global stats not ready
          const { submissions } = await firebaseDB.getAllSubmissions(200);
          const challenges = await firebaseDB.getChallenges();

          if (submissions && submissions.length > 0) {
            // --- Compute Language Proficiency ---
            const langCount: Record<string, number> = {};
            submissions.forEach((sub: any) => {
              const l = sub.language || 'Unknown';
              langCount[l] = (langCount[l] || 0) + 1;
            });
            const totalSubs = submissions.length || 1;
            const langChartData = Object.entries(langCount).map(([name, count]) => ({
              name: name === 'cpp' ? 'C++' : name === 'c' ? 'C' : name.charAt(0).toUpperCase() + name.slice(1),
              value: Math.round((count / totalSubs) * 100)
            })).sort((a, b) => b.value - a.value);
            
            if (langChartData.length > 0) {
              setLanguageData(langChartData);
            }

            // --- Compute Skill Gap Analysis ---
            const catMapAll: Record<string, { passes: number, total: number }> = {};
            const catMapByLang: Record<string, Record<string, { passes: number, total: number }>> = {};
            const defaultCategories = ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching', 'Math & Geometry'];
            
            submissions.forEach((sub: any) => {
              const chal = challenges.find((c: any) => c.id === sub.challengeId);
              let category = chal?.category || 'General';
              if (category.toLowerCase().includes('array')) category = 'Arrays & Strings';
              if (category.toLowerCase().includes('string')) category = 'Arrays & Strings';
              if (category.toLowerCase().includes('list')) category = 'Linked Lists';
              if (category.toLowerCase().includes('tree')) category = 'Trees & Graphs';
              if (category.toLowerCase().includes('graph')) category = 'Trees & Graphs';
              if (category.toLowerCase().includes('dynamic')) category = 'Dynamic Programming';
              
              let lang = sub.language || 'Unknown';
              lang = lang === 'cpp' ? 'C++' : lang === 'c' ? 'C' : lang.charAt(0).toUpperCase() + lang.slice(1);
              
              if (!catMapAll[category]) catMapAll[category] = { passes: 0, total: 0 };
              if (!catMapByLang[lang]) catMapByLang[lang] = {};
              if (!catMapByLang[lang][category]) catMapByLang[lang][category] = { passes: 0, total: 0 };

              catMapAll[category].total += 1;
              catMapByLang[lang][category].total += 1;
              
              if (sub.status === 'PASS') {
                catMapAll[category].passes += 1;
                catMapByLang[lang][category].passes += 1;
              }
            });

            const buildChartData = (map: Record<string, { passes: number, total: number }>) => {
              const data = Object.entries(map).map(([subject, stats]) => ({
                subject,
                score: Math.round((stats.passes / stats.total) * 100),
                fullMark: 100
              }));
              defaultCategories.forEach(dc => {
                if (!data.find(d => d.subject === dc)) {
                  data.push({ subject: dc, score: 0, fullMark: 100 });
                }
              });
              return data;
            };

            const finalSkillGap: Record<string, any[]> = {
              'All Languages': buildChartData(catMapAll)
            };

            Object.keys(catMapByLang).forEach(lang => {
              finalSkillGap[lang] = buildChartData(catMapByLang[lang]);
            });
            
            setSkillGapDataByLang(finalSkillGap);
          }
        }
      } catch (err) {
        console.error("Error fetching real data for dashboard charts:", err);
      }
    }
    loadData();
  }, []);

  let currentCompany = companies.find(c => c.id === selectedCompanyId);
  
  if (!currentCompany) {
    currentCompany = {
      id: 'mock-1',
      name: isCollege ? 'My Institute' : 'My Company',
      domain: 'example.com',
      permissions: { mockInterviews: true, quizzes: true, contests: true }
    };
  }

  const currentSkillGapData = skillGapDataByLang[selectedLanguage] || skillGapDataByLang['All Languages'];
  const lowestSkill = [...currentSkillGapData].sort((a, b) => a.score - b.score)[0] || { subject: 'Unknown', score: 0 };

  const topLanguage = [...languageData].sort((a, b) => b.value - a.value)[0] || { name: 'Unknown', value: 0 };
  const PIE_COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'];

  const mockInterviewScores = [
    { month: 'Jan', tech: 65, comm: 70 },
    { month: 'Feb', tech: 68, comm: 72 },
    { month: 'Mar', tech: 75, comm: 78 },
    { month: 'Apr', tech: 82, comm: 85 },
  ];


  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20 font-sans">
      


      {/* Tabs Navigation */}
      <div className={`border-b border-slate-800/80 bg-slate-950 sticky ${isCollege ? 'top-0' : 'top-[56px]'} z-30 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-8 h-full overflow-x-auto no-scrollbar">
            
            {/* Logo */}
            <div className="flex items-center shrink-0 pr-4 border-r border-white/10 hidden md:flex">
              <Logo size={24} variant="light" />
            </div>

            <div className="flex items-center gap-1 text-[14.5px] font-bold text-slate-400 h-full">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`px-4 py-2 rounded-full flex items-center gap-2 hover:text-white transition-all relative whitespace-nowrap ${activeTab === 'home' ? 'text-white' : ''}`}
              >
                {activeTab === 'home' && <motion.div layoutId="dashnavbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                Home
              </button>

              <button 
                onClick={() => setActiveTab('contests')} 
                className={`px-4 py-2 rounded-full flex items-center gap-2 hover:text-white transition-all relative whitespace-nowrap ${activeTab === 'contests' ? 'text-white' : ''}`}
              >
                {activeTab === 'contests' && <motion.div layoutId="dashnavbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                Contests
              </button>
              <button 
                onClick={() => setActiveTab('quizzes')} 
                className={`px-4 py-2 rounded-full flex items-center gap-2 hover:text-white transition-all relative whitespace-nowrap ${activeTab === 'quizzes' ? 'text-white' : ''}`}
              >
                {activeTab === 'quizzes' && <motion.div layoutId="dashnavbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                Quizzes
              </button>

              <button 
                onClick={() => setActiveTab('leaderboard')} 
                className={`px-4 py-2 rounded-full flex items-center gap-2 hover:text-white transition-all relative whitespace-nowrap ${activeTab === 'leaderboard' ? 'text-white' : ''}`}
              >
                {activeTab === 'leaderboard' && <motion.div layoutId="dashnavbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        
        {/* HOME / OVERVIEW TAB */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Institute Analytics Dashboard</h1>
                <p className="text-slate-500">Track student engagement, skill gaps, and placement readiness.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-sm">
                <DownloadCloud size={18} />
                Export Report
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute -right-6 -bottom-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
                  <Users size={120} />
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 relative z-10">
                  <Activity size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active / Total Students</p>
                  <p className="text-3xl font-black text-slate-900">890 <span className="text-sm font-medium text-slate-400">/ 1,248</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="absolute -right-6 -bottom-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform">
                  <Code size={120} />
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 relative z-10">
                  <Layout size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assessments Created</p>
                  <p className="text-3xl font-black text-slate-900">24 <span className="text-sm font-bold text-emerald-500">+3 this month</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-amber-200 transition-colors">
                <div className="absolute -right-6 -bottom-6 text-amber-50 opacity-50 group-hover:scale-110 transition-transform">
                  <MessageSquare size={120} />
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 relative z-10">
                  <Video size={24} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Interviews Conducted</p>
                  <p className="text-3xl font-black text-slate-900">1,432</p>
                </div>
              </div>
            </div>

            {/* Premium Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Skill Gap Radar Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Target size={18} className="text-brand-primary" /> Skill Gap Analysis
                  </h3>
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-brand-primary cursor-pointer"
                    >
                      <option value="All Languages">All Languages</option>
                      <option value="C">C</option>
                      <option value="C++">C++</option>
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                    </select>
                    <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-md">PREMIUM INSIGHT</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentSkillGapData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <Radar name="Student Average" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-slate-500 text-center mt-2">
                  {selectedLanguage === 'All Languages' ? 'Students are' : `Students using ${selectedLanguage} are`} scoring lowest in <strong className="text-rose-500">{lowestSkill.subject}</strong>. Recommend scheduling a training camp.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Language Proficiency Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Code size={18} className="text-emerald-500" /> Language Proficiency
                  </h3>
                  <div className="h-[200px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={languageData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-slate-500 text-center mt-4 border-t border-slate-100 pt-4">
                    <strong className="text-emerald-500">{topLanguage.name}</strong> is the most popular programming language, accounting for <strong className="text-slate-700">{topLanguage.value}%</strong> of all student submissions across the platform.
                  </p>
                </div>


              </div>
            </div>


          </motion.div>
        )}

        {/* CONTESTS TAB */}
        {activeTab === 'contests' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy size={200} />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
                  <Trophy size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">{isCollege ? 'Campus Contests & Hackathons' : 'Hiring Contests'}</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  Schedule large-scale algorithmic coding contests to assess {isCollege ? 'hundreds of students simultaneously across your campus' : 'candidates globally'}.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => navigate('/contests/create')}
                    className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-md hover:bg-brand-dark transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} /> Create Contest
                  </button>
                  <button 
                    onClick={() => navigate('/contests/manage')}
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Layout size={18} /> Manage Active Contests
                  </button>
                  <button 
                    onClick={() => navigate('/leaderboard')}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Trophy size={18} /> View Global Leaderboard
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">Upcoming & Active Contests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md mb-2">ACTIVE NOW</span>
                    <h4 className="text-lg font-bold text-slate-900">Spring Hiring Challenge 2026</h4>
                  </div>
                  <Trophy className="text-slate-300" size={24} />
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><Users size={14} /> 450 Participants</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> Ends in 2 hrs</span>
                </div>
                <button onClick={() => navigate('/contests/manage')} className="w-full py-2 bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  View Live Leaderboard
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-8">
            {/* Assessment Types / Create */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-4">Create New Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Aptitude */}
                <div onClick={() => { setQuizType('Aptitude'); setIsCreatingQuiz(true); }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calculator size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Quantitative Aptitude</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">Test numerical ability, data interpretation, and mathematical problem-solving skills.</p>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">45 Questions</span>
                    <span className="text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">Create Assessment <ArrowRight size={14}/></span>
                  </div>
                </div>

                {/* Reasoning */}
                <div onClick={() => { setQuizType('Reasoning'); setIsCreatingQuiz(true); }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Logical Reasoning</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">Assess cognitive abilities, pattern recognition, and logical deduction.</p>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">30 Questions</span>
                    <span className="text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">Create Assessment <ArrowRight size={14}/></span>
                  </div>
                </div>

                {/* Programming */}
                <div onClick={() => { setQuizType('Programming'); setIsCreatingQuiz(true); }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Programming & Tech</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">Evaluate core programming concepts, syntax, and technical knowledge.</p>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">20 Questions</span>
                    <span className="text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">Create Assessment <ArrowRight size={14}/></span>
                  </div>
                </div>

              </div>
            </div>

            {/* Active & Past Assessments */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-black text-slate-900 text-lg">Your Assessments</h3>
                <div className="flex items-center gap-2 text-sm">
                  <button className="px-3 py-1.5 font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition">Active</button>
                  <button className="px-3 py-1.5 font-bold text-slate-400 hover:text-slate-700 transition">Drafts</button>
                  <button className="px-3 py-1.5 font-bold text-slate-400 hover:text-slate-700 transition">Past</button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {assessments.map((assessment, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{assessment.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${assessment.color}`}>{assessment.status}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><HelpCircle size={14}/> {assessment.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1.5"><List size={14}/> {assessment.questions} Questions</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1.5"><Clock size={14}/> {assessment.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1.5"><Users size={14}/> {assessment.participants} Candidates</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          setQuizType(assessment.type);
                          setNewQuizTitle(assessment.title);
                          setIsCreatingQuiz(true);
                        }}
                        className="p-2 text-slate-400 hover:text-brand-primary bg-slate-100 hover:bg-brand-50 rounded-lg transition" title="Edit Assessment">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-brand-primary bg-slate-100 hover:bg-brand-50 rounded-lg transition" title="View Results">
                        <BarChart2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setQuizType(assessment.type);
                          setNewQuizTitle(assessment.title);
                          setIsCreatingQuiz(true);
                        }}
                        className="px-4 py-2 font-bold text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}



        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
            <Trophy className="text-amber-400 w-20 h-20 mb-6 drop-shadow-md" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Global Leaderboard</h2>
            <p className="text-slate-500 max-w-md mb-8">See how your top performers stack up against the competition.</p>
            <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-lg shadow-brand-primary/20">
              View Leaderboard (Coming Soon)
            </button>
          </motion.div>
        )}
      </div>
      
      {/* Create Assessment Modal */}
      <AnimatePresence>
        {isCreatingQuiz && (
          <QuizModal 
            initial={{ title: newQuizTitle || '', category: quizType, timeLimit: parseInt(newQuizDuration) || 60 }}
            onSave={(quizData, questionsData) => {
              setAssessments([
                { 
                  title: quizData.title || 'Untitled Assessment', 
                  type: quizData.category, 
                  questions: questionsData.length, 
                  duration: `${quizData.timeLimit} mins`, 
                  participants: 0, 
                  status: 'Active', 
                  color: 'bg-emerald-100 text-emerald-700' 
                }, 
                ...assessments
              ]);
              setIsCreatingQuiz(false);
            }}
            onClose={() => setIsCreatingQuiz(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
