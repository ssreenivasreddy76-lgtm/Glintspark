import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Calendar, Lock, ArrowLeft, 
  Database, Cpu, Users, Key, UserCheck, 
  Download, Printer, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: "data-collection",
    num: "1",
    title: "Data Collection",
    icon: Database,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50/50 border-blue-100 text-blue-700",
    desc: "We collect information you provide directly to us when creating a developer or enterprise account, solving coding challenges, or submitting certification tests. This includes your name, email address, profile credentials, and source code submissions.",
    callout: "Glintspark never sells, rents, or monetizes your private personal profile information to third-party advertisers."
  },
  {
    id: "code-sandboxing",
    num: "2",
    title: "Code Sandboxing & Logs",
    icon: Cpu,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50/50 border-purple-100 text-purple-700",
    desc: "All source code executed via the Glintspark interactive IDE or compiler runtime is run inside isolated container micro-sandboxes. We analyze submission outcomes (CPU usage, memory limits, test pass rates) to compute score cards. We do not store or persist your code drafts permanently unless you choose to save it to your submissions history.",
    callout: "Sandboxed execution environments are completely destroyed upon code execution completion to ensure container sanitization."
  },
  {
    id: "recruiter-sharing",
    num: "3",
    title: "Recruiter Sharing",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
    desc: "Your profile achievements, certification badges, and XP rankings are public by default to showcase your talent. However, detailed test code submissions, solved contest logs, and direct recruiter applications are kept private and are only shared with partner enterprises when you explicitly authorize it.",
    callout: "Enterprise clients can only request your profile info or test code history through explicit, opt-in developer consent."
  },
  {
    id: "encryption-standards",
    num: "4",
    title: "Encryption Standards",
    icon: Key,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50/50 border-amber-100 text-amber-700",
    desc: "We employ industry-standard transport layer security (TLS/SSL) for all communication and encrypt sensitive developer credentials at rest. Runtimes are isolated at the virtualization layer to prevent security escalations.",
    callout: "All web traffic and database records are safeguarded by advanced TLS 1.3 encryption and AES-256 protocols."
  },
  {
    id: "compliance",
    num: "5",
    title: "GDPR & CCPA Compliance",
    icon: UserCheck,
    color: "from-rose-500 to-red-500",
    bg: "bg-rose-50/50 border-rose-100 text-rose-700",
    desc: "Under applicable data protection laws, you have the right to request access to, correction of, or complete deletion of your personal data and account logs at any time from your profile settings dashboard.",
    callout: "You can request a complete deletion of all associated developer history and compile logs instantly in a single click."
  }
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("data-collection");

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
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Legal & Operations</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">Privacy Policy</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm">
                <Calendar size={13} /> Last Updated: June 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-xs font-bold shadow-sm">
                <Lock size={13} /> Fully Secure
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
                  <Printer size={13} /> Print Policy
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
              <h3 className="text-sm font-black tracking-tight mb-2">Have security questions?</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium mb-4">
                Our operations team answers all compliance and sandboxing queries within 24 hours.
              </p>
              <a href="mailto:security@glintspark.com" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold inline-flex items-center gap-1">
                Contact Security Officer <ChevronRight size={12} />
              </a>
            </div>
          </div>

          {/* Right Column - Policy Content Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Introductory Statement */}
            <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black text-indigo-950 mb-2">Glintspark's Privacy Guarantee</h2>
              <p className="text-slate-650 text-slate-500 text-sm font-medium leading-relaxed">
                We design Glintspark with absolute security and safety of developer profiles and compiler integrity in mind. We collect only data that is vital to score developer solutions, verify identities, and facilitate employer connection.
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
                <Printer size={14} /> Print Policy
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
