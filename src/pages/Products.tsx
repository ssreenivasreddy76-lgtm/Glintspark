import { motion } from 'framer-motion';
import { Code2, Zap, Award, Users, Trophy, BookOpen, ChevronRight, Terminal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCT_LIST = [
  {
    title: "Practice Arena",
    description: "Master algorithms, data structures, and 20+ programming languages through interactive coding challenges.",
    icon: <Terminal className="text-indigo-400" size={24} />,
    link: "/challenges",
    tag: "Most Popular",
    color: "from-indigo-500/10 via-transparent to-transparent",
    borderColor: "hover:border-indigo-500/30"
  },
  {
    title: "Skills Certification",
    description: "Take standardized tests to verify your technical proficiency and stand out to top engineering teams.",
    icon: <Award className="text-emerald-400" size={24} />,
    link: "/auth",
    tag: "Free for Developers",
    color: "from-emerald-500/10 via-transparent to-transparent",
    borderColor: "hover:border-emerald-500/30"
  },
  {
    title: "Competitive Arena",
    description: "Compete in weekly timed contests, climb the global leaderboard, and win exclusive platform badges.",
    icon: <Trophy className="text-amber-400" size={24} />,
    link: "/leaderboard",
    tag: "Live Now",
    color: "from-amber-500/10 via-transparent to-transparent",
    borderColor: "hover:border-amber-500/30"
  },
  {
    title: "Learning Paths",
    description: "Guided curricula designed to take you from beginner to production-ready engineer in record time.",
    icon: <BookOpen className="text-sky-400" size={24} />,
    link: "/curriculum",
    tag: "Comprehensive",
    color: "from-sky-500/10 via-transparent to-transparent",
    borderColor: "hover:border-sky-500/30"
  }
];

export default function Products() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e] relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="pt-36 pb-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ x: [0, 50, -20, 0], y: [0, -20, 40, 0] }} 
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-950/40 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -30, 30, 0], y: [0, 30, -30, 0] }} 
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-950/35 blur-[120px] rounded-full" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary mb-4 block">
              The Glintspark Ecosystem
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Tools built to accelerate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-purple-400">engineering career</span>.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              From writing your first code snippet to passing high-stakes system design interviews, Glintspark provides the sandbox environment and direct hiring pathways you need to excel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 bg-slate-50/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {PRODUCT_LIST.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                className={`group bg-slate-900 border border-slate-800 rounded-3xl p-10 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[340px] text-white ${product.borderColor}`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-40 pointer-events-none`} />
                
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-700/50 group-hover:scale-110 transition-transform shadow-sm">
                      {product.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-850 text-slate-400 px-3 py-1 rounded-full border border-slate-800">
                      {product.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black mb-3 tracking-tight">{product.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                    {product.description}
                  </p>
                </div>

                <Link 
                  to={product.link}
                  className="inline-flex items-center gap-2 text-brand-primary font-bold hover:gap-3 transition-all text-xs uppercase tracking-widest mt-8"
                >
                  Explore Module <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 text-white relative z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to begin your journey?</h2>
          <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm">
            Sign up for free and start practicing coding logic, competing, and getting certified today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth" state={{ role: 'developer', from: '/products' }} className="w-full sm:w-auto px-10 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark transition shadow-lg shadow-brand-primary/20 active:scale-95 text-center">
              Get Started for Free
            </Link>
            <Link to="/auth" state={{ role: 'company', from: '/products' }} className="w-full sm:w-auto px-10 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-850 hover:text-white transition text-center">
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
