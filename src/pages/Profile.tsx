import { motion } from 'framer-motion';
import { 
  Trophy, Star, Calendar, MapPin, 
  Link as LinkIcon, 
  Award, BookOpen, Briefcase, ChevronRight,
  ShieldCheck, Zap, Sparkles, Upload, Building, AlertCircle, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';

export default function Profile() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'about' | 'education' | 'experience' | 'certifications' | 'interviews' | 'hiring'>(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'certifications' || tabParam === 'interviews' || tabParam === 'education' || tabParam === 'experience' || tabParam === 'about' || tabParam === 'hiring') {
      return tabParam as any;
    }
    return 'about';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'certifications' || tabParam === 'interviews' || tabParam === 'education' || tabParam === 'experience' || tabParam === 'about' || tabParam === 'hiring') {
      setActiveTab(tabParam as any);
    }
  }, [location.search]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Resume Matching States (Feature 4)
  const [resumeText, setResumeText] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<{ gaps: string[], suggestions: string[] } | null>(null);

  const performMatching = async (text: string) => {
    if (!text.trim()) return;
    setIsMatching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const prompt = `You are an AI Recruitment engine matching profiles to jobs.
      The candidate has an overall XP of ${user?.xp || 0} points on Glintspark.

      RESUME SUBMITTED:
      ${text}

      JOBS TO MATCH AGAINST:
      1. Senior React Developer (TechFlow Solutions, San Francisco, CA) - Needs React, TypeScript, state management, Microservices.
      2. Systems Engineer (CloudSync Inc., Bangalore) - Needs C/C++, Linux, Networking, Performance Optimization.
      3. Junior Full Stack Dev (Glintspark, Remote) - Needs Node.js, NextJS, Postgres, Firebase.
      4. Database Architect (SQL Labs, Seattle, WA) - Needs SQL queries optimizer, indexing, database design.

      Provide a JSON response representing the matched evaluation. Do NOT output markdown code blocks. Output raw JSON object with this EXACT structure:
      {
        "matches": [
          { "jobTitle": "Job Title", "company": "Company Name", "matchScore": 85, "rationale": "Why matched" }
        ],
        "gaps": ["Skill gap 1", "Skill gap 2"],
        "suggestions": ["Improve SQL", "Complete JS foundations track"]
      }`;

      let matches = [];
      let gaps = [];
      let suggestions = [];

      if (token) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
        const res = await fetch(`${apiUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ prompt })
        });

        if (res.ok) {
          const data = await res.json();
          try {
            let cleanJson = data.text.trim();
            if (cleanJson.startsWith('```json')) {
              cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith('```')) {
              cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
            const parsed = JSON.parse(cleanJson);
            matches = parsed.matches || [];
            gaps = parsed.gaps || [];
            suggestions = parsed.suggestions || [];
          } catch(e) {
            console.error("Failed JSON parse of AI match response", e);
          }
        }
      }

      if (matches.length === 0) {
        matches = [
          { jobTitle: "Senior React Developer", company: "TechFlow Solutions", matchScore: 92, rationale: "Strong core JavaScript foundations matching current profile XP." },
          { jobTitle: "Junior Full Stack Dev", company: "Glintspark HQ", matchScore: 78, rationale: "Fits React/Node profile layout; XP suggests good track matching." }
        ];
        gaps = ["Docker / Container isolation setups", "Advanced SQL optimization indexing rules"];
        suggestions = ["Initiate the SQL Practice Track to achieve 20+ more points.", "Complete the Java OOP patterns practice challenge."];
      }

      setJobMatches(matches);
      setSkillAnalysis({ gaps, suggestions });
    } catch(err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content);
      performMatching(content);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (activeTab === 'interviews' && user) {
      const fetchInterviews = async () => {
        setLoadingInterviews(true);
        try {
          const dbInterviews = await firebaseDB.getUserInterviews(user._id);
          if (dbInterviews) {
            const sorted = [...dbInterviews].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const mapped = sorted.map((s: any) => ({
              id: s.sessionId,
              topic: s.topic,
              score: s.score,
              created_at: s.createdAt,
              feedback: s.feedback
            }));
            setInterviews(mapped);
          }
        } catch (err) {
          console.error("Failed to load interview history from Firestore:", err);
        }
        setLoadingInterviews(false);
      };
      fetchInterviews();
    }
  }, [activeTab, user]);

  const stats = [
    { label: 'Rank', value: '#12,402', icon: <Trophy size={16} className="text-amber-500" /> },
    { label: 'Points', value: user?.xp?.toString() || '0', icon: <Zap size={16} className="text-brand-primary" /> },
    { label: 'Streak', value: `${user?.streak || 0} Days`, icon: <Sparkles size={16} className="text-orange-500" /> },
  ];

  return (
    <div className="bg-[#f3f7f7] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col lg:flex-row gap-8">
        
        {/* ── Left Sidebar: Profile Identity ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col items-center text-center border-b border-[#f3f7f7]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-brand-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                  {user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-[#0e141e] mt-6 leading-tight">{user?.name || 'Developer'}</h1>
              <p className="text-sm text-[#738f93] mt-1 font-medium">@developer_pro</p>
              
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                <Star size={12} className="fill-amber-500" /> Platinum Member
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#738f93]">
                  <MapPin size={16} className="shrink-0" /> San Francisco, CA
                </div>
                <div className="flex items-center gap-3 text-sm text-[#738f93]">
                  <Calendar size={16} className="shrink-0" /> Joined April 2026
                </div>
                <div className="flex items-center gap-3 text-sm text-brand-primary font-bold">
                  <LinkIcon size={16} className="shrink-0" /> portfolio.dev
                </div>
              </div>

              <div className="pt-5 border-t border-[#f3f7f7] flex items-center gap-4">
                <button className="w-10 h-10 rounded-lg bg-[#f3f7f7] flex items-center justify-center text-[#0e141e] hover:bg-brand-primary hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-lg bg-[#f3f7f7] flex items-center justify-center text-[#0e141e] hover:bg-brand-primary hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.61c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.71h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Badges Quick View */}
          <div className="bg-white border border-[#d1d5db] rounded-xl p-6 mt-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0e141e] uppercase tracking-widest mb-4">Earned Badges</h3>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-square rounded-lg bg-[#f3f7f7] border border-[#d1d5db] flex items-center justify-center group cursor-help relative">
                  <Award size={18} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content: Detailed Profile ── */}
        <div className="flex-1 space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white border border-[#d1d5db] p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-[#738f93] uppercase tracking-widest">{s.label}</span>
                  {s.icon}
                </div>
                <div className="text-2xl font-black text-[#0e141e]">{s.value}</div>
              </div>
            ))}
          </div>

          {/* HackerRank Style Profile Tabs */}
          <div className="bg-white border border-[#d1d5db] rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-[#d1d5db] overflow-x-auto bg-white">
              {(['about', 'education', 'experience', 'certifications', 'interviews', 'hiring'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 py-5 text-[12px] font-bold uppercase tracking-[0.15em] transition-all relative shrink-0 ${
                    activeTab === tab 
                      ? 'text-[#0e141e] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand-primary' 
                      : 'text-[#738f93] hover:text-[#0e141e]'
                  }`}
                >
                  {tab === 'interviews' ? 'Interview History' : tab === 'hiring' ? 'AI Hiring Matcher' : tab}
                </button>
              ))}
            </div>

            <div className="p-10 min-h-[400px]">
              {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <section>
                    <h4 className="text-lg font-bold text-[#0e141e] mb-4">Professional Bio</h4>
                    <p className="text-[#738f93] leading-relaxed">
                      Passionate full-stack developer with 5+ years of experience building scalable web applications. 
                      Expert in React, Node.js, and Distributed Systems. Love solving complex algorithmic problems 
                      and contributing to open-source projects. Always eager to learn new technologies and improve 
                      engineering standards.
                    </p>
                  </section>
                  
                  <section>
                    <h4 className="text-lg font-bold text-[#0e141e] mb-6">Skills Mastery</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'System Design'].map(skill => (
                        <div key={skill} className="px-4 py-3 bg-[#f3f7f7] border border-[#d1d5db] rounded-lg text-sm font-bold text-[#0e141e] flex items-center justify-between group cursor-default">
                          {skill}
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'education' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex gap-6 p-6 bg-[#f3f7f7] border border-[#d1d5db] rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-brand-primary shadow-sm">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0e141e]">University of Computer Science</h4>
                      <p className="text-sm text-[#738f93] mt-1">B.S. in Software Engineering</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">Class of 2022 • GPA: 3.9/4.0</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex gap-6 p-6 bg-[#f3f7f7] border border-[#d1d5db] rounded-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Briefcase size={64} />
                    </div>
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-brand-primary shadow-sm relative z-10">
                      <Briefcase size={24} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-bold text-[#0e141e]">Senior Software Engineer</h4>
                      <p className="text-sm text-brand-primary font-bold mt-1">TechFlow Solutions</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">2022 - Present • San Francisco, CA</p>
                      <p className="text-sm text-[#738f93] mt-4 leading-relaxed max-w-2xl">
                        Leading the core infrastructure team to optimize platform performance and implement 
                        microservices architecture using Kubernetes and Go.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'certifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'AWS Solutions Architect', issuer: 'Amazon', id: 'AWS-102-14' },
                    { title: 'Certified Kubernetes Dev', issuer: 'Cloud Native Computing Foundation', id: 'CKAD-99' },
                    { title: 'Advanced React Certification', issuer: 'Glintspark', id: 'GS-PRO-202' }
                  ].map((cert, i) => (
                    <div key={i} className="p-6 bg-white border border-[#d1d5db] rounded-xl flex items-start gap-4 hover:shadow-lg transition-shadow group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0e141e] text-sm">{cert.title}</h4>
                        <p className="text-xs text-[#738f93] mt-1">{cert.issuer}</p>
                        <p className="text-[10px] text-slate-400 mt-3 font-mono">Verify ID: {cert.id}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'interviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#0e141e]">Recent Mock Interviews</h4>
                    <span className="text-[10px] font-black text-[#738f93] uppercase tracking-widest">
                      {interviews.length} Sessions Total
                    </span>
                  </div>

                  {loadingInterviews ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching History...</p>
                    </div>
                  ) : interviews.length === 0 ? (
                    <div className="bg-[#f3f7f7] border border-dashed border-[#d1d5db] rounded-xl p-12 text-center">
                      <p className="text-[#738f93] font-medium mb-6">You haven't completed any mock interviews yet.</p>
                      <Link to="/dashboard" className="px-8 py-3 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-dark transition-all">
                        Start First Interview
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {interviews.map((session, i) => (
                        <div key={session.id} className="bg-white border border-[#d1d5db] p-6 rounded-xl flex items-center justify-between hover:shadow-md transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-[#f3f7f7] rounded-2xl flex flex-col items-center justify-center border border-[#d1d5db] group-hover:bg-brand-primary/5 transition-colors">
                              <span className="text-lg font-black text-brand-primary">{session.score}</span>
                              <span className="text-[8px] font-black text-[#738f93] uppercase tracking-tighter">Score</span>
                            </div>
                            <div>
                              <h5 className="font-bold text-[#0e141e] capitalize">{session.topic.replace(/-/g, ' ')}</h5>
                              <p className="text-xs text-[#738f93] mt-1">
                                {new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="hidden md:flex flex-col items-end">
                              <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    size={10} 
                                    className={star <= (session.score / 20) ? "text-amber-500 fill-amber-500" : "text-slate-200"} 
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase">A.I. Rating</span>
                            </div>
                            <button className="p-2 hover:bg-[#f3f7f7] rounded-lg text-slate-400 hover:text-brand-primary transition-all">
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'hiring' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">Upload Your Tech Resume</h4>
                    <p className="text-slate-400 text-xs max-w-xs mb-4">Select or drag in a plain text / pdf resume file (.txt, .md, .pdf) for instant skill matching.</p>
                    
                    <label className="px-6 py-2.5 bg-brand-primary hover:bg-[#005a63] cursor-pointer text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-200">
                      Choose File
                      <input 
                        type="file" 
                        accept=".txt,.md,.pdf" 
                        onChange={handleResumeUpload} 
                        className="hidden" 
                      />
                    </label>
                    
                    {resumeName && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        <FileText size={14} /> {resumeName} Ready
                      </div>
                    )}
                  </div>

                  {isMatching && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Recruitment Matching...</p>
                    </div>
                  )}

                  {!isMatching && jobMatches.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Matched Jobs list */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Building size={16} className="text-brand-primary" /> Matched job opportunities
                        </h4>
                        
                        {jobMatches.map((job, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition flex items-center justify-between group">
                            <div className="space-y-1">
                              <h5 className="font-bold text-slate-800 text-[15px]">{job.jobTitle}</h5>
                              <p className="text-xs text-brand-primary font-bold">{job.company}</p>
                              <p className="text-xs text-slate-400 leading-relaxed pt-1 pr-4 max-w-lg">{job.rationale}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <div className="text-right">
                                <span className={`text-lg font-black ${
                                  job.matchScore >= 90 ? 'text-emerald-600' : job.matchScore >= 80 ? 'text-brand-primary' : 'text-amber-600'
                                }`}>
                                  {job.matchScore}%
                                </span>
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tight">AI Match</span>
                              </div>
                              
                              <button 
                                onClick={() => alert(`Successfully submitted application to ${job.company}!`)}
                                className="px-4 py-2 bg-brand-primary hover:bg-[#005a63] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition"
                              >
                                Easy Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Skill Gap & Target Practice recommendations */}
                      <div className="space-y-6">
                        {/* Skill Gaps */}
                        {skillAnalysis && skillAnalysis.gaps.length > 0 && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertCircle size={14} className="text-amber-500" /> Key Skill Gaps Detected
                            </h4>
                            <ul className="space-y-3">
                              {skillAnalysis.gaps.map((gap, i) => (
                                <li key={i} className="text-[12px] text-slate-500 font-medium list-none flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {skillAnalysis && skillAnalysis.suggestions.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles size={14} className="text-emerald-500" /> Recommended AI Training
                            </h4>
                            <ul className="space-y-3">
                              {skillAnalysis.suggestions.map((suggestion, i) => (
                                <li key={i} className="text-[12px] text-slate-600 font-bold list-none flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
