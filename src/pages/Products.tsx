import { motion } from 'framer-motion';
import { 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  BarChartBig, 
  HelpCircle, 
  Building2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCT_LIST = [
  {
    title: "AI Mock Interviews",
    description: "Experience hyper-realistic technical and behavioral interviews conducted by advanced AI. Get real-time feedback on your code, system design, and communication skills.",
    icon: <Sparkles className="text-amber-500" size={24} />,
    tag: "Cutting Edge",
    iconBg: "bg-amber-50 border-amber-100",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200"
  },
  {
    title: "Challenges (IDE)",
    description: "Master algorithms and data structures using our lightning-fast, sandboxed coding environment supporting 20+ programming languages.",
    icon: <Terminal className="text-indigo-600" size={24} />,
    tag: "Most Popular",
    iconBg: "bg-indigo-50 border-indigo-100",
    tagColor: "bg-indigo-100 text-indigo-700 border-indigo-200"
  },
  {
    title: "Learn and Practice",
    description: "Follow expertly crafted curriculum tracks. From basic syntax to advanced Dynamic Programming, build your knowledge step-by-step.",
    icon: <BookOpen className="text-sky-600" size={24} />,
    tag: "Structured",
    iconBg: "bg-sky-50 border-sky-100",
    tagColor: "bg-sky-100 text-sky-700 border-sky-200"
  },
  {
    title: "Global Contests",
    description: "Compete in high-stakes, timed coding hackathons. Test your speed and logic against developers from around the world.",
    icon: <Trophy className="text-rose-500" size={24} />,
    tag: "Live Now",
    iconBg: "bg-rose-50 border-rose-100",
    tagColor: "bg-rose-100 text-rose-700 border-rose-200"
  },
  {
    title: "Leaderboard",
    description: "Track your rank globally or within your institution. Earn XP, maintain coding streaks, and unlock prestigious developer badges.",
    icon: <BarChartBig className="text-emerald-600" size={24} />,
    tag: "Compete",
    iconBg: "bg-emerald-50 border-emerald-100",
    tagColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
  },
  {
    title: "Technical Quizzes",
    description: "Sharpen your theoretical knowledge. Take rapid-fire quizzes covering Computer Networks, Operating Systems, DBMS, and more.",
    icon: <HelpCircle className="text-purple-600" size={24} />,
    tag: "Quick Prep",
    iconBg: "bg-purple-50 border-purple-100",
    tagColor: "bg-purple-100 text-purple-700 border-purple-200"
  },
  {
    title: "For Institutes",
    description: "A dedicated dashboard for colleges and universities to assess students, track their progress, and generate placement readiness reports.",
    icon: <Building2 className="text-teal-600" size={24} />,
    tag: "B2B Solution",
    iconBg: "bg-teal-50 border-teal-100",
    tagColor: "bg-teal-100 text-teal-700 border-teal-200"
  }
];

export default function Products() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 relative overflow-hidden">
      
      {/* Removed Hero Section as requested */}

      {/* Product Grid */}
      <section className="py-24 bg-slate-50/60 relative z-10 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Our Features</h2>
            <p className="text-slate-500 font-medium mt-4 text-lg">A unified platform containing everything required to bridge the gap between academic knowledge and industry expectations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCT_LIST.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 100, damping: 15 }}
                className="group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform duration-300 ${product.iconBg}`}>
                    {product.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${product.tagColor}`}>
                    {product.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold mb-3 text-slate-900 tracking-tight">{product.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 text-white relative z-10 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to begin your journey?</h2>
          <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm">
            Sign up for free and start practicing coding logic, competing, and getting certified today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth" state={{ role: 'developer', from: '/products' }} className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 active:scale-95 text-center">
              Get Started for Free
            </Link>
            <Link to="/auth" state={{ role: 'company', from: '/products' }} className="w-full sm:w-auto px-10 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 hover:text-white transition text-center">
              Request Institute Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
