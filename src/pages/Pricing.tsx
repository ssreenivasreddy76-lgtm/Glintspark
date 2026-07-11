import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Globe, Briefcase, ChevronRight, HelpCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const PLANS = [
  {
    name: "Developer",
    price: "$0",
    period: "Forever",
    description: "Build your logic foundations, practice problems, and join the global dev network.",
    features: ["Access to all practice tracks", "Public developer portfolio", "Global leaderboard ranking", "Standard certifications"],
    button: "Get Started",
    highlight: false,
    color: "from-slate-500/10 via-transparent to-transparent",
    borderColor: "border-slate-800"
  },
  {
    name: "Mastery Plus",
    price: "$19",
    period: "per month",
    description: "Access our advanced AI simulator and editorial prep kits to land your dream job.",
    features: ["AI-powered Mock Interviews", "Step-by-step editor walkthroughs", "Private analytics dashboards", "Exclusive achievement badges"],
    button: "Start Free Trial",
    highlight: true,
    color: "from-brand-primary/20 via-transparent to-transparent",
    borderColor: "border-brand-primary/45 border-2 shadow-[0_0_25px_rgba(99,102,241,0.15)]"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "Scale your recruiting pipeline with robust assessments and verified analytics.",
    features: ["Custom assessments creator", "Remote candidate proctoring", "ATS software integrations", "Dedicated recruiter support"],
    button: "Request Demo",
    highlight: false,
    color: "from-emerald-500/10 via-transparent to-transparent",
    borderColor: "border-slate-800"
  }
];

const FAQS = [
  {
    q: "Can I cancel my subscription at any time?",
    a: "Absolutely. You can cancel your Mastery Plus plan directly from your profile settings page with a single click. You will keep your access until the end of your billing cycle."
  },
  {
    q: "Are the standard certifications free?",
    a: "Yes! All developers can take our basic coding assessments and earn verified certification badges to link to their resumes completely for free."
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes, we offer a 50% discount on the Mastery Plus plan for active university students and boot camp developers. Reach out to support with academic verification to apply."
  }
];

export default function Pricing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-primary mb-4 block">
              Flexible Pricing Plans
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-purple-400">utility</span>.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold">
              Choose the plan that matches your current engineering goals. We believe basic technical education should always remain accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-slate-50/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 90, damping: 15 }}
                className={`flex flex-col justify-between p-10 bg-slate-900 border text-white rounded-3xl relative min-h-[500px] hover:shadow-2xl transition-all ${plan.borderColor}`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-40 pointer-events-none rounded-3xl`} />
                
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-lg border border-brand-light/20">
                    Recommended
                  </div>
                )}
                
                <div>
                  <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 text-slate-450 text-slate-400 mb-3">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter text-slate-100">{plan.price}</span>
                      <span className="text-slate-400 text-sm font-semibold">{plan.period}</span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-10">
                    {plan.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    {plan.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-3 text-xs font-bold text-slate-300">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-emerald-400" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link 
                  to="/auth" 
                  state={{ 
                    role: plan.name === 'Enterprise' ? 'company' : 'developer',
                    from: '/pricing'
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all text-center text-xs shadow-lg ${
                    plan.highlight 
                      ? 'bg-brand-primary text-white hover:bg-brand-dark shadow-brand-primary/20 hover:scale-[1.01] active:scale-95' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  {plan.button}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white relative z-10 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-12 text-slate-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors text-left"
                >
                  <span>{faq.q}</span>
                  <span className={`text-slate-400 transition-transform ${activeFaq === i ? 'rotate-90 text-brand-primary' : ''}`}>
                    ▶
                  </span>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 pt-1 text-slate-500 text-xs font-semibold leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
