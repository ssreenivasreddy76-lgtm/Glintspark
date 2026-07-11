import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, ChevronRight, ShieldCheck, Zap, X, Building2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SOLUTIONS = [
  {
    title: "For Companies",
    description: "The complete enterprise toolset to automate your technical screening, proctor assessments, and hire verified engineering talent efficiently.",
    icon: <Briefcase className="text-indigo-400" size={24} />,
    features: ["Remote Proctoring", "Custom Programming Assessments", "Interviewer Dashboards"],
    widget: (
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 font-sans">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Candidate Assessment</span>
          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Passing
          </span>
        </div>
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">JD</div>
          <div>
            <h4 className="font-bold text-white text-xs">Jane Doe</h4>
            <p className="text-[10px] text-slate-500 font-semibold">Senior React Candidate</p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-900 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Score: <span className="text-white">92 / 100</span></span>
          <span>Time: <span className="text-white">45m / 90m</span></span>
        </div>
        <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-500/10">
          View Submission
        </button>
      </div>
    )
  },
  {
    title: "For Universities",
    description: "Equip your computer science students with structured learning paths, interactive curriculum, and direct pathways to top global tech employers.",
    icon: <GraduationCap className="text-emerald-400" size={24} />,
    features: ["Curriculum Integrations", "Student Progress Analytics", "Partner Job Placements"],
    widget: (
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 font-sans">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cohort Analytics</span>
          <span className="text-[9px] font-bold text-slate-400">CS-202</span>
        </div>
        <div className="space-y-2.5 py-1">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Avg. Progress (DSA Path)</span>
              <span className="text-emerald-400">76%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[76%]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Challenge Completion Rate</span>
              <span className="text-emerald-400">89%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[89%]" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "For Developers",
    description: "Build your professional engineering profile, clear specialized tracks, earn verified certificates, and stand out directly to recruiters.",
    icon: <Zap className="text-amber-400" size={24} />,
    features: ["Interactive Practice IDE", "Verified Certifications", "Recruiter Direct Messaging"],
    widget: (
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 font-sans">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Recruiter Review</span>
          <span className="text-amber-400 text-xs font-black">★ 4.9 Match</span>
        </div>
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-lg shadow-amber-500/10">M</div>
          <div>
            <h4 className="font-bold text-white text-xs">Alex Chen</h4>
            <p className="text-[10px] text-slate-400 font-bold">Algorithms Expert Tag</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] font-black bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">Python Master</span>
          <span className="text-[9px] font-black bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">React Certified</span>
        </div>
        <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/10">
          Request Interview
        </button>
      </div>
    )
  }
];

export default function Solutions() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get('section');
  const handleClose = () => {
    navigate({ search: '' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e] relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="pt-36 pb-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ x: [0, 60, -30, 0], y: [0, -30, 40, 0] }} 
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] bg-indigo-950/40 blur-[130px] rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -40, 20, 0], y: [0, 40, -20, 0] }} 
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-950/30 blur-[120px] rounded-full" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary mb-4 block underline decoration-brand-primary decoration-2 underline-offset-8">
              Glintspark Solutions
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
              Standardizing technical hiring across the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-emerald-400">global workspace</span>.
            </h1>
            <p className="text-lg text-slate-455 text-slate-400 font-semibold leading-relaxed">
              Whether you are scaling a fast-moving enterprise engineering department, training code academy graduates, or looking to get hired, Glintspark has your solution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Detailed Rows */}
      <section className="py-24 bg-slate-50/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-36">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 90, damping: 15 }}
                className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Text Side */}
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100">
                    {sol.icon}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{sol.title}</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-semibold">
                    {sol.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {sol.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                        <ShieldCheck size={18} className="text-brand-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Link 
                      to="/auth" 
                      state={{ 
                        role: sol.title === 'For Developers' ? 'developer' : 'company',
                        from: '/solutions'
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-brand-primary hover:scale-[1.02] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    >
                      Get Started <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Graphical Widget Side */}
                <div className="flex-1 w-full flex items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Glowing core animation */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {sol.widget}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals for About Us and Careers */}
      <AnimatePresence>
        {activeSection && (activeSection === 'about-us' || activeSection === 'careers') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-[2rem] p-8 max-w-2xl w-full text-white shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Glowing Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              {activeSection === 'about-us' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Glintspark Mission</span>
                      <h3 className="text-2xl font-extrabold text-white">About Our Platform</h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    Glintspark was founded in 2026 with a clear, ambitious goal: **to standardize technical skill evaluation globally**. We believe that developer credentials should be based on real coding proficiency, not arbitrary resumes.
                  </p>
                  
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Our platform unifies compiler sandboxing, timed contest systems, and interactive curriculum modules to provide a holistic environment where learners level up their logic and recruiters discover proven engineering talent.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[
                      { label: 'Active Developers', val: '500K+' },
                      { label: 'Submissions Ran', val: '10M+' },
                      { label: 'Recruiters Active', val: '1.2K+' }
                    ].map((st, si) => (
                      <div key={si} className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl text-center">
                        <p className="text-2xl font-black text-white">{st.val}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{st.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-primary/20"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Join the Team</span>
                      <h3 className="text-2xl font-extrabold text-white">Open Career Roles</h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    We are a fully remote, globally distributed team of engineers, educators, and product designers. We value visual precision, robust code sandboxes, and absolute customer obsession.
                  </p>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {[
                      { title: 'Core Sandbox Systems Engineer', type: 'Remote / US', spec: 'Go • Docker • Linux Kernel' },
                      { title: 'Senior UX/UI Designer', type: 'Remote / Europe', spec: 'Figma • Framer Motion • HSL Systems' },
                      { title: 'Developer Relations Manager', type: 'Bengaluru / Hybrid', spec: 'Technical Content • Community' }
                    ].map((role, ri) => (
                      <div key={ri} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-colors">
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{role.title}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{role.spec}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
                          {role.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button 
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition-all"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => navigate('/auth')}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
