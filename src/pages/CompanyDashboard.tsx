import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, DatabaseZap, BrainCircuit, Trash2, Clock, Lock, ArrowRight, Video, Shield, HelpCircle, Trophy, Building } from 'lucide-react';

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'mockInterviews' | 'quizzes' | 'contests'>('mockInterviews');

  useEffect(() => {
    const savedComps = localStorage.getItem('mock_company_permissions');
    if (savedComps) {
      const parsed = JSON.parse(savedComps);
      setCompanies(parsed);
      if (parsed.length > 0) {
        setSelectedCompanyId(parsed[0].id);
      }
    }

    const savedReqs = localStorage.getItem('mock_company_requests');
    if (savedReqs) {
      setRequests(JSON.parse(savedReqs));
    }
  }, []);

  const currentCompany = companies.find(c => c.id === selectedCompanyId);
  const permissions = currentCompany?.permissions || { mockInterviews: false, quizzes: false, contests: false };

  const hasRequested = (type: string) => {
    return requests.some(r => r.domain === currentCompany?.domain && r.type === type);
  };

  const handleRequestAccess = (type: string, label: string) => {
    if (!currentCompany) return;
    const newReq = {
      id: `req-${Date.now()}`,
      company: currentCompany.name,
      domain: currentCompany.domain,
      type,
      label,
      date: 'Just now'
    };
    const newReqs = [...requests, newReq];
    setRequests(newReqs);
    localStorage.setItem('mock_company_requests', JSON.stringify(newReqs));
    alert('Request sent to Admin!');
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-68px)] bg-slate-50">
        <p className="text-slate-500 font-medium">No company found. Please set up companies in the Admin portal.</p>
      </div>
    );
  }

  const renderNotAuthorized = (type: string, label: string, icon: React.ReactNode) => {
    const requested = hasRequested(type);
    
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-slate-200 shadow-sm mt-12">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">{label} Not Enabled</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Your company does not currently have access to this feature. Request permission from the Master Admin to unlock the ability to create custom {label.toLowerCase()} for your candidates.
        </p>
        <button 
          onClick={() => !requested && handleRequestAccess(type, label)}
          disabled={requested}
          className={`px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 mx-auto ${
            requested ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-primary text-white hover:bg-brand-dark hover:shadow-brand-primary/25'
          }`}
        >
          {requested ? 'Request Pending...' : 'Request Access'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      
      {/* Premium Header */}
      <div className="pt-24 pb-20 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                <Building size={14} className="text-brand-primary" />
                Company Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Partner Dashboard</h1>
              <p className="text-slate-400 text-lg max-w-2xl">Manage your custom content, track candidates, and configure your hiring assessments.</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Viewing As</span>
              <select 
                value={selectedCompanyId} 
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl outline-none"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (@{c.domain})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="border-b border-slate-200 bg-white sticky top-[68px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button onClick={() => setActiveTab('mockInterviews')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'mockInterviews' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Video size={16} /> Mock Interviews
              {!permissions.mockInterviews && <Lock size={12} className="text-slate-300"/>}
            </button>
            <button onClick={() => setActiveTab('quizzes')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'quizzes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <HelpCircle size={16} /> Custom Quizzes
              {!permissions.quizzes && <Lock size={12} className="text-slate-300"/>}
            </button>
            <button onClick={() => setActiveTab('contests')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contests' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Trophy size={16} /> Host Contests
              {!permissions.contests && <Lock size={12} className="text-slate-300"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        
        {activeTab === 'mockInterviews' && (
          !permissions.mockInterviews ? (
            renderNotAuthorized('mockInterviews', 'Mock Interviews', <Video size={32}/>)
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-slate-200 shadow-sm mt-12">
              <Video size={48} className="text-brand-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Manage Mock Interviews</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                You have full access to create custom AI personas for your candidates. 
                (This editor functions similarly to the Admin Portal.)
              </p>
              <button className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-md opacity-50 cursor-not-allowed">
                Create Interview Template
              </button>
            </div>
          )
        )}

        {activeTab === 'quizzes' && (
          !permissions.quizzes ? (
            renderNotAuthorized('quizzes', 'Custom Quizzes', <HelpCircle size={32}/>)
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-slate-200 shadow-sm mt-12">
              <HelpCircle size={48} className="text-brand-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Manage Quizzes</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                You have full access to create custom quizzes tailored to your internal tooling and requirements.
              </p>
              <button className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-md opacity-50 cursor-not-allowed">
                Create Quiz
              </button>
            </div>
          )
        )}

        {activeTab === 'contests' && (
          !permissions.contests ? (
            renderNotAuthorized('contests', 'Host Contests', <Trophy size={32}/>)
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-slate-200 shadow-sm mt-12">
              <Trophy size={48} className="text-brand-primary mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Host Hiring Contests</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                You have full access to host large-scale hiring events and algorithmic contests.
              </p>
              <button className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-md opacity-50 cursor-not-allowed">
                Schedule Contest
              </button>
            </div>
          )
        )}

      </div>
    </div>
  );
}
