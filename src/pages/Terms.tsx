import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, ShieldCheck, ArrowLeft, 
  Terminal, Cpu, Award, AlertTriangle, Scale,
  Download, Printer, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: "acceptance",
    num: "1",
    title: "Acceptance of Terms",
    icon: Scale,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50/50 border-blue-100 text-blue-700",
    desc: "By registering an account, accessing compiler runtimes, participating in timed coding contests, or utilizing AI-mentoring modules on the Glintspark website, you agree to comply with and be bound by these Terms of Service.",
    callout: "If you do not agree to compile code in isolated sandboxes or adhere to code integrity rules, please do not utilize our compilers."
  },
  {
    id: "conduct",
    num: "2",
    title: "Code Integrity & Conduct",
    icon: Terminal,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50/50 border-purple-100 text-purple-700",
    desc: "Glintspark is a platform dedicated to genuine skill acquisition. Copying solutions, using automated bots to submit code, utilizing unauthorized external generative models during timed assessments, or trying to inject malicious packages into compilation runtimes is strictly prohibited. Submissions are continuously analyzed for plagiarism.",
    callout: "Glintspark leverages behavioral submission analytics to check code structure integrity and detect automated scraping or external copy-pastes."
  },
  {
    id: "sandbox-policy",
    num: "3",
    title: "Sandbox Runtime Caps",
    icon: Cpu,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
    desc: "To guarantee blazing-fast performance and prevent denial-of-service, all free and premium developer compilation runtimes are subject to fair-use execution limits (including memory limits, CPU time constraints, and maximum loops). Runtimes detected running mining scripts or network scans will be terminated immediately.",
    callout: "Standard sandbox executions have a hard limit of 5.0 seconds of CPU execution time and 512MB of RAM allocation."
  },
  {
    id: "certification",
    num: "4",
    title: "Verification & Certs",
    icon: Award,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50/50 border-amber-100 text-amber-700",
    desc: "Glintspark verified certifications represent verified developer achievements. Attempting to bypass proctoring tools, sharing answers, or taking assessments on behalf of other users violates our code of honor and will result in permanent suspension of certifications.",
    callout: "Suspensions due to verified certification breaches are final and result in removing public recruiter-share badges."
  },
  {
    id: "liability",
    num: "5",
    title: "Limitation of Liability",
    icon: AlertTriangle,
    color: "from-rose-500 to-red-500",
    bg: "bg-rose-50/50 border-rose-100 text-rose-700",
    desc: "Glintspark runtimes are provided 'as is'. We are not responsible for any bugs in compiling execution drafts or temporary server outages during local practice tracks.",
    callout: "Compilation results do not guarantee absolute compiler optimization outcomes, and runtime availability is governed by our SLAs."
  }
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative pb-32">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[50%] h-[400px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[40%] h-[500px] bg-emerald-50/30 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Banner Header */}
      <div className="pt-32 pb-12 relative z-10 border-b border-slate-200 bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-6 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <FileText size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">User Conduct & Rules</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">Terms of Service</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm">
                <Calendar size={13} /> Last Updated: June 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-xs font-bold shadow-sm">
                <ShieldCheck size={13} /> Active & Enforced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Workspace */}
      <div className="max-w-7xl mx-auto px-6 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column - Sticky Sidebar navigation */}
          <div className="lg:col-span-4 sticky top-28 space-y-6 hidden lg:block">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Table of Contents</h2>
              
              <div className="space-y-1">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                        isActive 
                          ? "bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-extrabold shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                          <Icon size={15} />
                        </div>
                        <span className="text-xs">{sec.title}</span>
                      </div>
                      <ChevronRight size={14} className={`opacity-60 transition-transform ${isActive ? "translate-x-0.5" : ""}`} />
                    </button>
                  );
                })}
              </div>

              {/* Utility buttons */}
              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100">
                <button 
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition border border-slate-200"
                >
                  <Printer size={13} /> Print Rules
                </button>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); window.print(); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  <Download size={13} /> PDF Version
                </a>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
              <h3 className="text-sm font-black tracking-tight mb-2">Code of Honor Questions?</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium mb-4">
                Reach out to our compliance panel to report plagiarism or review a compilation termination appeal.
              </p>
              <a href="mailto:support@glintspark.com" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold inline-flex items-center gap-1">
                Contact Compliance Team <ChevronRight size={12} />
              </a>
            </div>
          </div>

          {/* Right Column - Terms Content Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Introductory Statement */}
            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-indigo-950 font-black mb-2">Glintspark's User Agreement</h2>
              <p className="text-slate-650 text-slate-500 text-sm font-medium leading-relaxed">
                By entering the website, using our online IDE compilers, or signing up for assessment sessions, you agree to compile only authorized packages and respect academic honesty guidelines as outlined below.
              </p>
            </div>

            {/* Sections cards */}
            <div className="space-y-8">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <motion.div
                    key={sec.id}
                    id={sec.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:border-slate-300 transition-all scroll-mt-28"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sec.color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Section {sec.num}</span>
                        <h3 className="text-xl font-black text-slate-900">{sec.title}</h3>
                      </div>
                    </div>

                    <p className="text-slate-650 text-slate-600 text-sm leading-relaxed font-semibold mb-6">
                      {sec.desc}
                    </p>

                    {/* Rich Callout Alert */}
                    <div className={`p-4 border rounded-2xl text-xs font-semibold leading-relaxed ${sec.bg}`}>
                      <p className="flex items-start gap-2">
                        <span className="inline-block mt-0.5">•</span>
                        <span>{sec.callout}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Print/Download for small screen fallback */}
            <div className="lg:hidden flex gap-3">
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                <Printer size={14} /> Print Terms
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition shadow-sm"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
