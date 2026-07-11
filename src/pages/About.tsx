import { motion } from 'framer-motion';
import { Sparkles, Terminal, Code, Users, Award, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-linkedin"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-github"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

const FOUNDERS = [
  {
    name: "Singama Reddy Sreenivas Reddy",
    role: "Founder & CEO",
    bio: "Driven by a passion to democratize tech education, Singama Reddy Sreenivas Reddy founded Glintspark in 2026 after overcoming immense challenges. From bootstrapping the entire platform with limited initial resources, navigating complex container isolation security, to surviving countless sleepless nights troubleshooting sub-millisecond compile latency, his journey is a testament to perseverance in creating a tool that helps developers worldwide showcase their true potential.",
    avatar: "/founder_avatar.jpg",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  }
];

const STATS = [
  { val: "500K+", label: "Active Developers", desc: "Practicing logic and solving coding challenges daily." },
  { val: "10M+", label: "Submissions Compiled", desc: "Running safely in our isolated container sandboxes." },
  { val: "190+", label: "Countries", desc: "Building a highly collaborative, global coding community." },
  { val: "12K+", label: "Hired Developers", desc: "Landed job placements via standardized recruiter matches." }
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-100/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-emerald-50/40 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Inside Glintspark
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Standardizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Software Mastery</span>
          </h1>
          <p className="text-lg text-slate-650 text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            The story behind the platform built by developers, for developers, to learn coding, solve algorithmic puzzles, and validate skill levels globally.
          </p>
        </motion.div>
      </section>

      {/* Website & Platform Overview */}
      <section className="py-20 bg-white border-y border-slate-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">About the Website</h2>
            <p className="text-slate-655 text-slate-500 text-sm sm:text-base leading-relaxed font-semibold">
              Glintspark is a unified ecosystem designed to eliminate the friction in developer education and technical recruiting. Established in 2026, the website hosts a state-of-the-art interactive coding workspace alongside verified certification curricula, built specifically to empower real developers to showcase their true coding capabilities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {STATS.map((st, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 80 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center hover:shadow-lg hover:border-indigo-500/25 transition-all group"
              >
                <p className="text-4xl font-black text-indigo-600 group-hover:scale-105 transition-transform duration-300">{st.val}</p>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-3">{st.label}</p>
                <p className="text-xs text-slate-400 font-bold mt-1.5 leading-relaxed">{st.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      {/* Founder Section */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Meet the Founder</h2>
          <p className="text-slate-500 font-medium mt-3 text-sm">
            The visionary developer who created Glintspark to standardize software skill verification.
          </p>
        </div>

        <div className="flex justify-center">
          {FOUNDERS.map((founder, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/25 transition-all flex flex-col justify-between max-w-xl w-full"
            >
              <div>
                <div className="relative w-28 h-28 mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-inner mx-auto">
                  <img 
                    src={founder.avatar} 
                    alt={founder.name} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: 'center 46%' }} 
                  />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">{founder.name}</h3>
                  <p className="text-sm font-black text-indigo-600 uppercase tracking-wider pt-2">{founder.role}</p>
                </div>
                <p className="text-slate-650 text-slate-500 text-sm leading-relaxed font-semibold mt-6 text-center">
                  {founder.bio}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <a href={founder.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                  <LinkedInIcon size={18} />
                </a>
                <a href={founder.github} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all">
                  <GitHubIcon size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 text-white relative z-10 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Standardize your engineering skills.</h2>
          <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm">
            Create your profile, solve algorithmic challenges, take certified assessments, and connect with global employers.
          </p>
          <div className="pt-4">
            <Link to="/auth" className="inline-flex items-center gap-2 px-10 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark transition shadow-lg shadow-brand-primary/20 active:scale-95 text-sm uppercase tracking-wider">
              Start Practicing Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
