import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  X, 
  Building2, 
  BookOpen, 
  Users, 
  BarChart3, 
  Terminal,
  User,
  CheckCircle2,
  Lock,
  Cloud,
  Cpu,
  LineChart,
  Smartphone,
  Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SOLUTIONS = [
  {
    title: "For Students",
    description: "Master algorithms, prepare for placements, and get hired.",
    icon: <User className="text-sky-600" size={28} />,
    features: [
      "Learn programming from beginner to advanced.",
      "Practice coding with real interview questions.",
      "AI-powered mock interviews.",
      "Online compiler with instant feedback.",
      "Track progress, streaks, and rankings.",
      "Placement preparation roadmap."
    ],
    tag: "Learn & Grow",
    bgLight: "bg-sky-50",
    textDark: "text-sky-700",
    borderLight: "border-sky-100",
    buttonBg: "bg-sky-600 hover:bg-sky-700"
  },
  {
    title: "For Colleges",
    description: "Equip your campus with powerful tools to assess and train students efficiently.",
    icon: <GraduationCap className="text-indigo-600" size={28} />,
    features: [
      "Conduct coding assessments and lab exams.",
      "Track student performance with analytics.",
      "Manage coding contests and hackathons.",
      "Reduce manual evaluation.",
      "Generate reports for faculty."
    ],
    tag: "Education",
    bgLight: "bg-indigo-50",
    textDark: "text-indigo-700",
    borderLight: "border-indigo-100",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700"
  },
  {
    title: "For Recruiters",
    description: "Streamline your hiring process with automated assessments and insights.",
    icon: <Briefcase className="text-rose-600" size={28} />,
    features: [
      "Assess candidate coding skills.",
      "Create custom coding tests.",
      "View detailed performance reports.",
      "Shortlist candidates based on scores."
    ],
    tag: "Hiring",
    bgLight: "bg-rose-50",
    textDark: "text-rose-700",
    borderLight: "border-rose-100",
    buttonBg: "bg-rose-600 hover:bg-rose-700"
  },
  {
    title: "For Companies",
    description: "A complete enterprise platform to scale your technical talent acquisition.",
    icon: <Building2 className="text-amber-600" size={28} />,
    features: [
      "Campus hiring platform.",
      "Technical screening automation.",
      "Real-time coding interviews.",
      "Talent discovery through contests."
    ],
    tag: "Enterprise",
    bgLight: "bg-amber-50",
    textDark: "text-amber-700",
    borderLight: "border-amber-100",
    buttonBg: "bg-amber-600 hover:bg-amber-700"
  },
  {
    title: "For Developers",
    description: "Build, debug, and collaborate in a modern, cloud-based workspace.",
    icon: <Terminal className="text-emerald-600" size={28} />,
    features: [
      "Online IDE supporting multiple languages.",
      "AI coding assistant.",
      "Debugging and code analysis.",
      "Project workspace and collaboration."
    ],
    tag: "Engineering",
    bgLight: "bg-emerald-50",
    textDark: "text-emerald-700",
    borderLight: "border-emerald-100",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700"
  }
];

