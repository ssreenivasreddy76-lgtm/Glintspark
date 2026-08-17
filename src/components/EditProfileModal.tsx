import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import type { User } from '../types';
import { supabaseDB, supabase } from '../services/supabaseService';
import { CollegeAutocomplete } from './CollegeAutocomplete';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSaveSuccess: (updatedUser: User) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onSaveSuccess }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  
  const [marks10thMax, setMarks10thMax] = useState('');
  const [marks10thObtained, setMarks10thObtained] = useState('');
  const [marks12thMax, setMarks12thMax] = useState('');
  const [marks12thObtained, setMarks12thObtained] = useState('');
  
  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [codechef, setCodechef] = useState('');
  const [gfg, setGfg] = useState('');
  const [hackerrank, setHackerrank] = useState('');
  
  const [github, setGithub] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || user.name?.split(' ')[0] || '');
      setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
      setBackupEmail(user.backupEmail || '');
      setUsn(user.usn || '');
      
      setCollege(user.college || 'SRIT Anantapur');
      setBranch(user.branch || 'CSE');
      setBatch(user.batch || '2024-2028');
      
      setMarks10thMax(user.marks10thMax || '');
      setMarks10thObtained(user.marks10thObtained || '');
      setMarks12thMax(user.marks12thMax || '');
      setMarks12thObtained(user.marks12thObtained || '');
      
      setLeetcode(user.leetcode || '');
      setCodeforces(user.codeforces || '');
      setCodechef(user.codechef || '');
      setGfg(user.gfg || '');
      setHackerrank(user.hackerrank || '');
      
      setGithub(user.github || '');
      
      setError(null);
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !usn.trim() || !college.trim() || !branch.trim() || !batch.trim()) {
      setShowValidation(true);
      setError('Please fill up all required details.');
      return;
    }

    setShowValidation(false);
    setIsSaving(true);
    setError(null);
    
    try {
      if (backupEmail && backupEmail !== user.backupEmail) {
        const { data, error } = await supabaseDB.supabase
          .from('users')
          .select('id')
          .eq('backup_email', backupEmail)
          .neq('id', user._id)
          .limit(1);

        if (error) {
          console.error("Supabase Error querying backupEmail:", error);
        }

        if (data && data.length > 0) {
          throw new Error('This backup email is already in use by another account.');
        }
      }

      if (usn && usn !== user.usn) {
        const { data, error } = await supabaseDB.supabase
          .from('users')
          .select('id')
          .eq('usn', usn)
          .neq('id', user._id)
          .limit(1);

        if (error) {
          console.error("Supabase Error querying USN:", error);
        }

        if (data && data.length > 0) {
          throw new Error('This USN / Roll Number is already registered to another account.');
        }
      }

      const updatedUser = await supabaseDB.updateOne(user._id, {
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phoneNumber,
        backupEmail,
        usn,
        college,
        branch,
        batch,
        marks10thMax,
        marks10thObtained,
        marks12thMax,
        marks12thObtained,
        leetcode,
        codeforces,
        codechef,
        gfg,
        hackerrank,
        github
      });
      onSaveSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full max-h-[90vh] max-w-4xl bg-slate-50 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200 shrink-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Update your personal and academic details.</p>
            </div>
            <button onClick={onClose} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-bold rounded-r-lg shadow-sm">
                {error}
              </div>
            )}
            
            {/* PERSONAL INFORMATION CARD */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Personal Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                    First Name <span className="text-[10px] text-slate-400 font-semibold tracking-normal uppercase bg-slate-100 px-1.5 py-0.5 rounded">(As per Aadhaar/College ID)</span> <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white ${showValidation && !firstName.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                    Last Name <span className="text-[10px] text-slate-400 font-semibold tracking-normal uppercase bg-slate-100 px-1.5 py-0.5 rounded">(As per Aadhaar/College ID)</span> <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white ${showValidation && !lastName.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number <span className="text-red-500">*</span></label>
                  <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white ${showValidation && !phoneNumber.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">USN / Roll Number <span className="text-red-500">*</span></label>
                  <input type="text" value={usn} onChange={e => setUsn(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white ${showValidation && !usn.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Primary Email</label>
                  <input type="email" value={email} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed outline-none" />
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1"><Lock size={12} /> Linked to your Google account</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Backup Email</label>
                  <input type="email" placeholder="e.g. personal@gmail.com" value={backupEmail} onChange={e => setBackupEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* ACADEMIC INFORMATION CARD */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Academic Details</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 relative z-50">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">College <span className="text-red-500">*</span></label>
                  <CollegeAutocomplete value={college} onChange={setCollege} hasError={showValidation} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Branch <span className="text-red-500">*</span></label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white appearance-none cursor-pointer ${showValidation && !branch.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`}>
                    <option value="" disabled>Select your branch</option>
                    <option value="CSE">Computer Science and Engineering (CSE)</option>
                    <option value="ECE">Electronics and Communication (ECE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EEE">Electrical and Electronics (EEE)</option>
                    <option value="ME">Mechanical Engineering (ME)</option>
                    <option value="CE">Civil Engineering (CE)</option>
                    <option value="AI_ML">Artificial Intelligence & Machine Learning (AI&ML)</option>
                    <option value="AI_DS">Artificial Intelligence & Data Science (AI&DS)</option>
                    <option value="CSBS">Computer Science and Business Systems (CSBS)</option>
                    <option value="Other">Other Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Batch <span className="text-red-500">*</span></label>
                  <select value={batch} onChange={e => setBatch(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none transition-all focus:ring-2 focus:bg-white appearance-none cursor-pointer ${showValidation && !batch.trim() ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'}`}>
                    <option value="" disabled>Select your batch</option>
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i)
                      .reverse()
                      .map(year => (
                      <option key={year} value={`${year}-${year + 4}`}>{year}-{year + 4}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Optional Marks sub-section */}
              <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Academic Marks (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">10th Standard</label>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Obtained" value={marks10thObtained} onChange={e => setMarks10thObtained(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" />
                      <span className="text-slate-400 font-bold">/</span>
                      <input type="text" placeholder="Max" value={marks10thMax} onChange={e => setMarks10thMax(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">12th Standard</label>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Obtained" value={marks12thObtained} onChange={e => setMarks12thObtained(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" />
                      <span className="text-slate-400 font-bold">/</span>
                      <input type="text" placeholder="Max" value={marks12thMax} onChange={e => setMarks12thMax(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CODING PROFILES CARD */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Coding Platforms</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">At least 1 required</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'LeetCode', value: leetcode, setter: setLeetcode },
                  { label: 'Codeforces', value: codeforces, setter: setCodeforces },
                  { label: 'CodeChef', value: codechef, setter: setCodechef },
                  { label: 'GeeksForGeeks', value: gfg, setter: setGfg },
                  { label: 'HackerRank', value: hackerrank, setter: setHackerrank },
                  { label: 'GitHub', value: github, setter: setGithub }
                ].map((platform) => (
                  <div key={platform.label}>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">{platform.label}</label>
                    <input 
                      type="text" 
                      placeholder={`Your ${platform.label} handle`}
                      value={platform.value} 
                      onChange={e => platform.setter(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200 outline-none transition-all" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="p-6 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shrink-0 z-10">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all focus:ring-2 focus:ring-slate-200 outline-none"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 outline-none"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
