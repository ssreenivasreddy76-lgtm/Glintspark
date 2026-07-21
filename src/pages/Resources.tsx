import { motion } from 'framer-motion';
import { 
  BookOpen, FileText, Briefcase, Terminal, Download, 
  PenTool, Users, HelpCircle, PlayCircle, Bell, 
  LayoutTemplate, Github, Library, ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RESOURCE_CATEGORIES = [
  {
    title: "Learning Resources",
    icon: <BookOpen size={24} className="text-indigo-600" />,
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-100",
    description: "Comprehensive tutorials and guides covering programming languages, Data Structures & Algorithms, and System Design to build your foundational knowledge."
  },
  {
    title: "Documentation",
    icon: <FileText size={24} className="text-sky-600" />,
    bgLight: "bg-sky-50",
    borderLight: "border-sky-100",
    description: "In-depth platform guides, compiler documentation, and AI Mentor usage instructions to help you navigate and utilize our tools effectively."
  },
  {
    title: "Career Resources",
    icon: <Briefcase size={24} className="text-emerald-600" />,
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-100",
    description: "Expertly crafted resume templates, cover letter guides, and placement roadmaps to help you stand out to top tech recruiters."
  },
  {
    title: "Coding Resources",
    icon: <Terminal size={24} className="text-rose-600" />,
    bgLight: "bg-rose-50",
    borderLight: "border-rose-100",
    description: "Practice sheets, company-specific interview questions, and code snippets to sharpen your problem-solving skills."
  },
  {
    title: "Downloads",
    icon: <Download size={24} className="text-amber-600" />,
    bgLight: "bg-amber-50",
    borderLight: "border-amber-100",
    description: "Downloadable PDF study notes, mock test papers, and eBooks for offline preparation and quick revision."
  },
  {
    title: "Blog & Articles",
    icon: <PenTool size={24} className="text-fuchsia-600" />,
    bgLight: "bg-fuchsia-50",
    borderLight: "border-fuchsia-100",
    description: "Weekly insights, interview strategies, and technology roadmaps written by industry experts and top performers."
  },
  {
    title: "Community",
    icon: <Users size={24} className="text-orange-600" />,
    bgLight: "bg-orange-50",
    borderLight: "border-orange-100",
    description: "Join our active Discord community, participate in discussion forums, and connect with peer student groups during hackathons."
  },
  {
    title: "Help Center",
    icon: <HelpCircle size={24} className="text-red-600" />,
    bgLight: "bg-red-50",
    borderLight: "border-red-100",
    description: "Access frequently asked questions, report bugs, request new features, and get fast support from our dedicated team."
  },
  {
    title: "Videos",
    icon: <PlayCircle size={24} className="text-violet-600" />,
    bgLight: "bg-violet-50",
    borderLight: "border-violet-100",
    description: "Watch recorded coding sessions, live workshop replays, and webinar recordings to learn visually."
  },
  {
    title: "News & Updates",
    icon: <Bell size={24} className="text-blue-600" />,
    bgLight: "bg-blue-50",
    borderLight: "border-blue-100",
    description: "Stay informed about the latest platform features, product updates, and upcoming contest announcements."
  },
  {
    title: "Templates",
    icon: <LayoutTemplate size={24} className="text-teal-600" />,
    bgLight: "bg-teal-50",
    borderLight: "border-teal-100",
    description: "Ready-to-use templates for resumes, portfolios, and project reports designed to pass ATS screening."
  },
  {
    title: "Open Source",
    icon: <Github size={24} className="text-slate-700" />,
    bgLight: "bg-slate-100",
    borderLight: "border-slate-200",
    description: "Contribute to our public GitHub repositories, read developer documentation, and track community issues."
  },
  {
    title: "Recommended Books",
    icon: <Library size={24} className="text-pink-600" />,
    bgLight: "bg-pink-50",
    borderLight: "border-pink-100",
    description: "Curated lists of the best books for mastering C, Java, Python, DSA, and System Design."
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32 relative overflow-hidden pt-24">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[55%] h-[500px] bg-indigo-100/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[45%] h-[500px] bg-emerald-50/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <section className="pt-16 pb-16 relative z-10 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} /> Glintspark Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Developer Resource Center
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base leading-relaxed">
            Everything you need to master programming, prepare for top-tier placements, and build scalable engineering systems.
          </p>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {RESOURCE_CATEGORIES.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 4) * 0.1, type: "spring", stiffness: 100 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${category.bgLight} ${category.borderLight}`}>
                  {category.icon}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {category.title}
                </h2>
              </div>
              
              <div className="flex-1 mb-6">
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="mt-auto">
                <Link 
                  to="/auth"
                  state={{ from: '/resources' }}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider group/link"
                >
                  Explore Resources <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
