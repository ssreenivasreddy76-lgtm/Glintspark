import { motion } from 'framer-motion';
import { Shield, FileText, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const TERMS_SECTIONS = [
  {
    title: "1. Definitions",
    items: [
      "GlintSpark refers to the online placement training and learning platform.",
      "Client refers to educational institutions, colleges, universities, training organizations, or corporate partners.",
      "Student refers to any registered learner.",
      "User refers collectively to students, institutions, trainers, and visitors."
    ]
  },
  {
    title: "2. Eligibility",
    items: [
      "Users must provide accurate registration information.",
      "Students below the legally permitted age should use the platform with appropriate parental or institutional consent."
    ]
  },
  {
    title: "3. Academic Institution (Client) Terms",
    items: [
      "Use the platform only for educational and placement purposes.",
      "Protect institutional login credentials.",
      "Do not copy, resell, or redistribute GlintSpark content without written permission.",
      "Pay applicable subscription or service fees on time.",
      "Respect GlintSpark intellectual property rights.",
      "Ensure ethical use by faculty and students."
    ]
  },
  {
    title: "4. Student Terms",
    items: [
      "Provide genuine information during registration.",
      "Maintain account confidentiality.",
      "Do not cheat, plagiarize, or impersonate others.",
      "Respect trainers and fellow learners.",
      "Do not upload malicious or copyrighted material."
    ]
  },
  {
    title: "5. Intellectual Property",
    content: "All courses, videos, assessments, coding problems, graphics, logos, website content, and source code are the intellectual property of GlintSpark unless otherwise stated."
  },
  {
    title: "6. Payments",
    items: [
      "Applicable fees are non-transferable.",
      "Refunds are governed by the GlintSpark Refund Policy.",
      "Taxes apply according to applicable laws."
    ]
  },
  {
    title: "7. Code of Conduct",
    items: [
      "Do not attempt unauthorized access.",
      "Do not disrupt platform services.",
      "Do not share accounts or engage in unlawful activities.",
      "Violations may result in suspension or termination."
    ]
  },
  {
    title: "8. Certification",
    content: "Certificates are issued only after successful completion of eligible programs and verification where applicable."
  },
  {
    title: "9. Placement Disclaimer",
    content: "GlintSpark provides placement preparation and career guidance but does not guarantee employment or internships. Hiring decisions are made solely by recruiters."
  },
  {
    title: "10. Availability of Services",
    content: "Services may occasionally be interrupted due to maintenance or unforeseen technical issues."
  },
  {
    title: "11. Privacy",
    content: "User information is handled according to the GlintSpark Privacy Policy."
  },
  {
    title: "12. Account Suspension",
    content: "Accounts may be suspended or terminated for fraud, policy violations, misuse, or security threats."
  },
  {
    title: "13. Limitation of Liability",
    content: "GlintSpark is not liable for indirect or consequential losses arising from platform usage."
  },
  {
    title: "14. Amendments",
    content: "These Terms & Conditions may be updated periodically. Continued use signifies acceptance of revisions."
  },
  {
    title: "15. Contact",
    content: "Please contact the GlintSpark support team through the official website for any queries."
  }
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden pt-24 pb-32">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-16 pb-12 relative z-10 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield size={32} className="text-indigo-600" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Legal Documents
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-brand-primary">Conditions</span>
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
            <p className="text-lg font-medium text-slate-600 leading-relaxed mb-12">
              Welcome to GlintSpark. By accessing or using our platform, you agree to comply with these Terms & Conditions.
            </p>

            <div className="space-y-12">
              {TERMS_SECTIONS.map((section, idx) => (
                <div key={idx} className="scroll-mt-32">
                  <h3 className="text-xl font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-3">
                    <FileText size={20} className="text-indigo-400" />
                    {section.title}
                  </h3>
                  
                  {section.content ? (
                    <p className="text-slate-600 font-medium leading-relaxed pl-8">
                      {section.content}
                    </p>
                  ) : (
                    <ul className="space-y-3 pl-8">
                      {section.items?.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium leading-relaxed">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
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
                <AlertCircle size={20} className="text-brand-light" />
                Acceptance
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed relative z-10">
                By registering or using GlintSpark, users acknowledge that they have read, understood, and agreed to these Terms & Conditions.
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-800 relative z-10 flex items-center justify-between">
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
