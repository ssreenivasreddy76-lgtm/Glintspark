import { motion } from 'framer-motion';
import { Book, MessageSquare, Play, Globe, ChevronRight, Search, FileText, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RESOURCE_TYPES = [
  {
    title: "Technical Documentation",
    description: "Deep dives into platform mechanics, API integrations, and developer best practices.",
    icon: <FileText className="text-brand-primary" />,
    count: "40+ Guides"
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step walkthroughs of complex algorithms and system design patterns.",
    icon: <Play className="text-rose-500" />,
    count: "150+ Hours"
  },
  {
    title: "Community Forum",
    description: "Join the discussion with over 500k developers solving the world's hardest problems.",
    icon: <MessageSquare className="text-emerald-500" />,
    count: "Active Now"
  },
  {
    title: "Developer Blog",
    description: "Latest insights on hiring trends, engineering leadership, and platform updates.",
    icon: <Share2 className="text-blue-500" />,
    count: "Weekly Updates"
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e]">
      {/* Search Header */}
      <section className="pt-32 pb-16 bg-[#f3f7f7] border-b border-[#d1d5db]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-8">Resource Center</h1>
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[#738f93] group-focus-within:text-brand-primary transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search tutorials, documentation, or blog posts..."
                className="w-full pl-16 pr-6 py-5 bg-white border border-[#d1d5db] rounded-2xl shadow-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESOURCE_TYPES.map((res, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white border border-[#d1d5db] rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 bg-[#f3f7f7] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {res.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{res.title}</h3>
                <p className="text-[#738f93] text-sm leading-relaxed mb-6">
                  {res.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#f3f7f7]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{res.count}</span>
                  <ChevronRight size={16} className="text-[#d1d5db] group-hover:text-brand-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/20 to-transparent pointer-events-none" />
            <div className="flex-1 space-y-8 relative z-10">
              <span className="px-4 py-1 bg-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Featured Publication</span>
              <h2 className="text-4xl font-black leading-tight">Mastering System Design: The 2026 Architect's Guide</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Join our lead engineers as they break down the architectural patterns behind global-scale platforms.
              </p>
              <button className="px-8 py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all">
                Read Publication
              </button>
            </div>
            <div className="flex-1 w-full lg:w-auto relative z-10">
              <div className="aspect-[4/3] bg-slate-900 rounded-2xl border border-white/10 p-6 font-mono text-sm text-brand-light">
                <div className="mb-4 text-slate-500">// Initialize architectural context</div>
                <div>class <span className="text-white">GlobalScaleSystem</span> {"{"}</div>
                <div className="ml-4">constructor(capacity) {"{"}</div>
                <div className="ml-8">this.nodes = [];</div>
                <div className="ml-8 text-slate-500">...</div>
                <div className="ml-4">{"}"}</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
