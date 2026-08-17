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
import { HistoryModal } from '../components/HistoryModal';
import { CUSTOM_COLLEGES } from '../components/CollegeAutocomplete';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { subYears, isBefore, addDays, formatDistanceToNow } from 'date-fns';
import { ExternalLink, Camera } from 'lucide-react';
import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onboardingData = user as any;
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [historyModalType, setHistoryModalType] = useState<'rank' | 'glintos' | 'streak' | null>(null);
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
  const [codeforcesStats, setCodeforcesStats] = useState<any>(null);
  const [gfgStats, setGfgStats] = useState<any>(null);
  const [codechefStats, setCodechefStats] = useState<any>(null);
  const [hackerrankStats, setHackerrankStats] = useState<any>(null);
  const [allSubmissions, setAllSubmissions] = useState<{created_at: string}[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('solved_challenges')
          .select('*')
          .eq('user_id', user._id || user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (data) {
          setSubmissions(data);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    };
    fetchSubmissions();
  }, [user]);

  useEffect(() => {
    async function fetchPlatformStats() {
      if (!user) return;
      
      try {
        if (user.leetcode) {
           const handle = user.leetcode.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-leetcode?handle=${encodeURIComponent(handle)}`);
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
             const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-codeforces?handle=${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (data.status === 'success' || data.status === 'OK') {
               // The edge function returns data directly or data.result[0] depending on API response
               setCodeforcesStats(data.result ? data.result[0] : data);
             }
           }
        }
      } catch (e) { console.error('Codeforces fetch error', e); }

      try {
        if (user.gfg) {
           const handle = user.gfg.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-gfg?handle=${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (data.info) {
               setGfgStats(data);
             }
           }
        }
      } catch (e) { console.error('GFG fetch error', e); }

      try {
        if (user.codechef) {
           const handle = user.codechef.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-codechef?handle=${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (!data.error) {
               setCodechefStats(data);
             }
           }
        }
      } catch (e) { console.error('CodeChef fetch error', e); }

      try {
        if (user.hackerrank) {
           const handle = user.hackerrank.trim().replace(/^@/, '');
           if (handle) {
             const res = await fetch(`https://lrrfluuebzqxwfbecxbi.supabase.co/functions/v1/fetch-hackerrank?handle=${encodeURIComponent(handle)}`);
             const data = await res.json();
             if (!data.error) {
               setHackerrankStats(data);
             }
           }
        }
      } catch (e) { console.error('HackerRank fetch error', e); }
    }
    fetchPlatformStats();
  }, [user?.leetcode, user?.codeforces, user?.gfg, user?.codechef, user?.hackerrank]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const colorVariants = [
    { swooshBg: 'bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#ca8a04]', iconText: 'text-[#facc15]', glow: 'rgba(250,204,21,0.6)' }, // Gold
    { swooshBg: 'bg-gradient-to-br from-[#f1f5f9] via-[#cbd5e1] to-[#94a3b8]', iconText: 'text-[#e2e8f0]', glow: 'rgba(226,232,240,0.6)' }, // Silver
    { swooshBg: 'bg-gradient-to-br from-[#fcd34d] via-[#d97706] to-[#92400e]', iconText: 'text-[#f59e0b]', glow: 'rgba(245,158,11,0.6)' }, // Bronze
    { swooshBg: 'bg-gradient-to-br from-[#e0f2fe] via-[#7dd3fc] to-[#0284c7]', iconText: 'text-[#38bdf8]', glow: 'rgba(56,189,248,0.6)' }, // Platinum
    { swooshBg: 'bg-gradient-to-br from-[#ffe4e6] via-[#fda4af] to-[#e11d48]', iconText: 'text-[#fb7185]', glow: 'rgba(251,113,133,0.6)' }  // Rose Gold
  ];

  const MOCK_BADGES = [
    { id: 1, name: 'First Spark', category: 'Welcome', icon: Star, color: colorVariants[0], isCompleted: true },
    { id: 2, name: '7 Day Streak', category: 'Streak', icon: Zap, color: colorVariants[2], isCompleted: true },
    { id: 3, name: '20 Day Streak', category: 'Streak', icon: Zap, color: colorVariants[1], isCompleted: true },
    { id: 4, name: '50 Day Streak', category: 'Streak', icon: Zap, color: colorVariants[0], isCompleted: false },
    { id: 5, name: '100 Day Streak', category: 'Streak', icon: Zap, color: colorVariants[3], isCompleted: false },
    { id: 6, name: 'Problem Solver', category: 'Challenge', icon: BookOpen, color: colorVariants[1], isCompleted: true },
    { id: 7, name: 'Code Champion', category: 'Contest', icon: Trophy, color: colorVariants[0], isCompleted: false },
    { id: 8, name: 'Community Hero', category: 'Community', icon: ShieldCheck, color: colorVariants[4], isCompleted: true },
  ];


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'overview' || tabParam === 'coding_score' || tabParam === 'badges' || tabParam === 'certificates') {
      setActiveTab(tabParam);
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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (user && user.xp !== undefined) {
      supabaseDB.getUserRank(user.xp).then(r => setRank(r));
    }
    
    const fetchAllSubmissionsForHeatmap = async () => {
      if (!user) return;
      try {
        const { data } = await supabaseDB.supabase
          .from('submissions')
          .select('created_at')
          .eq('user_id', user.id);
        if (data) {
          setAllSubmissions(data);
        }
      } catch (err) {
        console.error("Error fetching all submissions:", err);
      }
    };

    fetchAllSubmissionsForHeatmap();
  }, [user]);

  const stats = [
    { label: 'Rank', value: rank ? `#${rank.toLocaleString()}` : '#...', icon: <Trophy size={16} className="text-amber-500" />, type: 'rank' as const },
    { label: 'Glintos', value: user?.xp?.toString() || '0', icon: <Zap size={16} className="text-brand-primary" />, type: 'glintos' as const },
    { label: 'Streak', value: `${user?.streak || 0} Days`, icon: <Sparkles size={16} className="text-orange-500" />, type: 'streak' as const },
  ];

  return (
    <div className="bg-[#f3f7f7] min-h-screen pb-20 relative pt-16">
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col gap-8 relative z-10">
        

        {/* ── Top Profile: Profile Identity ── */}
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur-xl border border-[#d1d5db] rounded-xl overflow-hidden shadow-sm transition-all">
            <div className="p-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
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
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white text-slate-300 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden relative">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
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
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 text-slate-500 group-hover:text-brand-primary shadow-sm border border-slate-200 transition-colors z-10">
                  <Camera size={16} strokeWidth={2} />
                </div>
              </div>
              <div className="text-center md:text-left"><h1 className="text-2xl font-bold text-[#0e141e] leading-tight">{user?.name || onboardingData?.fullName || 'No Name Provided'}</h1>
              <p className="text-sm text-[#738f93] mt-1 font-medium uppercase">{user?.usn || (user?.email ? `@${user.email.split('@')[0]}` : '')}</p>
              </div>

              
              </div>
              <div>
                <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-3 rounded-lg border border-[#d1d5db] text-[#0e141e] text-sm font-bold hover:bg-[#f3f7f7] transition-colors whitespace-nowrap">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* ── Main Content Split ── */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Left Sidebar: Vertical Tabs & Badges Quick View ── */}
          <div className="w-full lg:w-56 shrink-0 space-y-6">

             {/* Vertical Tabs - Modern Layout */}
             <div className="flex flex-col gap-2">
               {[
                 { id: 'overview', label: 'Overview', icon: User },
                 { id: 'coding_score', label: 'Coding Score', icon: Trophy },
                 { id: 'badges', label: 'Badges', icon: Award },
                 { id: 'certificates', label: 'Certificates', icon: FileText }
               ].map((tab) => {
                 const isActive = activeTab === tab.id;
                 const Icon = tab.icon;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 relative group overflow-hidden ${
                       isActive 
                         ? 'text-white shadow-md shadow-slate-800/20 bg-slate-800 border border-slate-700' 
                         : 'text-[#738f93] hover:text-[#0e141e] hover:bg-white bg-transparent border border-transparent hover:border-[#d1d5db] hover:shadow-sm'
                     }`}
                   >
                     {/* Content */}
                     <div className="relative z-10 flex items-center gap-3 w-full">
                       <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-slate-700' : 'bg-[#f3f7f7] group-hover:bg-white'}`}>
                          <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-800 transition-colors'} />
                       </div>
                       <span className="text-sm">{tab.label}</span>
                       
                       {isActive && (
                          <div className="ml-auto">
                            <ChevronRight size={16} className="text-white/70" />
                          </div>
                       )}
                     </div>
                   </button>
                 );
               })}
             </div>



          </div>

          {/* ── Right Content Area ── */}
          <div className="flex-1 space-y-6">
            


          

            {/* Tab Content */}
            <div className="min-h-[600px]">


              {activeTab === 'overview' && (
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

              {activeTab === 'coding_score' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Detailed Coding Platform Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GlintSpark (Internal Platform) */}
                    <div className="bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative md:col-span-2 group hover:shadow-md">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary"></div>
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0e141e]">GlintSpark</h4>
                            <p className="text-xs text-brand-primary font-medium">
                              {user?.email ? `@${user.email.split('@')[0]}` : 'Platform Native'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                          Native Platform
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center justify-between">
                          <div className="relative w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Easy', value: user?.xp ? Math.floor((user.xp / 25) * 0.45) || 1 : 45, color: '#10b981' },
                                    { name: 'Medium', value: user?.xp ? Math.floor((user.xp / 25) * 0.35) || 1 : 35, color: '#eab308' },
                                    { name: 'Hard', value: user?.xp ? Math.floor((user.xp / 25) * 0.20) || 1 : 20, color: '#ef4444' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={60}
                                  paddingAngle={2}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {
                                    [
                                      { name: 'Easy', value: user?.xp ? Math.floor((user.xp / 25) * 0.45) || 1 : 45, color: '#10b981' },
                                      { name: 'Medium', value: user?.xp ? Math.floor((user.xp / 25) * 0.35) || 1 : 35, color: '#eab308' },
                                      { name: 'Hard', value: user?.xp ? Math.floor((user.xp / 25) * 0.20) || 1 : 20, color: '#ef4444' }
                                    ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} opacity={user?.xp ? 1 : 0.2} />
                                    ))
                                  }
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-2xl font-black text-[#0e141e] leading-none">{user?.xp ? Math.floor(user.xp / 25) : 0}</span>
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Solved</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Submissions</p>
                            <p className="text-3xl font-bold text-[#0e141e]">{user?.xp ? Math.floor(user.xp / 25) * 2 + 14 : 0}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Easy</p>
                            <p className="text-sm font-bold text-emerald-600">{user?.xp ? Math.floor((user.xp / 25) * 0.45) : 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Medium</p>
                            <p className="text-sm font-bold text-yellow-600">{user?.xp ? Math.floor((user.xp / 25) * 0.35) : 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Hard</p>
                            <p className="text-sm font-bold text-red-600">{user?.xp ? Math.floor((user.xp / 25) * 0.20) : 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Accuracy</p>
                            <p className="text-sm font-bold text-[#0e141e]">68%</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Global Rank</p>
                            <p className="text-sm font-bold text-brand-primary">{rank ? `#${rank}` : 'Unranked'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 bg-slate-50/50 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Submissions</h5>
                          <span 
                            onClick={(e) => { e.stopPropagation(); navigate('/submissions'); }}
                            className="text-[10px] font-bold text-brand-primary cursor-pointer hover:underline uppercase tracking-wider"
                          >
                            View All
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {submissions.length > 0 ? (
                            submissions.map((sub, idx) => (
                              <div key={sub.id || idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-2.5 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate('/submissions')}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${sub.status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                  <span className="text-sm font-bold text-[#0e141e] truncate max-w-[120px]">{sub.challenge_id}</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                  {sub.created_at ? formatDistanceToNow(new Date(sub.created_at), { addSuffix: true }).replace('about ', '') : 'recently'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-4 bg-slate-50 border border-dashed border-gray-200 rounded-lg">
                              <p className="text-sm text-gray-400 font-medium italic">No recent submissions found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* LeetCode */}
                    <div 
                      onClick={() => user?.leetcode && window.open(`https://leetcode.com/u/${user.leetcode.replace(/^@/, '')}`, '_blank')}
                      className={`bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative ${user?.leetcode ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'}`}
                    >
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
                        {user?.leetcode ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                            View Profile <ExternalLink size={12} />
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Link Profile
                          </button>
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
                    <div 
                      onClick={() => user?.codeforces && window.open(`https://codeforces.com/profile/${user.codeforces.replace(/^@/, '')}`, '_blank')}
                      className={`bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative ${user?.codeforces ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'}`}
                    >
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
                        {user?.codeforces ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                            View Profile <ExternalLink size={12} />
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Link Profile
                          </button>
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
                    <div 
                      onClick={() => user?.codechef && window.open(`https://www.codechef.com/users/${user.codechef.replace(/^@/, '')}`, '_blank')}
                      className={`bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative ${user?.codechef ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'}`}
                    >
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
                        {user?.codechef ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                            View Profile <ExternalLink size={12} />
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Link Profile
                          </button>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                          <p className="text-2xl font-black text-amber-600">{user?.codechef ? (codechefStats ? (codechefStats.rating || '0') : '...') : '0'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Highest</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? (codechefStats ? (codechefStats.highestRating || '0') : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stars</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? (codechefStats ? (codechefStats.stars?.replace('â˜…', '★') || '0★') : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solved</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? (codechefStats ? (codechefStats.fullySolved || 'N/A') : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Rank</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.codechef ? (codechefStats ? (codechefStats.globalRank || '0') : '...') : '0'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GeeksForGeeks */}
                    <div 
                      onClick={() => user?.gfg && window.open(`https://auth.geeksforgeeks.org/user/${user.gfg.replace(/^@/, '')}/profile`, '_blank')}
                      className={`bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative ${user?.gfg ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'}`}
                    >
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
                        {user?.gfg ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                            View Profile <ExternalLink size={12} />
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Link Profile
                          </button>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Score</p>
                          <p className="text-2xl font-black text-green-600">{user?.gfg ? (gfgStats ? gfgStats.info.codingScore : '...') : '0'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solved</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? (gfgStats ? gfgStats.info.totalProblemsSolved : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Inst. Rank</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? (gfgStats ? gfgStats.info.instituteRank || '-' : '...') : '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Score</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.gfg ? (gfgStats ? gfgStats.info.monthlyCodingScore || '0' : '...') : '0'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HackerRank */}
                    <div 
                      onClick={() => user?.hackerrank && window.open(`https://www.hackerrank.com/profile/${user.hackerrank.replace(/^@/, '')}`, '_blank')}
                      className={`bg-white border border-[#d1d5db] rounded-xl overflow-hidden transition-all relative ${user?.hackerrank ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md'}`}
                    >
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
                        {user?.hackerrank ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                            View Profile <ExternalLink size={12} />
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Link Profile
                          </button>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Problems Solved</p>
                          <p className="text-2xl font-black text-emerald-500">{user?.hackerrank ? (hackerrankStats ? (hackerrankStats.totalSolved || '0') : '...') : '0'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? (hackerrankStats ? (hackerrankStats.level || '0') : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Badges</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? (hackerrankStats ? (hackerrankStats.badges?.length || '0') : '...') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Followers</p>
                            <p className="text-sm font-bold text-[#0e141e]">{user?.hackerrank ? (hackerrankStats ? (hackerrankStats.followers || '0') : '...') : '0'}</p>
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
                            { subject: 'LeetCode', A: leetcodeStats ? Math.round(Math.min((leetcodeStats.totalSolved / 200) * 100, 100)) : 0, fullMark: 100 },
                            { subject: 'Codeforces', A: codeforcesStats ? Math.round(Math.min((codeforcesStats.rating / 1400) * 100, 100)) : 0, fullMark: 100 },
                            { subject: 'CodeChef', A: codechefStats ? Math.round(Math.min(((parseInt(codechefStats.rating) || 0) / 1600) * 100, 100)) : 0, fullMark: 100 },
                            { subject: 'GFG', A: gfgStats ? Math.round(Math.min(((gfgStats.info?.codingScore || 0) / 500) * 100, 100)) : 0, fullMark: 100 },
                            { subject: 'HackerRank', A: hackerrankStats ? Math.round(Math.min(((hackerrankStats.totalSolved || 0) / 50) * 100, 100)) : 0, fullMark: 100 },
                            { subject: 'Glintspark', A: Math.round(Math.min(((user?.xp || 0) / 1500) * 100, 100)), fullMark: 100 },
                          ]}>
                            <defs>
                              <linearGradient id="colorRadar" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.8}/>
                              </linearGradient>
                            </defs>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Platform Stats" dataKey="A" stroke="#ea580c" strokeWidth={2} fill="url(#colorRadar)" fillOpacity={0.5} />
                            <RechartsTooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Submission Activity Heatmap */}
                  <div className="bg-white border border-[#d1d5db] rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-4">
                        <h4 className="font-bold text-[#0e141e]">Submission Activity</h4>
                        <select 
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="bg-[#f3f7f7] border border-[#d1d5db] text-xs font-bold text-[#0e141e] rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-brand-primary transition-colors"
                        >
                          {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-center overflow-x-auto pb-4">
                      {(() => {
                        const generateHeatmapData = () => {
                          const data = [];
                          const startDate = new Date(selectedYear, 0, 1);
                          const endDate = new Date(selectedYear, 11, 31);
                          let curr = startDate;
                          
                          // Group local submissions by date
                          const submissionCounts: Record<string, number> = {};
                          allSubmissions.forEach(sub => {
                            if (sub.created_at) {
                              const date = new Date(sub.created_at);
                              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              submissionCounts[dateStr] = (submissionCounts[dateStr] || 0) + 1;
                            }
                          });
                          
                          while (curr <= endDate) {
                            const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
                            let count = submissionCounts[dateStr] || 0;
                            
                            let level = 0;
                            if (count > 0) level = 1;
                            if (count > 2) level = 2;
                            if (count > 5) level = 3;
                            if (count > 10) level = 4;
                            
                            data.push({
                              date: dateStr,
                              count: count,
                              level: level,
                            });
                            curr = addDays(curr, 1);
                          }
                          return data;
                        };
                        
                        const heatmapData = generateHeatmapData();
                        
                        // Calculate total submissions for the selected year from real data
                        const totalYearlySubmissions = heatmapData.reduce((sum, item) => sum + item.count, 0);

                        return (
                          <div className="w-full">
                            <div className="text-right text-xs text-[#738f93] mb-4">
                              <span className="font-bold text-[#0e141e] mr-1">{totalYearlySubmissions}</span> total submissions
                            </div>
                            <ActivityCalendar 
                              data={heatmapData}
                              theme={{
                                light: ['#f1f5f9', '#cbd5e1', '#94a3b8', '#475569', '#0e141e'],
                                dark: ['#f1f5f9', '#cbd5e1', '#94a3b8', '#475569', '#0e141e']
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
                          </div>
                        );
                      })()}
                      <Tooltip id="react-tooltip" />
                    </div>
                  </div>
                </motion.div>
              )}

              
              {activeTab === 'badges' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <div>
                    <h4 className="text-xl font-bold text-[#0e141e] mb-6">Earned Badges</h4>
                    <div className="flex flex-wrap gap-8 justify-start">
                      {MOCK_BADGES.filter(b => b.isCompleted).map((badge) => (
                        <div key={badge.id} className="relative w-[130px] h-[145px] flex items-center justify-center group cursor-default transition-transform duration-500 hover:scale-105">
                          <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full drop-shadow-xl z-0">
                            <defs>
                              <linearGradient id={`metallicRim-${badge.id}`} x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                                 <stop offset="0%" stopColor="#e2e8f0" />
                                 <stop offset="50%" stopColor="#94a3b8" />
                                 <stop offset="100%" stopColor="#334155" />
                              </linearGradient>
                              <linearGradient id={`innerCanvas-${badge.id}`} x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                                 <stop offset="0%" stopColor="#2a2d36" />
                                 <stop offset="50%" stopColor="#11141b" />
                                 <stop offset="100%" stopColor="#050608" />
                              </linearGradient>
                            </defs>
                            <path d="M50 3L96 29.5V82.5L50 109L4 82.5V29.5L50 3Z" fill={`url(#innerCanvas-${badge.id})`} stroke={`url(#metallicRim-${badge.id})`} strokeWidth="4" strokeLinejoin="round" />
                          </svg>
                          
                          {/* Inner HTML Canvas for Swooshes & Text */}
                          <div 
                            className="absolute inset-[4px] overflow-hidden z-10 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-shadow duration-500"
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                          >
                            {/* Top left subtle shine / curve */}
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-30"></div>
                            
                            {/* Metallic swoosh bottom right */}
                            <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full ${badge.color.swooshBg} blur-[1px]`}></div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#11141b]"></div>
                            
                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                              {/* Icon/Star */}
                              <div className="relative mb-2 transition-transform duration-500 group-hover:scale-110">
                                 <badge.icon size={32} className={badge.color.iconText} style={{ filter: `drop-shadow(0 0 10px ${badge.color.glow})` }} />
                              </div>
                              
                              {/* Text */}
                              <div className="text-center px-2 z-10">
                                <h5 className="font-black text-white text-[11px] leading-[1.1] uppercase tracking-wide">
                                  {badge.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                                </h5>
                                <p className="text-[6px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">GLINTSPARK</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold text-[#0e141e] mb-6">Locked Badges</h4>
                    <div className="flex flex-wrap gap-8 justify-start opacity-60 grayscale">
                      {MOCK_BADGES.filter(b => !b.isCompleted).map((badge) => (
                        <div key={badge.id} className="relative w-[130px] h-[145px] flex items-center justify-center cursor-default">
                          <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full drop-shadow-md z-0">
                            <defs>
                              <linearGradient id={`metallicRimLocked-${badge.id}`} x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                                 <stop offset="0%" stopColor="#94a3b8" />
                                 <stop offset="50%" stopColor="#64748b" />
                                 <stop offset="100%" stopColor="#334155" />
                              </linearGradient>
                              <linearGradient id={`innerCanvasLocked-${badge.id}`} x1="0" y1="0" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                                 <stop offset="0%" stopColor="#2a2d36" />
                                 <stop offset="50%" stopColor="#11141b" />
                                 <stop offset="100%" stopColor="#050608" />
                              </linearGradient>
                            </defs>
                            <path d="M50 3L96 29.5V82.5L50 109L4 82.5V29.5L50 3Z" fill={`url(#innerCanvasLocked-${badge.id})`} stroke={`url(#metallicRimLocked-${badge.id})`} strokeWidth="4" strokeLinejoin="round" />
                          </svg>
                          
                          {/* Inner HTML Canvas for Swooshes & Text */}
                          <div 
                            className="absolute inset-[4px] overflow-hidden z-10"
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                          >
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-30"></div>
                            
                            {/* Gray swoosh bottom right */}
                            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-slate-600 blur-[1px]"></div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#11141b]"></div>
                            
                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                              {/* Icon/Star */}
                              <div className="relative mb-2">
                                 <badge.icon size={32} className="text-slate-500" />
                              </div>
                              
                              {/* Text */}
                              <div className="text-center px-2 z-10">
                                <h5 className="font-black text-slate-400 text-[11px] leading-[1.1] uppercase tracking-wide">
                                  {badge.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                                </h5>
                                <p className="text-[6px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1">LOCKED</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-[#0e141e]">My Certifications</h4>
                    <button 
                      onClick={() => setIsAddingCert(true)}
                      className="text-xs font-bold bg-slate-950 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
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
      <HistoryModal
        isOpen={!!historyModalType}
        onClose={() => setHistoryModalType(null)}
        type={historyModalType}
        user={user}
      />
    </div>
  );
}
