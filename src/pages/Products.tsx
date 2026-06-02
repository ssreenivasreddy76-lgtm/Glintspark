import { motion } from 'framer-motion';
import { Code2, Zap, Award, Users, Trophy, BookOpen, ChevronRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCT_LIST = [
  {
    title: "Practice Arena",
    description: "Master algorithms, data structures, and 20+ programming languages through interactive challenges.",
    icon: <Terminal className="text-brand-primary" />,
    link: "/challenges",
    tag: "Most Popular"
  },
  {
    title: "Skills Certification",
    description: "Take standardized tests to verify your technical proficiency and stand out to top engineering teams.",
    icon: <Award className="text-emerald-500" />,
    link: "/auth",
    tag: "Free for Developers"
  },
  {
    title: "Competitive Arena",
    description: "Compete in weekly contests, climb the global leaderboard, and win exclusive platform badges.",
    icon: <Trophy className="text-amber-500" />,
    link: "/leaderboard",
    tag: "Live Now"
  },
  {
    title: "Learning Paths",
    description: "Guided curricula designed to take you from beginner to production-ready engineer in record time.",
    icon: <BookOpen className="text-blue-500" />,
    link: "/curriculum",
    tag: "Comprehensive"
  }
];

export default function Products() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-[#f3f7f7] border-b border-[#d1d5db]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4 block">The Glintspark Ecosystem</span>
            <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
              Tools designed for the <span className="text-brand-primary italic">modern engineer.</span>
            </h1>
            <p className="text-xl text-[#738f93] font-medium leading-relaxed">
              From your first line of code to your final interview, Glintspark provides the utility and insights you need to master your craft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {PRODUCT_LIST.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white border border-[#d1d5db] rounded-xl p-10 hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#f3f7f7] text-[#738f93] px-3 py-1 rounded-full border border-[#d1d5db]">
                    {product.tag}
                  </span>
                </div>
                
                <div className="w-14 h-14 bg-[#f3f7f7] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500">
                  {product.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">{product.title}</h3>
                <p className="text-[#738f93] text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                <Link 
                  to={product.link}
                  className="inline-flex items-center gap-2 text-brand-primary font-bold hover:gap-4 transition-all"
                >
                  Explore Module <ChevronRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to accelerate your career?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth" className="w-full sm:w-auto px-10 py-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-dark transition shadow-lg shadow-brand-primary/25">
              Get Started for Free
            </Link>
            <Link to="/auth" className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-lg hover:bg-white/5 transition">
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
