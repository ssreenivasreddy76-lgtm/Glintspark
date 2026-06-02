import { motion, useInView } from 'framer-motion';
import { Terminal, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const tracks = [
  {
    id: 'c',
    title: 'C Programming',
    description: 'Build a strong foundation in C programming.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 45,
    quizzes: 45,
    group: 'beginner',
  },
  {
    id: 'html',
    title: 'HTML',
    description: 'Build the structure of every web page from scratch.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 28,
    quizzes: 28,
    group: 'beginner',
  },
  {
    id: 'css',
    title: 'CSS',
    description: 'Style, animate, and make your web pages beautiful.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 32,
    quizzes: 30,
    group: 'beginner',
  },
  {
    id: 'python',
    title: 'Python',
    description: 'Learn versatile Python for any project.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 44,
    quizzes: 44,
    group: 'beginner',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Create interactive web applications.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JS" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 46,
    quizzes: 35,
    group: 'beginner',
  },
  {
    id: 'logic',
    title: 'Logic Building',
    description: 'Learn to think like a programmer.',
    icon: <Terminal className="text-indigo-500 w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 15,
    quizzes: 15,
    group: 'beginner',
  },
  {
    id: 'sql',
    title: 'SQL',
    description: 'Master relational databases, joins, and query optimization.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" alt="SQL" className="w-8 h-8" />,
    difficulty: 'Beginner',
    difficultyColor: 'bg-emerald-100 text-emerald-700',
    lessons: 25,
    quizzes: 22,
    group: 'beginner',
  },
  {
    id: 'java',
    title: 'Java',
    description: 'Master object-oriented programming with Java.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="w-8 h-8" />,
    difficulty: 'Intermediate',
    difficultyColor: 'bg-violet-100 text-violet-700',
    lessons: 48,
    quizzes: 15,
    group: 'advanced',
  },
  {
    id: 'cpp',
    title: 'C++',
    description: 'Develop high-performance systems and games.',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++" className="w-8 h-8" />,
    difficulty: 'Advanced',
    difficultyColor: 'bg-rose-100 text-rose-700',
    lessons: 55,
    quizzes: 14,
    group: 'advanced',
  },
  {
    id: 'dsa',
    title: 'DSA',
    description: 'Ace technical interviews and code challenges.',
    icon: <img src="https://img.icons8.com/color/96/data-configuration.png" alt="DSA" className="w-8 h-8" />,
    difficulty: 'Intermediate',
    difficultyColor: 'bg-violet-100 text-violet-700',
    lessons: 100,
    quizzes: 45,
    group: 'advanced',
  },
];

const beginnerTracks = tracks.filter(t => t.group === 'beginner');
const advancedTracks = tracks.filter(t => t.group === 'advanced');

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

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const pageHeaderVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

function TrackCard({ track, index }: { track: typeof tracks[0]; index: number }) {
  return (
    <Link to={`/curriculum/${track.id}`}>
      <motion.div
        variants={cardVariants}
        whileHover={{
          y: -6,
          boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          transition: { type: 'spring', stiffness: 400, damping: 20 },
        }}
        whileTap={{ scale: 0.97 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between cursor-pointer h-full"
      >
        {/* Top: Icon + Difficulty Badge */}
        <div>
          <div className="flex items-start justify-between mb-5">
            <motion.div
              className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 shadow-sm"
              whileHover={{ scale: 1.15, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 14 }}
            >
              {track.icon}
            </motion.div>
            <motion.span
              className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${track.difficultyColor}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06 + 0.25, type: 'spring', stiffness: 300 }}
            >
              {track.difficulty}
            </motion.span>
          </div>

          {/* Title & Description */}
          <h3 className="text-[17px] font-bold text-slate-800 mb-1.5 group-hover:text-brand-primary transition-colors duration-200">
            {track.title}
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            {track.description}
          </p>
        </div>

        {/* Bottom: Lesson & Quiz Counts + Arrow */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-slate-400" />
              <span className="font-bold">{track.lessons} Lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-slate-400" />
              <span className="font-bold">{track.quizzes} Quizzes</span>
            </div>
          </div>
          <motion.div
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
            whileHover={{ backgroundColor: '#6366f1', color: '#fff', x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight size={13} />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

function Section({
  title,
  badge,
  badgeClass,
  tracks: sectionTracks,
}: {
  title: string;
  badge: string;
  badgeClass: string;
  tracks: typeof tracks;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref}>
      <motion.div
        className="flex items-center justify-between mb-6"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <motion.h2
          variants={headerVariants}
          className="text-xl font-bold text-slate-900"
        >
          {title}
        </motion.h2>
        <motion.span
          variants={badgeVariants}
          className={`text-xs font-bold uppercase tracking-widest ${badgeClass}`}
        >
          {badge}
        </motion.span>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {sectionTracks.map((track, i) => (
          <TrackCard key={track.id} track={track} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

export default function Curriculum() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">

      {/* Page Header */}
      <motion.div
        className="bg-white border-b border-slate-200 shadow-sm py-10"
        variants={pageHeaderVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.h1
            className="text-3xl font-bold text-slate-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Learning Tracks
          </motion.h1>
          <motion.p
            className="text-slate-500 mt-2 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Structured curriculum designed to take you from{' '}
            <span className="text-brand-primary font-semibold">beginner</span> to expert.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-14">
        <Section
          title="Beginner Foundations"
          badge="Strong Starts"
          badgeClass="text-brand-primary"
          tracks={beginnerTracks}
        />
        <Section
          title="Advanced & Specialized"
          badge="Level Up"
          badgeClass="text-rose-500"
          tracks={advancedTracks}
        />
      </div>
    </div>
  );
}
