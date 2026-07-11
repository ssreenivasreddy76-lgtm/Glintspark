import { motion } from 'framer-motion';
import { Briefcase, MapPin, Cpu, Layout, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const JOBS = [
  {
    title: "Core Sandbox Systems Engineer",
    dept: "Infrastructure",
    type: "Remote / USA",
    salary: "$140k - $180k",
    skills: ["Go", "Docker", "Linux Kernel", "gRPC"]
  },
  {
    title: "Senior UX/UI Frontend Engineer",
    dept: "Product",
    type: "Remote / Europe",
    salary: "$110k - $150k",
    skills: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"]
  },
  {
    title: "AI & Compiler Research Lead",
    dept: "Artificial Intelligence",
    type: "Remote / India",
    salary: "$150k - $200k",
    skills: ["Python", "AST Parsers", "NLP Models", "PyTorch"]
  },
  {
    title: "Developer Relations Manager",
    dept: "Marketing",
    type: "Bengaluru / Hybrid",
    salary: "$80k - $110k",
    skills: ["Community Building", "Technical Writing", "JavaScript"]
  }
];

const VALUES = [
  { title: "Extreme Ownership", desc: "We take absolute responsibility for our modules, layouts, and system performances. No excuses, only code." },
  { title: "Visual Precision", desc: "Design is not an afterthought. We build visual experiences that delight developers at first glance." },
  { title: "Runtime Velocity", desc: "Every millisecond counts. We optimize compiler sandboxes and page loads to be blazing-fast." }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-emerald-50/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-50/40 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Briefcase size={11} /> Careers at Glintspark
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Build the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Developer Tools</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Join a remote-first, high-performing team of engineers, developers, and NLP researchers building the global technical evaluation standard.
          </p>
        </motion.div>
      </section>

      {/* Culture Values */}
      <section className="py-16 bg-white border-y border-slate-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm">How we operate and build product every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((val, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <h3 className="font-extrabold text-lg text-slate-900 mb-3">{val.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Job Openings */}
      <section className="py-20 relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Opportunities</h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">Find your next technical challenge.</p>
        </div>

        <div className="space-y-4">
          {JOBS.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:border-emerald-500/35 transition-all"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50">{job.dept}</span>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-500/20">{job.type}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((s, si) => (
                    <span key={si} className="text-[10px] text-slate-400 font-mono font-bold">{s} •</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-none pt-4 md:pt-0 shrink-0">
                <span className="text-xs font-black text-slate-800">{job.salary}</span>
                <Link to="/auth" className="flex items-center gap-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
                  Apply Now <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-950 text-white relative z-10 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Don't see a matching open role?</h2>
          <p className="text-slate-400 max-w-lg mx-auto font-medium text-sm">
            We are always looking for passionate builders. Send your resume and portfolio directly to our core founders.
          </p>
          <div className="pt-2">
            <a href="mailto:careers@glintspark.com" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark transition shadow-lg text-xs uppercase tracking-wider">
              Send Open Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
