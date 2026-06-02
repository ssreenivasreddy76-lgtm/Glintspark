import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Globe, Briefcase, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: "Developer",
    price: "$0",
    period: "Forever",
    description: "Everything you need to master code and build your professional profile.",
    features: ["Access to all practice tracks", "Public developer profile", "Global leaderboard ranking", "Standard certifications"],
    button: "Get Started",
    highlight: false
  },
  {
    name: "Mastery Plus",
    price: "$19",
    period: "per month",
    description: "Premium insights and interview prep tools to help you land your dream job.",
    features: ["Mock interview simulator", "Advanced editorial solutions", "Private performance analytics", "Premium skill badges"],
    button: "Start Free Trial",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "Scalable hiring infrastructure for world-class engineering teams.",
    features: ["Custom test creation", "Remote proctoring & anti-cheat", "Integrations with top ATS", "Dedicated support manager"],
    button: "Request Demo",
    highlight: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0e141e]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#f3f7f7] border-b border-[#d1d5db]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-6">Simple, transparent <span className="text-brand-primary italic">utility.</span></h1>
            <p className="text-xl text-[#738f93] font-medium max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your current engineering goals. Whether you're a student or a CTO, we've got you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col p-10 bg-white border ${plan.highlight ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-[#d1d5db]'} rounded-[2rem] relative shadow-sm hover:shadow-xl transition-all`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-1.5 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-black uppercase tracking-widest text-[#738f93] mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-[#738f93] font-medium">{plan.period}</span>
                  </div>
                </div>

                <p className="text-[#738f93] font-medium leading-relaxed mb-10">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-start gap-3 text-[14px] font-semibold">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-emerald-600" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link 
                  to="/auth" 
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all text-center shadow-lg ${
                    plan.highlight 
                      ? 'bg-brand-primary text-white hover:bg-brand-dark shadow-brand-primary/20' 
                      : 'bg-[#f3f7f7] text-[#0e141e] hover:bg-[#d1d5db]'
                  }`}
                >
                  {plan.button}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sneak Peak */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-brand-primary mb-8 group cursor-pointer">
            <HelpCircle size={20} />
            <span className="font-bold border-b-2 border-brand-primary/20 group-hover:border-brand-primary transition-all">Common questions about Glintspark billing</span>
          </div>
          <p className="text-[#738f93] text-sm font-medium italic">
            "We believe technical education should be accessible to everyone. Our free tier will always be comprehensive enough to help you get hired."
          </p>
        </div>
      </section>
    </div>
  );
}
