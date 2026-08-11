import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Terminal, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const baseTracks = [
  {
    id: 'c',
    title: 'C Programming',
    description: 'Build a strong foundation in C programming.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    group: 'beginner',
  },
  {
    id: 'sql',
    title: 'SQL',
    description: 'Learn relational database design.',
    icon: <DatabaseIcon className="w-8 h-8 text-blue-500" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    group: 'beginner',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Master prototype closures, dynamic event loops.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS" className="w-8 h-8" />,
    difficulty: 'Intermediate',
    difficultyColor: 'bg-amber-100 text-amber-700',
    group: 'intermediate',
  },
  {
    id: 'java',
    title: 'Java',
    description: 'Excel in Object-Oriented Design patterns.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="w-8 h-8" />,
    difficulty: 'Intermediate',
    difficultyColor: 'bg-amber-100 text-amber-700',
    group: 'intermediate',
  },
  {
    id: 'python',
    title: 'Python',
    description: 'Acquire pythonic elegance.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    group: 'beginner',
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algos',
    description: 'Design highly efficient queues, stacks, linked nodes.',
    icon: <img src="https://img.icons8.com/color/96/data-configuration.png" alt="DSA" className="w-8 h-8" />,
    difficulty: 'Advanced',
    difficultyColor: 'bg-rose-100 text-rose-700',
    group: 'advanced',
  }
];

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

import { firebaseDB } from '../services/firebaseService';
import { AnimatePresence } from 'framer-motion';

export default function Curriculum() {
  const navigate = useNavigate();
  const [lessonsMap, setLessonsMap] = useState<Record<string, any[]>>({});
  const [showDevMessage, setShowDevMessage] = useState(false);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const allData = await firebaseDB.getAllCurricula();
        const globalLessonsMap: Record<string, any[]> = {};
        
        // Store the modules array directly so that .length gives the number of modules
        Object.keys(allData).forEach(trackId => {
          globalLessonsMap[trackId] = allData[trackId] || [];
        });
        
        setLessonsMap(globalLessonsMap);
      } catch (err) {
        console.error("Failed to load global curriculum stats", err);
      }
    };
    
    fetchGlobalStats();
  }, []);

  const tracks = baseTracks.map(track => ({
    ...track,
    lessons: (lessonsMap[track.id] || []).length,
    quizzes: Math.floor((lessonsMap[track.id] || []).length / 2) // mock ratio
  }));

  const beginnerTracks = tracks.filter(t => t.group === 'beginner');
  const intermediateTracks = tracks.filter(t => t.group === 'intermediate');
  const advancedTracks = tracks.filter(t => t.group === 'advanced');

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative overflow-hidden">
      <AnimatePresence>
        {showDevMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white border-2 border-red-500 rounded-lg shadow-2xl px-8 py-5 flex items-center justify-center gap-5 w-[95%] max-w-4xl"
          >
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[16px] font-black">X</span>
            </div>
            <p className="text-slate-800 text-xl font-bold tracking-tight">
              Sorry, this curriculum track is currently under development. Check back soon!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Tracks</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Step-by-step master tracks designed from beginner to industry expert.</p>
          </div>
        </div>
        {/* Beginner Tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Beginner Friendly</h2>
            <span className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">{beginnerTracks.length} Tracks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beginnerTracks.map(track => (
              <TrackCard key={track.id} track={track} setShowDevMessage={setShowDevMessage} />
            ))}
          </div>
        </section>

        {/* Intermediate Tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Intermediate Logic</h2>
            <span className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">{intermediateTracks.length} Tracks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intermediateTracks.map(track => (
              <TrackCard key={track.id} track={track} setShowDevMessage={setShowDevMessage} />
            ))}
          </div>
        </section>

        {/* Advanced Tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Advanced Concepts</h2>
            <span className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">{advancedTracks.length} Tracks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedTracks.map(track => (
              <TrackCard key={track.id} track={track} setShowDevMessage={setShowDevMessage} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

interface TrackCardProps {
  track: any;
  setShowDevMessage: (val: boolean) => void;
}

function TrackCard({ track, setShowDevMessage }: TrackCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-white rounded-[24px] p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-brand-primary/50 group relative overflow-hidden flex flex-col h-full"
    >
      <div className="bg-white rounded-[23px] p-6 h-full flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            {track.icon}
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${track.difficultyColor}`}>
            {track.difficulty}
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-brand-primary transition-colors">{track.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-1">{track.description}</p>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <BookOpen size={16} className="text-slate-400" />
            {track.lessons} Modules
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={16} className="text-slate-400" />
            {track.quizzes} Quizzes
          </div>
        </div>

        {track.id.toLowerCase() === 'c' ? (
          <Link
            to={`/curriculum/${track.id}`}
            className="w-full py-3.5 bg-slate-900 hover:bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-brand-primary/25"
          >
            View Course <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <button
            onClick={() => {
              setShowDevMessage(true);
              setTimeout(() => setShowDevMessage(false), 4000);
            }}
            className="w-full py-3.5 bg-slate-900 hover:bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-brand-primary/25"
          >
            View Course <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}

        {/* LATER: Restore this Link for all tracks when development is complete
        <Link
          to={`/curriculum/${track.id}`}
          className="w-full py-3.5 bg-slate-900 hover:bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-brand-primary/25"
        >
          View Course <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
        */}
      </div>
    </motion.div>
  );
}
