import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, TerminalSquare, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdBanner } from '../components/AdBanner';

// Mock content database
const lessonContent: Record<string, any> = {
  'variables': {
    title: 'Variables & Data Types',
    description: 'Learn how to store and manipulate data in memory.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder URL
    content: `
Welcome to your first lesson! Think of a **variable** as a labeled box where you can store information. 
Just like you might label a box "Toys" and put a teddy bear inside, in programming, you can label a box \`age\` and put the number \`25\` inside.

### Declaring Variables

In modern programming, we create these boxes using special keywords.

### Data Types
What kind of things can you put in these boxes?
1. **Numbers:** Simple mathematics (e.g., \`42\`, \`3.14\`)
2. **Strings:** Text wrapped in quotes (e.g., \`"Hello World"\`)
3. **Booleans:** True or False (e.g., \`true\`, \`false\`)

This foundational concept is used in every single application you will ever build!
    `
  }
};

export default function LessonDetail() {
  const { topic, lessonId } = useParams();
  const navigate = useNavigate();

  // Fallback to mock data if ID not found
  const lesson = lessonContent[lessonId || ''] || lessonContent['variables'];

  // Parse markdown-like content simply for demo
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-4">{line.replace('### ', '')}</h3>;
      }
      if (line.trim() === '') return <br key={i} />;
      
      // Bold text replacement
      const parts = line.split(/(\*\*.*?\*\*|\`.*?\`)/g);
      
      return (
        <p key={i} className="text-slate-600 text-[17px] leading-relaxed mb-4">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('\`') && part.endsWith('\`')) {
              return <code key={j} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-sm border border-slate-200">{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#f3f7f7] min-h-screen">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-10 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(`/curriculum/${topic}`)}
            className="flex items-center gap-2 text-[#738f93] hover:text-brand-primary font-medium transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Syllabus
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#738f93]">Lesson 1 of 42</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-6 md:px-10 py-12 flex flex-col xl:flex-row gap-8 lg:gap-12 justify-center">
        
        {/* Left Ad Sidebar */}
        <aside className="hidden xl:block w-[280px] shrink-0">
          <div className="sticky top-24 min-h-[600px]">
            <AdBanner dataAdSlot="LESSON_LEFT_AD" />
          </div>
        </aside>

        {/* Center Content Area */}
        <div className="flex-1 max-w-[800px] w-full">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 text-brand-primary shadow-sm">
              <BookOpen size={22} />
            </div>
            <h1 className="text-[32px] font-bold text-[#1e2330] tracking-tight mb-3">{lesson.title}</h1>
            <p className="text-[18px] text-[#5c6e7a] mb-10">{lesson.description}</p>
            
            {/* New Video Player Section */}
            {lesson.videoUrl && (
              <div className="mb-10 w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 bg-slate-950 aspect-video relative group">
                <iframe 
                  src={lesson.videoUrl} 
                  title="Lesson Video"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
              {renderContent(lesson.content)}
              
              {/* Manual Code Block Mock */}
              <div className="my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl">
                <div className="flex items-center px-4 py-3 border-b border-slate-700/50 bg-[#161b22]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="ml-4 text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">example.js</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-[14px] leading-[1.8] font-mono text-slate-300">
                    <span className="text-slate-500">// Using 'let' means the value inside the box can change later</span>{'\n'}
                    <span className="text-pink-400">let</span> age = <span className="text-blue-400">25</span>;{'\n'}
                    age = <span className="text-blue-400">26</span>; <span className="text-slate-500">// This is fine!</span>{'\n\n'}
                    
                    <span className="text-slate-500">// Using 'const' means the box is sealed forever</span>{'\n'}
                    <span className="text-pink-400">const</span> name = <span className="text-amber-300">"Alice"</span>;{'\n'}
                    <span className="text-slate-500">// name = "Bob"; // This would cause an error!</span>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Sticky Action Panel */}
        <div className="w-full xl:w-[320px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2330] mb-2 text-lg">Ready to practice?</h3>
              <p className="text-sm text-[#5c6e7a] mb-6 leading-relaxed">
                Apply what you've learned in an interactive coding environment. You will declare your first variable and pass our automated tests.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Declare a variable</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Assign a value</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Pass 3 test cases</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/challenges/solve-me-first')}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group mb-3"
              >
                Practice in IDE
                <TerminalSquare size={18} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <button className="w-full py-3.5 bg-white hover:bg-[#f3f7f7] border border-slate-200 text-[#39424e] font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Next Lesson
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right Ad Sidebar (below practice box) */}
            <div className="min-h-[400px]">
              <AdBanner dataAdSlot="LESSON_RIGHT_AD" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
