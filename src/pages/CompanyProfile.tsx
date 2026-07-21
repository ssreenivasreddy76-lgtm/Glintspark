import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Globe, Users, Briefcase, 
  ChevronRight, Edit3, Settings, ShieldCheck, Mail, Target
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CompanyProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'criteria'>('about');

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 font-sans selection:bg-brand-primary/20">
      
      {/* ── Cover & Header Section ── */}
      <div className="relative bg-white border-b border-slate-200">
        <div className="h-48 md:h-64 bg-gradient-to-r from-slate-900 via-brand-primary to-indigo-900 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg backdrop-blur-md transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100">
            <Edit3 size={16} /> Edit Cover
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20 mb-8 relative z-10">
            
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl p-2 shadow-xl shadow-slate-200/50 border-4 border-white">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-black text-brand-primary border border-slate-200 overflow-hidden relative">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <Building2 size={48} className="text-slate-300" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Edit3 size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 pt-2 md:pt-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  {user?.name || 'TechCorp Global'} 
                  <ShieldCheck size={24} className="text-brand-primary drop-shadow-sm" />
                </h1>
                <p className="text-lg text-slate-500 font-medium mt-1">Innovative Software Solutions</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><MapPin size={14} className="text-slate-400" /> San Francisco, CA</span>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><Users size={14} className="text-slate-400" /> 1,000 - 5,000 Employees</span>
                  <a href="#" className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition-colors px-3 py-1 rounded-full text-brand-primary"><Globe size={14} /> techcorp.com</a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-2.5 bg-brand-primary hover:bg-brand-light text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2">
                  <Edit3 size={16} /> Edit Profile
                </button>
                <Link to="/dashboard" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all">
                  <Settings size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Main Content */}
        <div className="flex-1">
          {/* Custom Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 mb-6 inline-flex flex-wrap gap-2">
            {[
              { id: 'about', label: 'About Company', icon: Building2 },
              { id: 'jobs', label: 'Active Listings', icon: Briefcase },
              { id: 'criteria', label: 'Hiring Criteria', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/80 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Company Overview</h2>
                    <button className="text-brand-primary hover:text-brand-light font-bold text-sm flex items-center gap-1"><Edit3 size={14}/> Edit</button>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    TechCorp Global is a leading provider of innovative software solutions, specializing in AI-driven analytics, cloud infrastructure, and enterprise scalability. We are committed to pushing the boundaries of technology and creating products that empower businesses globally. Our culture is built on continuous learning, bold experimentation, and a passion for engineering excellence.
                  </p>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</p>
                      <p className="font-bold text-slate-900">Information Technology</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Founded</p>
                      <p className="font-bold text-slate-900">2010</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Headquarters</p>
                      <p className="font-bold text-slate-900">San Francisco, CA</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Email</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2">careers@techcorp.com <Mail size={14} className="text-slate-400"/></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900">Open Roles</h2>
                  <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-colors shadow-md">
                    + Post New Job
                  </button>
                </div>
                
                {/* Mock Job Listings */}
                {[
                  { title: 'Senior Frontend Engineer', type: 'Full-time', location: 'Remote', applicants: 124 },
                  { title: 'Backend Developer (Node.js)', type: 'Full-time', location: 'San Francisco, CA', applicants: 89 },
                  { title: 'Cloud Infrastructure Architect', type: 'Contract', location: 'Hybrid', applicants: 42 }
                ].map((job, i) => (
                  <div key={i} className="bg-white rounded-[24px] shadow-sm border border-slate-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-primary/30 transition-colors group cursor-pointer">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm font-semibold text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md">{job.type}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{job.applicants}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicants</p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'criteria' && (
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/80 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">Preferred Tech Stack & Criteria</h2>
                  <button className="text-brand-primary hover:text-brand-light font-bold text-sm flex items-center gap-1"><Edit3 size={14}/> Edit</button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Core Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL'].map(tech => (
                        <span key={tech} className="bg-brand-primary/10 text-brand-primary font-bold px-4 py-2 rounded-lg text-sm border border-brand-primary/20">{tech}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Minimum Glintspark Criteria</h3>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Minimum Glintos Score</span>
                      <span className="bg-slate-900 text-white font-black px-3 py-1 rounded-md">8,000+</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between mt-2">
                      <span className="font-bold text-slate-700">Required Badges</span>
                      <span className="text-slate-600 font-semibold">Frontend Master, Problem Solver</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Stats Widget */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/80 p-6 sticky top-24">
            <h3 className="font-black text-slate-900 mb-6">Company Engagement</h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hires</p>
                    <p className="font-black text-slate-900">42</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interviews Conducted</p>
                    <p className="font-black text-slate-900">156</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-500 text-center mb-3">Partner Status</p>
              <div className="bg-gradient-to-r from-amber-200 to-yellow-400 p-0.5 rounded-xl shadow-sm">
                <div className="bg-white px-4 py-2 rounded-[10px] text-center">
                  <span className="font-black text-amber-500 uppercase tracking-widest text-sm flex items-center justify-center gap-1">
                    <ShieldCheck size={16}/> Premium Partner
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
