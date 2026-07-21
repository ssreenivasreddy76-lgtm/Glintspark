import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, ChevronRight, Building2, Sparkles, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: "Basic",
    target: "For Small Colleges",
    price: "₹1,000",
    billing: "per year",
    description: "Up to 1,000 students. Essential tools for basic coding practice and assessments.",
    features: [
      "Up to 1,000 students",
      "Coding platform",
      "Learning modules",
      "Basic assessments",
      "Faculty dashboard",
      "Email support"
    ],
    bgLight: "bg-indigo-50",
    textDark: "text-indigo-700",
    borderLight: "border-indigo-100",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
    popular: false
  },
  {
    name: "Professional",
    target: "For Medium Colleges",
    price: "₹5,000",
    billing: "per year",
    description: "Up to 5,000 students. Advanced AI tools and analytics for serious placement prep.",
    features: [
      "Up to 5,000 students",
      "Everything in Basic",
      "AI mock interviews",
      "Advanced analytics",
      "Custom coding contests",
      "Resume evaluation",
      "Priority support"
    ],
    bgLight: "bg-brand-primary/10",
    textDark: "text-brand-primary",
    borderLight: "border-brand-primary/20",
    buttonBg: "bg-brand-primary hover:bg-brand-dark text-white shadow-lg shadow-brand-primary/20",
    popular: true
  },
  {
    name: "Enterprise",
    target: "For Universities",
    price: "Custom",
    billing: "contact sales",
    description: "Unlimited students. White-labeled platform with dedicated support and SLA.",
    features: [
      "Unlimited students",
      "Everything in Professional",
      "White-label platform",
      "Dedicated account manager",
      "API integrations",
      "Custom reports",
      "SLA support"
    ],
    bgLight: "bg-emerald-50",
    textDark: "text-emerald-700",
    borderLight: "border-emerald-100",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    popular: false
  }
];

const FEATURES_COMPARE = [
  { name: "Student Accounts", basic: true, pro: true, enterprise: true },
  { name: "Coding Practice", basic: true, pro: true, enterprise: true },
  { name: "AI Mock Interviews", basic: false, pro: true, enterprise: true },
  { name: "Analytics Dashboard", basic: "Basic", pro: "Advanced", enterprise: "Enterprise" },
  { name: "Coding Contests", basic: false, pro: true, enterprise: true },
  { name: "Custom Branding", basic: false, pro: false, enterprise: true },
  { name: "API Integration", basic: false, pro: false, enterprise: true }
];

const FAQS = [
  {
    q: "Is Glintspark free for students?",
    a: "Yes! Students can create an account and access the learning platform, IDE, and challenges completely free of charge. We believe in democratizing tech education."
  },
  {
    q: "Do students need to pay?",
    a: "No. Colleges and Universities purchase institutional plans so their students don't have to pay anything."
  },
  {
    q: "Can colleges request a demo?",
    a: "Absolutely. Contact our sales team to schedule a comprehensive walkthrough of the faculty dashboards, AI mentors, and contest creation tools."
  },
  {
    q: "Do you offer custom pricing?",
    a: "Yes. Pricing can be fully customized based on the exact number of students, specific feature requirements, and API integration needs."
  }
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32 relative overflow-hidden pt-24">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-16 pb-8 relative z-10 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Building2 size={11} /> Institutional Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Simple, Transparent Pricing <br className="hidden md:block"/> for Colleges
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Empower your students with AI-powered placement training, coding assessments, and analytics.
          </p>
        </div>
      </section>

      {/* Free for Students Banner */}
      <section className="py-8 relative z-10 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-indigo-600 to-brand-primary p-[1px] rounded-2xl shadow-xl shadow-brand-primary/10">
          <div className="bg-white rounded-[15px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                <UserCheck size={28} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Free for Students & Developers</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">Institutional plans are exclusively for colleges and universities. Developers practice for free.</p>
              </div>
            </div>
            <Link 
              to="/auth" 
              state={{ role: 'developer' }}
              className="whitespace-nowrap px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors text-sm"
            >
              Student Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-[2rem] p-8 relative flex flex-col h-full border ${plan.popular ? 'border-brand-primary shadow-2xl shadow-brand-primary/20 scale-105 z-10' : 'border-slate-200 shadow-xl shadow-slate-200/50'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles size={12} /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4 border ${plan.bgLight} ${plan.textDark} ${plan.borderLight}`}>
                  {plan.target}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm font-semibold min-h-[40px] leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                </div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{plan.billing}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.bgLight} ${plan.textDark}`}>
                      <Check size={12} />
                    </div>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 ${plan.buttonBg}`}>
                Contact Sales
              </button>
            </motion.div>
          ))}
        </div>
      </section>


      {/* FAQs */}
      <section className="py-24 relative z-10 max-w-3xl mx-auto px-6 border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white border transition-colors rounded-2xl overflow-hidden ${openFaq === i ? 'border-indigo-300 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className="font-extrabold text-slate-900">{faq.q}</span>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === i ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${openFaq === i ? 'rotate-90' : ''}`} />
                </div>
              </button>
              
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-slate-500 font-semibold text-sm leading-relaxed border-t border-slate-100 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
