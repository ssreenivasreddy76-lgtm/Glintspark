import { motion } from 'framer-motion';
import { Users, Globe, Briefcase, GraduationCap, ChevronRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SOLUTIONS = [
  {
    title: "For Companies",
    description: "The complete enterprise toolset for high-volume technical screening, automated evaluations, and data-driven hiring.",
    icon: <Briefcase className="text-brand-primary" />,
    features: ["Remote Proctoring", "Custom Assessments", "Team Collaboration"]
  },
  {
    title: "For Universities",
    description: "Empower your students with standardized curriculum, mock interview practice, and direct pathways to top employers.",
    icon: <GraduationCap className="text-emerald-500" />,
    features: ["Curriculum Integration", "Performance Tracking", "Career Services"]
  },
  {
    title: "For Developers",
    description: "A unified platform to build your portfolio, earn certifications, and connect with the world's most innovative tech teams.",
    icon: <Zap className="text-amber-500" />,
    features: ["Project Hosting", "Skill Verification", "Direct Hiring"]
  }
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4 block underline decoration-brand-primary decoration-2 underline-offset-8">Glintspark Solutions</span>
            <h1 className="text-6xl font-black tracking-tighter mb-8 leading-[1.1]">
              Standardizing the world's <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-blue-400">tech talent.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
              Whether you're building a world-class engineering team or starting your journey as a developer, Glintspark provides the infrastructure for success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Detailed */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-16">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 space-y-8">
                  <div className="w-16 h-16 bg-[#f3f7f7] rounded-2xl flex items-center justify-center shadow-inner">
                    {sol.icon}
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{sol.title}</h2>
                  <p className="text-[#738f93] text-xl leading-relaxed">
                    {sol.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {sol.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-3 text-sm font-bold text-[#0e141e]">
                        <ShieldCheck size={18} className="text-brand-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-3 bg-[#0e141e] text-white font-bold rounded-lg hover:bg-brand-primary transition-all shadow-xl shadow-slate-900/10">
                    Get Started <ChevronRight size={18} />
                  </Link>
                </div>
                <div className="flex-1 w-full aspect-video bg-[#f3f7f7] rounded-[2rem] border border-[#d1d5db] overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Abstract UI Representation */}
                  <div className="absolute inset-10 bg-white rounded-2xl border border-[#d1d5db] shadow-2xl flex flex-col p-6 space-y-4">
                    <div className="h-4 w-1/3 bg-[#f3f7f7] rounded" />
                    <div className="h-8 w-full bg-[#f3f7f7] rounded" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 bg-[#f3f7f7] rounded-xl" />
                      <div className="h-20 bg-brand-primary/5 rounded-xl border border-brand-primary/10" />
                      <div className="h-20 bg-[#f3f7f7] rounded-xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
