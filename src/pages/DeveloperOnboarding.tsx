import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Mail, GraduationCap, Calendar, FileText, Upload, ArrowRight, Loader2, User, BookOpen, Code } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../services/supabaseService';

export const DeveloperOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const userEmail = user?.email || sessionStorage.getItem('mock_email') || '';
  const isGmail = userEmail.toLowerCase().endsWith('@gmail.com');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [skills, setSkills] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('edit') === 'true' && userEmail) {
      const usersData = JSON.parse(localStorage.getItem('mock_users_data') || '{}');
      if (usersData[userEmail]) {
        const data = usersData[userEmail];
        setFullName(data.fullName || '');
        setGender(data.gender || '');
        setCollege(data.college || '');
        setBranch(data.branch || '');
        setSkills(data.skills || '');
        setGraduationYear(data.graduationYear || '');
        setBackupEmail(data.backupEmail || '');
      }
    }
  }, [userEmail]);

  const MOCK_COLLEGES = [
    "Not Applicable (Normal User)",
    "Indian Institute of Technology (IIT)",
    "National Institute of Technology (NIT)",
    "SRIT",
    "Stanford University",
    "Massachusetts Institute of Technology (MIT)",
    "Harvard University"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

      setTimeout(async () => {
        const email = user?.email || sessionStorage.getItem('mock_email');
        if (email) {
          const usersData = JSON.parse(localStorage.getItem('mock_users_data') || '{}');
          usersData[email] = {
            ...usersData[email],
            fullName,
            gender,
            college,
            branch,
            skills,
            graduationYear,
            backupEmail,
            onboarded: true
          };
          localStorage.setItem('mock_users_data', JSON.stringify(usersData));
        }

        if (user?._id && !user._id.startsWith('mock_')) {
          await supabaseDB.upsertUser({
             _id: user._id,
             email: user.email,
             name: fullName || user.name,
             onboarding_completed: true
          });
        }

        setLoading(false);
        navigate('/dashboard');
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 md:p-10">
        
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="scale-90 origin-center mb-4">
            <Logo dark={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Complete your profile</h2>
          <p className="text-slate-500 text-sm mt-2">Before you access your dashboard, we need a few more details.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full Name & Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Gender</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                  <User size={18} />
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900 appearance-none"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* College & Branch Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">College / University</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                  <GraduationCap size={18} />
                </div>
                <input 
                  type="text" 
                  list="college-options"
                  placeholder="e.g. Stanford University or Not Applicable"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900"
                  required
                />
                <datalist id="college-options">
                  {MOCK_COLLEGES.map((c, i) => <option key={i} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Branch / Major</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                  <BookOpen size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. CSE"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Skills Row */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Skills</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                <Code size={18} />
              </div>
              <input 
                type="text" 
                placeholder="e.g. React, Python, Data Structures"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Graduation Year & Backup Email Row */}
            <div className={`grid grid-cols-1 ${!isGmail ? 'md:grid-cols-2' : ''} gap-5`}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Graduation Year</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                    <Calendar size={18} />
                  </div>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900 appearance-none"
                    required
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="Not Applicable">Not Applicable</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isGmail && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Backup Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Personal email"
                      value={backupEmail}
                      onChange={(e) => setBackupEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-900"
                      required={!isGmail}
                    />
                  </div>
                </div>
              )}
            </div>

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Resume (PDF) <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
            <div className="relative">
              <input 
                type="file" 
                id="resume"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="resume"
                className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${resumeFile ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-300 hover:border-brand-primary hover:bg-slate-50'}`}
              >
                {resumeFile ? (
                  <>
                    <FileText className="text-brand-primary mb-2" size={24} />
                    <span className="text-sm font-bold text-slate-900">{resumeFile.name}</span>
                    <span className="text-xs text-brand-primary font-medium mt-1">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm font-medium text-slate-600">Click to upload your resume</span>
                    <span className="text-xs text-slate-400 mt-1">PDF format only (Max 5MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-dark disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>Complete Profile <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
