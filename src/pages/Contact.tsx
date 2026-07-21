import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MapPin, Clock, Send, MessageSquare, 
  Building2, Users, Briefcase, GraduationCap,
  ChevronRight, Sparkles, Phone, Globe, HelpCircle, Target
} from 'lucide-react';

const CONTACT_EMAILS = [
  { title: "General Support", email: "support@glintspark.com", icon: <MessageSquare size={20} /> },
  { title: "Sales & Partnerships", email: "sales@glintspark.com", icon: <Building2 size={20} /> },
  { title: "Business Inquiries", email: "business@glintspark.com", icon: <Briefcase size={20} /> },
  { title: "Career Opportunities", email: "careers@glintspark.com", icon: <Users size={20} /> }
];

const WHO_CAN_CONTACT = [
  { title: "Students", icon: <GraduationCap size={18} /> },
  { title: "Colleges", icon: <Building2 size={18} /> },
  { title: "Recruiters", icon: <Briefcase size={18} /> },
  { title: "Companies", icon: <Target size={18} /> },
  { title: "Partners", icon: <Users size={18} /> },
  { title: "Media", icon: <Globe size={18} /> }
];

const FAQS = [
  { q: "Is GlintSpark free for students?", a: "Yes. Students can access the platform free of charge." },
  { q: "How can my college partner with GlintSpark?", a: "Contact our sales team using the form or email us at sales@glintspark.com." },
  { q: "Can I request a product demo?", a: "Yes. We offer comprehensive demos for colleges and institutions." },
  { q: "How do I report a technical issue?", a: "Use the contact form below or email our support team directly at support@glintspark.com." }
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    org: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'N/A'}
Organization: ${formData.org || 'N/A'}

Message:
${formData.message}
    `;

    // Trigger local email client
    const mailtoLink = `mailto:ssreenivasreedy76@gmail.com?subject=${encodeURIComponent(`GlintSpark Contact: ${formData.subject || 'General Inquiry'}`)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden pt-24 pb-32">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-16 pb-12 relative z-10 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            We're Here to Help You <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-brand-primary">Succeed</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base leading-relaxed">
            Have questions about GlintSpark? Whether you're a student, college, recruiter, or business partner, we'd love to hear from you.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-colors">
              Contact Sales
            </button>
            <button className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors">
              Get Support
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Form + Info */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Contact Form */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-[50px] rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-black text-slate-900 mb-8 relative z-10">Send us a Message</h2>
            
            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="john@example.com" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone (Optional)</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization / College</label>
                  <input value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="SRIT Anantapur" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject *</label>
                <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm appearance-none cursor-pointer">
                  <option value="">Select a topic...</option>
                  <option value="College Partnership / Sales Demo">College Partnership / Sales Demo</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Business Inquiry">Business Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message *</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>

          {/* Contact Info & Details */}
          <div className="space-y-8">
            
            {/* Direct Emails */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {CONTACT_EMAILS.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      {item.icon} {item.title}
                    </div>
                    <a href={`mailto:${item.email}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors block">
                      {item.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Hours */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 border border-indigo-100">
                  <MapPin size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-3">Office Address</h3>
                <address className="text-slate-500 font-medium text-sm not-italic leading-relaxed">
                  <strong className="text-slate-700 block mb-1">GlintSpark Technologies</strong>
                  Anantapur, Andhra Pradesh, India<br/>
                  <span className="text-xs text-slate-400 mt-2 block">(Registered office address pending)</span>
                </address>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={16} className="text-indigo-600" />
                  +91 93926 37914
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 border border-emerald-100">
                  <Clock size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Mon – Fri:</span>
                    <strong className="text-slate-700">9:00 AM – 6:00 PM (IST)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <strong className="text-slate-700">10:00 AM – 2:00 PM (IST)</strong>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Sunday:</span>
                    <strong>Closed</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/20 blur-[40px] rounded-full pointer-events-none" />
              <h3 className="text-lg font-black mb-6 relative z-10">Expected Response Time</h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-medium text-slate-300">General Support</span>
                  <span className="text-sm font-bold text-emerald-400">Within 24 hours</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-medium text-slate-300">Technical Issues</span>
                  <span className="text-sm font-bold text-amber-400">Within 12 hours</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-sm font-medium text-slate-300">Sales Inquiries</span>
                  <span className="text-sm font-bold text-brand-light">Within 1 business day</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Who Can Contact Us */}
      <section className="py-16 relative z-10 max-w-7xl mx-auto px-6 border-t border-slate-200 mt-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900">Who Can Contact Us?</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {WHO_CAN_CONTACT.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default">
              <span className="text-indigo-400">{item.icon}</span> {item.title}
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 relative z-10 max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
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
