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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full max-w-7xl bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Edit Profile</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Changes are saved to your account immediately.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-16">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}
            
            {/* PERSONAL INFORMATION */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">PERSONAL INFORMATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 ${showValidation && !firstName.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 ${showValidation && !lastName.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 ${showValidation && !phoneNumber.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input type="email" value={email} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Linked from your Google account.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">USN / Roll Number <span className="text-red-500">*</span></label>
                  <input type="text" value={usn} onChange={e => setUsn(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 ${showValidation && !usn.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Backup Email</label>
                  <input type="email" placeholder="e.g. personal@gmail.com" value={backupEmail} onChange={e => setBackupEmail(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* ACADEMIC INFORMATION */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">ACADEMIC INFORMATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="md:col-span-2 relative z-50">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">College <span className="text-red-500">*</span></label>
                  <CollegeAutocomplete value={college} onChange={setCollege} hasError={showValidation} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch <span className="text-red-500">*</span></label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 appearance-none cursor-pointer ${showValidation && !branch.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batch <span className="text-red-500">*</span></label>
                  <select value={batch} onChange={e => setBatch(e.target.value)} className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 appearance-none cursor-pointer ${showValidation && !batch.trim() ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'}`}>
                    <option value="" disabled>Select your batch</option>
                    {Array.from({ length: 21 }, (_, i) => 2020 + i).map(year => (
                      <option key={year} value={`${year}-${year + 4}`}>
                        {year}-{year + 4}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ACADEMIC MARKS */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ACADEMIC MARKS</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Optional — 10th and 12th standard marks, shown on your profile.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">10th Standard</label>
                  <div className="flex gap-3">
                    <input type="text" placeholder="Max marks" value={marks10thMax} onChange={e => setMarks10thMax(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                    <input type="text" placeholder="Obtained marks" value={marks10thObtained} onChange={e => setMarks10thObtained(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">12th Standard</label>
                  <div className="flex gap-3">
                    <input type="text" placeholder="Max marks" value={marks12thMax} onChange={e => setMarks12thMax(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                    <input type="text" placeholder="Obtained marks" value={marks12thObtained} onChange={e => setMarks12thObtained(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* CODING PROFILES */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CODING PROFILES <span className="text-red-500">*</span></h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">At least one platform username is required to appear on the leaderboard.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    LeetCode 
                  </label>
                  <input type="text" value={leetcode} onChange={e => setLeetcode(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Codeforces 
                  </label>
                  <input type="text" value={codeforces} onChange={e => setCodeforces(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    CodeChef 
                  </label>
                  <input type="text" value={codechef} onChange={e => setCodechef(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    GeeksForGeeks 
                  </label>
                  <input type="text" value={gfg} onChange={e => setGfg(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                <div>
                   <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      HackerRank 
                    </label>
                    <input type="text" value={hackerrank} onChange={e => setHackerrank(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      GitHub 
                    </label>
                    <input type="text" value={github} onChange={e => setGithub(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                </div>
              </div>
              
              <div className="mt-4">
                 <p className="text-xs text-slate-500 font-medium">To change this, contact your admin or <a href="#" className="text-brand-primary hover:underline">submit a report.</a></p>
              </div>
            </div>

            {/* OPTIONAL PROFILES */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OPTIONAL PROFILES</h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">Shown on your profile but not included in your score or rank.</p>
              
              <div className="w-full md:w-1/2 md:pr-4">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">GitHub</label>
                  <input type="text" placeholder="e.g. johndoe" value={github} onChange={e => setGithub(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
              </div>
            </div>

          </div>
          
          <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-[#6366f1] text-white text-sm font-bold hover:bg-[#4f46e5] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
