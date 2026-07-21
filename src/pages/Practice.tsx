import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const skills = [
  { name: "Javascript",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS"  className="w-5 h-5" /> },
  { name: "Python",      icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"               alt="Py"  className="w-5 h-5" /> },
  { name: "Java",        icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"                    alt="Java"className="w-5 h-5" /> },
  { name: "C++",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"           alt="C++" className="w-5 h-5" /> },
  { name: "C",           icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"                          alt="C"   className="w-5 h-5" /> },
  { name: "C#",          icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"                alt="C#"  className="w-5 h-5" /> },
  { name: "SQL",         icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"                 alt="SQL" className="w-5 h-5" /> },
  { name: "PostgreSQL",  icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"        alt="Postgres" className="w-5 h-5" /> },
  { name: "Data Structures", icon: <img src="https://img.icons8.com/color/96/data-configuration.png" alt="DS" className="w-6 h-6" /> },
  { name: "Algorithms",      icon: <img src="https://img.icons8.com/color/96/flow-chart.png" alt="Algo" className="w-6 h-6" /> },
];

function getPracticeTrackId(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes('javascript') || norm.includes('js')) return 'javascript';
  if (norm.includes('python')) return 'python';
  if (norm.includes('java') && !norm.includes('javascript')) return 'java';
  if (norm.includes('c++') || norm.includes('c#') || norm === 'c') return 'c';
  if (norm.includes('sql') || norm.includes('postgres')) return 'sql';
  if (norm.includes('structure') || norm.includes('algorithm') || norm.includes('ds')) return 'data-structures';
  return 'javascript';
}

export default function Practice() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[100px] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Challenges by Language</h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Select a specific track to begin solving challenges. Master the syntax and nuances of your favorite language or learn a new one entirely.
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {skills.map((skill, i) => (
            <Link to={`/challenges/track/${getPracticeTrackId(skill.name)}`} key={skill.name}>
              <motion.div
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.02 }}
                className="relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-400 hover:to-cyan-400 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/15 group overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="h-full bg-white/95 backdrop-blur-xl rounded-[15px] p-6 flex flex-col items-center gap-4 transition-all relative z-10 group-hover:bg-white/90">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all shrink-0">
                    <div className="group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 scale-125">{skill.icon}</div>
                  </div>
                  <span className="text-base font-black text-slate-800 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">{skill.name}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