const WHY_FEATURES = [
  { title: "AI-powered learning", icon: <Cpu className="text-indigo-500" size={24} /> },
  { title: "Secure online assessments", icon: <Lock className="text-rose-500" size={24} /> },
  { title: "Scalable cloud platform", icon: <Cloud className="text-sky-500" size={24} /> },
  { title: "Real-time coding environment", icon: <Terminal className="text-emerald-500" size={24} /> },
  { title: "Performance analytics", icon: <LineChart className="text-amber-500" size={24} /> },
  { title: "Mobile-friendly experience", icon: <Smartphone className="text-purple-500" size={24} /> },
  { title: "Enterprise-grade security", icon: <Shield className="text-slate-700" size={24} /> },
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden pt-24">
      
      {/* Light Clean Hero Section */}
      <section className="py-20 relative overflow-hidden text-center px-6">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 20, 0] }} 
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-[20%] w-[40%] h-[300px] bg-indigo-100/50 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -20, 20, 0], y: [0, 20, -10, 0] }} 
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 right-[20%] w-[40%] h-[300px] bg-emerald-100/40 blur-[100px] rounded-full" 
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 block bg-indigo-50 w-fit mx-auto px-4 py-1.5 rounded-full border border-indigo-100">
              Glintspark Solutions
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
              Standardizing technical hiring across the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">global workspace</span>.
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Whether you are an institute preparing students for the workforce, or a developer aiming for your dream job, Glintspark provides a unified platform to succeed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Cards */}
      <section className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 90, damping: 15 }}
                className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group hover:border-slate-300 transition-colors"
              >
                {/* Background Accent */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-100 ${sol.bgLight}`} />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${sol.bgLight} ${sol.borderLight}`}>
                      {sol.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${sol.bgLight} ${sol.borderLight} ${sol.textDark}`}>
                      {sol.tag}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-3">{sol.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6 min-h-[40px]">
                    {sol.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {sol.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2.5 text-[13px] font-bold text-slate-700">
                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${sol.textDark}`} />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 relative z-10 mt-auto">
                  <Link 
                    to="/auth" 
                    state={{ 
                      role: sol.title.includes('Developers') || sol.title.includes('Students') ? 'developer' : 'company',
                      from: '/solutions'
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] ${sol.buttonBg}`}
                  >
                    Get Started <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Glintspark Section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Why Glintspark?</h2>
            <p className="text-slate-500 font-medium text-lg">
              The industry-leading platform engineered to deliver reliability, security, and world-class developer experiences.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {WHY_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[280px] flex-1 max-w-[350px]"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Modals for About Us and Careers */}
      <AnimatePresence>
        {activeSection && (activeSection === 'about-us' || activeSection === 'careers') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-[2rem] p-8 max-w-2xl w-full text-slate-900 shadow-2xl relative z-10 overflow-hidden"
            >
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
              >
                <X size={18} />
              </button>

              {activeSection === 'about-us' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Glintspark Mission</span>
                      <h3 className="text-2xl font-extrabold text-slate-900">About Our Platform</h3>
                    </div>
                  </div>

                  <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    Glintspark was founded in 2026 with a clear, ambitious goal: **to standardize technical skill evaluation globally**. We believe that developer credentials should be based on real coding proficiency, not arbitrary resumes.
                  </p>
                  
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    Our platform unifies compiler sandboxing, timed contest systems, and interactive curriculum modules to provide a holistic environment where learners level up their logic and recruiters discover proven engineering talent.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[
                      { label: 'Active Developers', val: '500K+' },
                      { label: 'Submissions Ran', val: '10M+' },
                      { label: 'Institutes Active', val: '1.2K+' }
                    ].map((st, si) => (
                      <div key={si} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <p className="text-2xl font-black text-slate-900">{st.val}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{st.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Join the Team</span>
                      <h3 className="text-2xl font-extrabold text-slate-900">Open Career Roles</h3>
                    </div>
                  </div>

                  <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    We are a fully remote, globally distributed team of engineers, educators, and product designers. We value visual precision, robust code sandboxes, and absolute customer obsession.
                  </p>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {[
                      { title: 'Core Sandbox Systems Engineer', type: 'Remote / US', spec: 'Go • Docker • Linux Kernel' },
                      { title: 'Senior UX/UI Designer', type: 'Remote / Europe', spec: 'React • Tailwind CSS • UI/UX' },
                      { title: 'Institute Relations Manager', type: 'Remote / India', spec: 'B2B Sales • Account Management' }
                    ].map((role, ri) => (
                      <div key={ri} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{role.title}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{role.spec}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg shrink-0">
                          {role.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button 
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => navigate('/auth')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
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
