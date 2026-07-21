import { motion } from 'framer-motion';
import { 
  Sparkles, Target, Compass, Zap, Shield, Heart, 
  Users, Lightbulb, Rocket, Globe, BookOpen, ChevronRight,
  Award, Briefcase, GraduationCap, Code
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CORE_VALUES = [
  { title: "Excellence", icon: <Award className="text-amber-500" size={24} /> },
  { title: "Innovation", icon: <Lightbulb className="text-amber-500" size={24} /> },
  { title: "Integrity", icon: <Shield className="text-indigo-500" size={24} /> },
  { title: "Accessibility", icon: <Globe className="text-emerald-500" size={24} /> },
  { title: "Continuous Learning", icon: <BookOpen className="text-sky-500" size={24} /> },
  { title: "Student-Centric", icon: <GraduationCap className="text-rose-500" size={24} /> },
  { title: "Collaboration", icon: <Users className="text-fuchsia-500" size={24} /> },
  { title: "Professional Growth", icon: <Briefcase className="text-teal-500" size={24} /> },
  { title: "Social Responsibility", icon: <Heart className="text-red-500" size={24} /> },
];

const DIFFERENTIATORS = [
  "Placement-oriented learning pathways",
  "Interactive coding practice and assessments",
  "Aptitude, reasoning, and communication training",
  "Mock interviews and resume-building guidance",
  "Real-world projects and skill-based challenges",
  "Personalized learning experiences",
  "Continuous progress tracking and analytics",
  "Secure, responsive, and cloud-based learning platform",
  "Resources designed for students from beginner to advanced levels"
];

const MISSION_POINTS = [
  "Deliver high-quality, industry-focused learning experiences.",
  "Bridge the gap between academic education and professional expectations.",
  "Help students become placement-ready through practical learning.",
  "Foster innovation, confidence, leadership, and lifelong learning.",
  "Provide accessible, affordable, and technology-driven education for learners everywhere.",
  "Continuously improve our platform using modern technologies and user feedback."
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden pt-24">
      
      {/* Hero Section */}
      <section className="py-20 relative z-10 text-center px-6">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 20, 0] }} 
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-[20%] w-[40%] h-[300px] bg-indigo-100/50 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -20, 20, 0], y: [0, 20, -10, 0] }} 
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 right-[20%] w-[40%] h-[300px] bg-emerald-100/40 blur-[100px] rounded-full" 
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> About GlintSpark
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Empowering Talent. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-brand-primary">Igniting Success.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mt-6">
            GlintSpark is an innovative online placement training and skill development platform dedicated to helping students transform their academic knowledge into industry-ready expertise. We provide a comprehensive ecosystem where learners can enhance their technical skills, aptitude, communication, coding abilities, and interview readiness through an engaging and technology-driven learning experience.
          </p>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm leading-relaxed pt-2">
            Founded in 2026, GlintSpark was created with a simple yet powerful vision: to make quality placement preparation accessible, affordable, and effective for every student, regardless of their background.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 relative z-10 max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-6 flex items-center justify-center">
              <span className="text-6xl font-black text-slate-300">SR</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Singama Reddy<br/>Sreenivas Reddy</h3>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-2 block">Founder & CEO</span>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">Our Story</h2>
            <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
              <p>
                Singama Reddy Sreenivas Reddy is a Third-Year Engineering student at Srinivasa Ramanujan Institute of Technology (SRIT), Anantapur. Motivated by a desire to bridge the gap between classroom education and industry expectations, he established GlintSpark to empower students with the knowledge, confidence, and practical skills required to excel in today's competitive job market.
              </p>
              <p>
                Despite starting with limited resources, he successfully built the platform by overcoming numerous technical and operational challenges. His commitment to innovation, continuous learning, and student success continues to shape GlintSpark into a trusted learning destination for aspiring professionals.
              </p>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-2xl italic font-semibold text-indigo-900 mt-6 text-sm">
              "Success is not determined by where you begin but by the determination to keep moving forward."
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 relative z-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-indigo-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 border border-indigo-200">
                <Compass size={28} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Our Vision</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-base">
                To become one of the most trusted global career development platforms by empowering learners with industry-relevant skills, innovative learning experiences, and opportunities that enable them to build successful and meaningful careers.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 border border-emerald-200">
                <Target size={28} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Our Mission</h2>
              <ul className="space-y-4">
                {MISSION_POINTS.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                    <div className="mt-0.5 shrink-0 text-emerald-500"><Code size={16} /></div>
                    <span className="leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Are Different & The Name */}
      <section className="py-24 relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Left: Why Different */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Why GlintSpark is Different</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {DIFFERENTIATORS.map((diff, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="mt-0.5 shrink-0 w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <Sparkles size={12} />
                  </div>
                  <span className="text-slate-700 font-bold text-xs sm:text-sm leading-snug">{diff}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Name */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-black mb-6 relative z-10">Why the Name 'GlintSpark' is Special</h2>
            
            <div className="space-y-6 relative z-10 text-sm text-slate-300 font-medium leading-relaxed">
              <p>
                <strong className="text-white">Glint</strong> represents the first spark of talent, curiosity, and potential within every learner.
              </p>
              <p>
                <strong className="text-brand-primary">Spark</strong> symbolizes inspiration, innovation, determination, and the energy needed to transform that potential into achievement.
              </p>
              <p>
                Together, <span className="font-bold text-white">GlintSpark</span> represents discovering hidden talent and igniting it into lifelong success.
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Our Tagline</span>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-white">
                "Ignite Your Potential. Shape Your Future."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Core Values</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              The fundamental principles that guide our development, community, and educational approaches.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {CORE_VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[200px] flex-1 max-w-[250px] group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{value.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment & CTA */}
      <section className="py-24 relative z-10 bg-indigo-600 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/5 blur-[100px] rounded-full transform rotate-12" />
        </div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
            <Rocket size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-8">Our Commitment</h2>
          <p className="text-indigo-100 font-medium text-lg leading-relaxed mb-10">
            At GlintSpark, we are committed to helping every learner achieve their career aspirations through quality education, hands-on practice, and continuous mentorship. We believe every student deserves the opportunity to succeed, and we strive to make technology a bridge between learning and career success.
          </p>
          <Link 
            to="/auth" 
            state={{ role: 'developer' }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-black text-sm uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
          >
            Start Your Journey <ChevronRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
