import { useState } from 'react';
import { firebaseDB } from '../services/firebaseService';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Trophy, Calendar, Clock, Building2, Save, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateContest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPublishing, setIsPublishing] = useState(false);

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    noEndTime: false,
    orgType: '',
    orgName: ''
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handlePublish = async (isDraft = false) => {
    if (isPublishing) return;
    
    if (!form.name || !form.startDate || !form.startTime || !form.orgType || !form.orgName) {
      alert("Please fill in all required fields.");
      return;
    }
    
    if (!form.noEndTime && (!form.endDate || !form.endTime)) {
      alert("Please provide an end time or check 'This contest has no end time'.");
      return;
    }

    setIsPublishing(true);

    const startMs = new Date(`${form.startDate}T${form.startTime}`).getTime();
    let durationMins = 0;
    
    if (form.noEndTime) {
      durationMins = 999999;
    } else if (form.endDate && form.endTime) {
      const endMs = new Date(`${form.endDate}T${form.endTime}`).getTime();
      durationMins = Math.max(0, Math.floor((endMs - startMs) / 60000));
    }

    let newId = `custom-${Date.now()}`;
    try {
      const contests = await firebaseDB.getContests();
      const sequentialNumber = contests.length + 1;
      newId = sequentialNumber.toString().padStart(10, '0');
    } catch (err) {
      console.warn("Could not fetch contests for ID generation", err);
    }

    const newContest = {
      id: newId,
      title: form.name,
      date: `${form.startDate} ${form.startTime}`,
      duration: durationMins,
      prize: '0 Points',
      participants: '0',
      type: form.orgType,
      organizationName: form.orgName,
      noEndTime: form.noEndTime,
      status: isDraft ? 'Draft' : 'Published',
      color: 'indigo',
      problems: [],
      source: 'custom'
    };
    
    try {
      await firebaseDB.saveContest(newContest);
    } catch (err) {
      console.error("Failed to save contest:", err);
    }
    
    if (location.state?.fromAdmin) {
      navigate('/master');
    } else {
      navigate(`/contests/${newContest.id}/manage`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
       {/* Premium Header */}
       <div className="bg-[#0b0f17] border-b border-slate-800 sticky top-0 md:top-[56px] z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-400">
               <Link to="/contests/manage" className="hover:text-white transition-colors">Contests</Link>
               <ChevronRight size={14} />
               <span className="text-white">Schedule New Contest</span>
            </div>
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => handlePublish(true)}
                  disabled={isPublishing}
                  className="px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
               >
                 <Save size={16} /> Save Draft
               </button>
               <button 
                  onClick={() => handlePublish(false)}
                  disabled={isPublishing}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
               >
                 <Rocket size={16} /> {isPublishing ? 'Publishing...' : 'Create & Publish'}
               </button>
            </div>
          </div>
       </div>

       <main className="max-w-4xl mx-auto px-6 pt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-5 shadow-sm border border-blue-200">
              <Trophy size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Schedule Contest</h1>
            <p className="text-slate-500 text-lg">Define the core settings for your upcoming coding challenge.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
             
             {/* General Details */}
             <div className="p-8 border-b border-slate-100">
               <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"><Trophy size={16} /></div>
                 General Details
               </h2>
               
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Contest Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g., Spring Hiring Challenge 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-medium"
                  />
               </div>
             </div>

             {/* Schedule */}
             <div className="p-8 border-b border-slate-100 bg-slate-50/50">
               <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"><Calendar size={16} /></div>
                 Schedule & Timing
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                      <span>Start Time <span className="text-rose-500">*</span></span>
                      <span className="text-xs font-semibold text-slate-400">IST Timezone</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-sm" />
                      </div>
                      <div className="relative w-36">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                      <span>End Time <span className="text-rose-500">*</span></span>
                      <span className="text-xs font-semibold text-slate-400">IST Timezone</span>
                    </label>
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${form.noEndTime ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} disabled={form.noEndTime} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-sm" />
                      </div>
                      <div className="relative w-36">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} disabled={form.noEndTime} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary shadow-sm" />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer w-fit group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={form.noEndTime} onChange={e => set('noEndTime', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-brand-primary checked:border-brand-primary transition-all" />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-[14px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Contest runs indefinitely (No end time)</span>
                    </label>
                  </div>
               </div>
             </div>

             {/* Organization */}
             <div className="p-8">
               <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"><Building2 size={16} /></div>
                 Organization Details
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Organization Type <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select 
                        value={form.orgType} 
                        onChange={e => set('orgType', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select type...</option>
                        <option value="Company">Company / Enterprise</option>
                        <option value="School">University / College</option>
                        <option value="Bootcamp">Coding Bootcamp</option>
                        <option value="Non Profit">Non-Profit Organization</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Organization Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.orgName} 
                      onChange={e => set('orgName', e.target.value)}
                      placeholder="e.g., Acme Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                 </div>
               </div>
             </div>
             
          </motion.div>
       </main>
    </div>
  );
}
