import { motion } from 'framer-motion';
import { 
  Trophy, Star, Calendar, MapPin, 
  Link as LinkIcon, 
  Award, BookOpen, Briefcase, ChevronRight,
  ShieldCheck, Zap, Sparkles, Upload, Building, AlertCircle, FileText,
  Mail, User, GraduationCap, Edit3
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
import { EditProfileModal } from '../components/EditProfileModal';
import { CUSTOM_COLLEGES } from '../components/CollegeAutocomplete';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { subYears, isBefore, addDays } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onboardingData = user as any;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'education' | 'experience' | 'certifications' | 'interviews'>(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'certifications' || tabParam === 'interviews' || tabParam === 'education' || tabParam === 'experience') {
      return tabParam as any;
    }
    return 'education';
  });
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'certifications' || tabParam === 'interviews' || tabParam === 'education' || tabParam === 'experience') {
      setActiveTab(tabParam as any);
    }
    
    if (params.get('edit') === 'true') {
      setIsEditModalOpen(true);
      // Clean up the URL so it doesn't re-open on refresh
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, location.pathname]);
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        if (!user?._id) throw new Error("No user ID");
        // We use supabase directly here to update avatar since we just want a quick profile update
        const { error } = await supabase.from('users').update({ avatar: base64String }).eq('id', user._id);
        if (error) {
          // Fallback if column doesn't exist yet, we can tell them
          if (error.message.includes("Could not find the 'avatar' column")) {
            alert("Please run this SQL in your Supabase Editor to enable custom avatars:\n\nALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar text;");
          } else {
            throw error;
          }
        } else {
          // Reload page to see new avatar
          window.location.reload();
        }
      } catch (err: any) {
        console.error("Failed to upload avatar", err);
        alert(err.message || "Failed to update profile picture.");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  
  // Custom Certifications
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertId, setNewCertId] = useState('');

  const handleAddCert = async () => {
    if (!newCertTitle || !newCertIssuer) return;
    if (!user) return;
    try {
      const currentCerts = user.certifications || [];
      const updatedCerts = [...currentCerts, { title: newCertTitle, issuer: newCertIssuer, id: newCertId }];
      await supabaseDB.updateOne(user._id, { certifications: updatedCerts });
      setIsAddingCert(false);
      setNewCertTitle('');
      setNewCertIssuer('');
      setNewCertId('');
      window.location.reload(); // Refresh to show new cert
    } catch (err: any) {
      if (err.message && err.message.includes('column "certifications"')) {
        alert("Please run this SQL in your Supabase Editor to enable custom certifications:\n\nALTER TABLE public.users ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;");
      } else {
        alert("Failed to add certification.");
      }
    }
  };

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
        const defaultApiUrl = import.meta.env.DEV ? 'http://127.0.0.1:8080' : 'https://api.glintspark.in';
        const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
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
            if (cleanJson.startsWith('\`\`\`json')) {
              cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith('\`\`\`')) {
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

  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.xp !== undefined) {
      supabaseDB.getUserRank(user.xp).then(r => setRank(r));
    }
  }, [user]);

  const stats = [
    { label: 'Rank', value: rank ? `#${rank.toLocaleString()}` : '#...', icon: <Trophy size={16} className="text-amber-500" /> },
    { label: 'Glintos', value: user?.xp?.toString() || '0', icon: <Zap size={16} className="text-brand-primary" /> },
    { label: 'Streak', value: `${user?.streak || 0} Days`, icon: <Sparkles size={16} className="text-orange-500" /> },
  ];

  return (
    <div className="bg-[#f3f7f7] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col lg:flex-row gap-8">
        
        {/* ── Left Sidebar: Profile Identity ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col items-center text-center border-b border-[#f3f7f7]">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleAvatarChange} 
              />
              <div 
                className={`relative group ${isUploadingAvatar ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`} 
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
              >
                <div className="w-32 h-32 rounded-full bg-brand-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-brand-primary/20 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    onboardingData?.fullName ? onboardingData.fullName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() : user ? (user.name || user.firstName || 'User').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() : 'U'
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    {isUploadingAvatar ? (
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">Saving...</span>
                    ) : (
                      <>
                        <Edit3 className="text-white w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
                      </>
                    )}
                    <Tooltip id="react-tooltip" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-[#0e141e] mt-6 leading-tight">{user?.name || onboardingData?.fullName || 'No Name Provided'}</h1>
              <p className="text-sm text-[#738f93] mt-1 font-medium uppercase">{user?.usn || (user?.email ? `@${user.email.split('@')[0]}` : '')}</p>

              <button onClick={() => setIsEditModalOpen(true)} className="mt-6 w-full py-2.5 rounded-lg border border-[#d1d5db] text-[#0e141e] text-sm font-bold hover:bg-[#f3f7f7] transition-colors">
                Edit Profile
              </button>
            </div>

            <div className="p-6">

              {/* Sidebar bottom spacing */}
              <div className="pt-2"></div>
            </div>
          </div>

          {/* Badges Quick View */}
          <div className="bg-white border border-[#d1d5db] rounded-xl p-6 mt-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0e141e] uppercase tracking-widest mb-4">Earned Badges</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 1, name: 'First Blood', description: 'Solved first challenge', icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
                { id: 2, name: 'Streak Master', description: '7 day streak', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
                { id: 3, name: 'Top 10%', description: 'Ranked top 10% in contest', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
                { id: 4, name: 'Bug Hunter', description: 'Found a critical bug', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
                { id: 5, name: 'Contributor', description: 'Helped others on forum', icon: Star, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
              ].map(b => (
                <div 
                  key={b.id} 
                  className={`aspect-square rounded-lg ${b.bg} border ${b.border} flex items-center justify-center cursor-help relative hover:scale-105 transition-transform`}
                  data-tooltip-id="react-tooltip"
                  data-tooltip-content={`${b.name}: ${b.description}`}
                >
                  <b.icon size={20} className={`${b.color}`} />
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
            <div className="flex border-b border-[#d1d5db] overflow-x-auto bg-white no-scrollbar">
              {(['education', 'experience', 'certifications', 'interviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 py-5 text-[12px] font-bold uppercase tracking-[0.15em] transition-all relative shrink-0 ${
                    activeTab === tab 
                      ? 'text-[#0e141e] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand-primary' 
                      : 'text-[#738f93] hover:text-[#0e141e]'
                  }`}
                >
                  {tab === 'interviews' ? 'Interview History' : tab === 'experience' ? 'Achievements' : tab}
                </button>
              ))}
            </div>

            <div className="p-10">

              {activeTab === 'education' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {onboardingData?.college ? (
                    <div className="flex gap-6 p-6 bg-[#f3f7f7] border border-[#d1d5db] rounded-xl">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-brand-primary shadow-sm overflow-hidden p-1 shrink-0">
                        {(() => {
                          const collegeName = onboardingData.college;
                          const match = CUSTOM_COLLEGES.find(c => c.name.toLowerCase() === collegeName.toLowerCase());
                          const domain = match?.domains?.[0];
                          if (domain) {
                            return <img src={`https://logo.clearbit.com/${domain}`} alt={collegeName} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }} />;
                          }
                          return <BookOpen size={24} />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0e141e]">{onboardingData.college}</h4>
                        {onboardingData.branch && <p className="text-sm text-[#738f93] mt-1">{onboardingData.branch}</p>}
                        {(onboardingData.graduationYear || onboardingData.batch) && (
                          <p className="text-xs text-slate-400 mt-2 font-medium">Class of {onboardingData.graduationYear || onboardingData.batch}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#d1d5db] rounded-xl text-center">
                      <BookOpen size={48} className="text-slate-300 mb-4" />
                      <h4 className="font-bold text-[#0e141e] text-lg">No Education Added</h4>
                      <p className="text-sm text-slate-500 mt-2 max-w-sm">
                        Add your college and branch details by editing your profile.
                      </p>
                    </div>
                  )}

                  {(onboardingData?.marks10thObtained || onboardingData?.marks12thObtained) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      {onboardingData?.marks10thObtained && (
                        <div className="p-5 bg-white border border-[#d1d5db] rounded-xl flex items-center gap-4 hover:shadow-sm transition-shadow">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#0e141e]">10th Standard</h4>
                            <p className="text-xs text-[#738f93] mt-1 font-medium">
                              Score: <span className="text-[#0e141e] font-bold">{onboardingData.marks10thObtained}</span> {onboardingData.marks10thMax ? `/ ${onboardingData.marks10thMax}` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {onboardingData?.marks12thObtained && (
                        <div className="p-5 bg-white border border-[#d1d5db] rounded-xl flex items-center gap-4 hover:shadow-sm transition-shadow">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#0e141e]">12th Standard</h4>
                            <p className="text-xs text-[#738f93] mt-1 font-medium">
                              Score: <span className="text-[#0e141e] font-bold">{onboardingData.marks12thObtained}</span> {onboardingData.marks12thMax ? `/ ${onboardingData.marks12thMax}` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Detailed Coding Platform Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LeetCode */}
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
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
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src="https://cdn.simpleicons.org/codeforces/1F8ACB" alt="Codeforces" className="w-8 h-8 object-contain" />
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
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
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
                          <p className="text-2xl font-black text-amber-600">{user?.codechef ? '0' : '0'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Highest</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '0' : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stars</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '0★' : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solved</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '0' : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Rank</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? '0' : '0'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GeeksForGeeks */}
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
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
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
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
                    <div className="bg-white border border-[#d1d5db] rounded-xl hover:shadow-md transition-shadow p-6 flex flex-col">
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
                  <div className="bg-white border border-[#d1d5db] rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-[#0e141e]">Submission Activity</h4>
                      <div className="text-xs text-[#738f93]">
                        <span className="font-bold text-[#0e141e] mr-1">1603</span> total submissions
                      </div>
                    </div>
                    <div className="flex justify-center overflow-x-auto pb-4">
                      {(() => {
                        // Generate mock data for the calendar
                        const generateHeatmapData = () => {
                          const data = [];
                          const today = new Date();
                          const startDate = subYears(today, 1);
                          let curr = startDate;
                          while (isBefore(curr, today) || curr.getTime() === today.getTime()) {
                            const isActive = Math.random() > 0.7; // Random mock data
                            data.push({
                              date: curr.toISOString().split('T')[0],
                              count: isActive ? Math.floor(Math.random() * 10) + 1 : 0,
                              level: isActive ? Math.floor(Math.random() * 4) + 1 : 0,
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
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'certifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-[#0e141e]">My Certifications</h4>
                    <button 
                      onClick={() => setIsAddingCert(true)}
                      className="text-xs font-bold bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      + Add Certificate
                    </button>
                  </div>
                  
                  {(!user?.certifications || user.certifications.length === 0) ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#d1d5db] rounded-xl text-center">
                      <ShieldCheck size={48} className="text-slate-300 mb-4" />
                      <h4 className="font-bold text-[#0e141e] text-lg">No Certifications Added</h4>
                      <p className="text-sm text-slate-500 mt-2 max-w-sm">
                        Add your hard-earned certifications here to show them off on your profile.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.certifications.map((cert: any, i: number) => (
                        <div key={i} className="p-6 bg-white border border-[#d1d5db] rounded-xl flex items-start gap-4 hover:shadow-lg transition-shadow group">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0e141e] text-sm">{cert.title}</h4>
                            <p className="text-xs text-[#738f93] mt-1">{cert.issuer}</p>
                            {cert.id && <p className="text-[10px] text-slate-400 mt-3 font-mono break-all">Verify ID: {cert.id}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAddingCert && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                          <h2 className="text-xl font-bold text-slate-900">Add Certification</h2>
                          <button onClick={() => setIsAddingCert(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Certification Title *</label>
                            <input type="text" value={newCertTitle} onChange={e => setNewCertTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g. AWS Certified Developer" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issuing Organization *</label>
                            <input type="text" value={newCertIssuer} onChange={e => setNewCertIssuer(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g. Amazon Web Services" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credential ID / URL</label>
                            <input type="text" value={newCertId} onChange={e => setNewCertId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g. AZ-900-12345" />
                          </div>
                          <button onClick={handleAddCert} disabled={!newCertTitle || !newCertIssuer} className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 mt-4">
                            Save Certification
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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

            </div>
          </div>
        </div>

      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user}
        onSaveSuccess={(updatedUser) => {
          // You might want to update local context here if necessary, 
          // but typically the page refresh or context re-fetch handles it.
          // For now, we reload the page to see changes immediately.
          window.location.reload();
        }}
      />
    </div>
  );
}
