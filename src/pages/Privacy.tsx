import { motion } from 'framer-motion';
import { Lock, FileText, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Mail, Eye, Server, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIVACY_SECTIONS = [
  {
    title: "1. Introduction",
    icon: <FileText size={20} className="text-indigo-400" />,
    content: "Welcome to GlintSpark. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and how we safeguard it when you access our placement training platform, coding tools, and AI features."
  },
  {
    title: "2. Information We Collect",
    icon: <Eye size={20} className="text-indigo-400" />,
    intro: "To provide a personalized and effective learning experience, we collect the following information:",
    items: [
      "Name and Email address",
      "Password (stored securely as a hash, never in plain text)",
      "Profile photo (optional)",
      "College name, branch, and academic year",
      "Programming preferences and coding submissions",
      "AI chat history (when using our AI tutor)",
      "Device information (browser type, operating system)",
      "IP address, cookies, and session data"
    ]
  },
  {
    title: "3. How We Use Your Information",
    icon: <RefreshCw size={20} className="text-indigo-400" />,
    intro: "We use the collected information to operate, maintain, and enhance our platform:",
    items: [
      "Create and manage your user account securely.",
      "Provide coding practice environments and personalized learning content.",
      "Save your progress and display competitive leaderboards.",
      "Analyze interactions to improve AI tutor responses.",
      "Send important platform notifications and account updates.",
      "Improve platform performance, analytics, and overall security."
    ]
  },
  {
    title: "4. Cookies",
    icon: <Server size={20} className="text-indigo-400" />,
    intro: "We use cookies and similar tracking technologies to:",
    items: [
      "Keep you securely logged in across sessions.",
      "Remember your platform preferences and settings.",
      "Analyze website usage to understand how our features are utilized.",
      "Enhance overall speed and performance."
    ]
  },
  {
    title: "5. Third-Party Services",
    icon: <Server size={20} className="text-indigo-400" />,
    intro: "We may integrate with trusted third-party services to power specific platform features, including:",
    items: [
      "Supabase (for secure authentication and database management)",
      "Google Gemini/OpenAI (to power our AI tutoring features)",
      "Judge0 or similar compiler APIs (for executing your code submissions)",
      "Google Cloud (for robust hosting and data storage)"
    ]
  },
  {
    title: "6. Data Security",
    icon: <ShieldCheck size={20} className="text-indigo-400" />,
    intro: "Protecting your data is our priority. We implement strict security measures:",
    items: [
      "Encrypt all data in transit using industry-standard HTTPS.",
      "Store passwords securely using robust hashing algorithms.",
      "Restrict access to user data strictly to authorized personnel.",
      "Continuously monitor our systems for potential vulnerabilities or security threats."
    ]
  },
  {
    title: "7. Data Sharing",
    icon: <ShieldCheck size={20} className="text-indigo-400" />,
    intro: "We do not sell your personal information. We may share data only under the following circumstances:",
    items: [
      "With trusted service providers who assist us in operating our platform.",
      "To comply with legal obligations or respond to lawful requests.",
      "With your explicit consent (e.g., sharing profiles with recruiters if opted in)."
    ]
  },
  {
    title: "8. User Rights",
    icon: <FileText size={20} className="text-indigo-400" />,
    intro: "You have complete control over your data. You have the right to:",
    items: [
      "View and edit your profile information at any time.",
      "Request a copy of your personal data.",
      "Delete your account and associated personal data.",
      "Contact our support team regarding any privacy concerns."
    ]
  },
  {
    title: "9. AI Features & Data Processing",
    icon: <Sparkles size={20} className="text-indigo-400" />,
    content: "When you interact with our AI tutor, your conversation prompts may be processed by third-party AI providers (such as Google or OpenAI) solely to generate real-time responses. We do not use your personal data to train external models."
  },
  {
    title: "10. Data Retention & Account Deletion",
    icon: <RefreshCw size={20} className="text-indigo-400" />,
    content: "We retain your account information and coding submissions as long as your account is active. If you choose to delete your account, your personal data will be permanently removed from our active databases, though some anonymized analytics may remain for platform improvement."
  },
  {
    title: "11. Children's Privacy",
    icon: <ShieldCheck size={20} className="text-indigo-400" />,
    content: "GlintSpark is intended for users aged 13 years or older. We do not knowingly collect personal information from children under 13 without appropriate parental or institutional consent."
  },
  {
    title: "12. Changes to This Policy",
    icon: <FileText size={20} className="text-indigo-400" />,
    content: "We may update this privacy policy periodically to reflect changes in our practices or legal requirements. Users will be notified of any significant changes via email or platform announcements."
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden pt-24 pb-32">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-16 pb-12 relative z-10 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock size={32} className="text-indigo-600" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Legal Documents
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-brand-primary">Policy</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto text-base tracking-wider uppercase">
            Effective Date: <span className="text-indigo-600">July 2026</span>
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          
          <div className="prose prose-slate max-w-none">
            <div className="space-y-12">
              {PRIVACY_SECTIONS.map((section, idx) => (
                <div key={idx} className="scroll-mt-32">
                  <h3 className="text-xl font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-3">
                    {section.icon}
                    {section.title}
                  </h3>
                  
                  {section.content && (
                    <p className="text-slate-600 font-medium leading-relaxed pl-8">
                      {section.content}
                    </p>
                  )}

                  {section.intro && (
                    <p className="text-slate-600 font-medium leading-relaxed pl-8 mb-4">
                      {section.intro}
                    </p>
                  )}

                  {section.items && (
                    <ul className="space-y-3 pl-8">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium leading-relaxed">
                          <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/20 blur-[40px] rounded-full pointer-events-none" />
              <h3 className="text-lg font-black mb-4 relative z-10 flex items-center gap-2">
                <Mail size={20} className="text-brand-light" />
                Contact Us
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed relative z-10 mb-4">
                If you have any questions or concerns about this Privacy Policy or how we handle your data, please reach out to us:
              </p>
              
              <div className="space-y-2 relative z-10 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <span className="text-indigo-400">Company:</span> GlintSpark Technologies
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <span className="text-indigo-400">Email:</span> support@glintspark.com
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                  <span className="text-indigo-400">Website:</span> www.glintspark.com
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800 relative z-10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">End of Document</span>
                <Link to="/contact" className="text-brand-light font-bold text-sm flex items-center gap-1 hover:text-white transition-colors">
                  Contact Support <ChevronRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
