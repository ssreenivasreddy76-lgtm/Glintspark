import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, BrainCircuit, Play, FileText, Video, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { firebaseDB } from '../services/firebaseService';

const DEFAULT_TEMPLATES = [
  { id: 'dt-1', title: 'C Programming', role: 'Software Engineer', difficulty: 'Medium', techStack: 'C, Pointers, Memory Management', prompt: 'You are a strict C interviewer. Ask about pointers, memory management, and data structures in C.' },
  { id: 'dt-2', title: 'Java Developer', role: 'Backend', difficulty: 'Medium', techStack: 'Java, OOP, Spring Boot', prompt: 'You are a Java technical interviewer. Focus on Object-Oriented Programming, Java Core, and Spring Boot.' },
  { id: 'dt-3', title: 'Python Engineer', role: 'Software Engineer', difficulty: 'Medium', techStack: 'Python, Django, Data Processing', prompt: 'You are a Python interviewer. Ask about Pythonic idioms, generators, decorators, and data structures.' },
  { id: 'dt-4', title: 'C++ Developer', role: 'Systems Engineer', difficulty: 'Hard', techStack: 'C++, STL, Memory', prompt: 'You are a systems engineering interviewer. Ask about C++ STL, smart pointers, and low-level memory.' },
  { id: 'dt-5', title: 'Data Structures & Algorithms', role: 'General', difficulty: 'Hard', techStack: 'DSA, Problem Solving', prompt: 'You are a FAANG interviewer. Ask complex algorithmic questions and optimize time/space complexity.' },
  { id: 'dt-6', title: 'Java Full Stack', role: 'Full Stack', difficulty: 'Hard', techStack: 'Java, React, Spring, SQL', prompt: 'You are evaluating a full-stack Java developer. Ask about connecting a React frontend to a Spring Boot backend.' },
  { id: 'dt-7', title: 'Frontend Developer', role: 'Frontend', difficulty: 'Medium', techStack: 'HTML, CSS, JavaScript, React', prompt: 'You are a frontend interviewer. Ask about DOM manipulation, CSS grid/flexbox, JS closures, and React hooks.' },
  { id: 'dt-8', title: 'Database Engineer', role: 'Data', difficulty: 'Medium', techStack: 'SQL, PostgreSQL, Database Design', prompt: 'You are a database architect. Ask about SQL joins, indexing, normalization, and query optimization.' },
  { id: 'dt-9', title: 'System Design Architect', role: 'Architect', difficulty: 'Hard', techStack: 'System Design, Microservices, Cloud', prompt: 'You are a Staff Engineer evaluating system design. Focus on scalability, fault tolerance, and high-throughput systems.' },
];

export function AdminMockInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [editingInterview, setEditingInterview] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const processData = async (rows: any[]) => {
      // Map rows directly to our standardized structure
      const questions = rows.map((r, i) => ({
        id: r['ID'] || `q-${i}-${Date.now()}`,
        subject: r['Subject'] || 'C Programming',
        topic: r['Topic'] || 'General',
        subtopic: r['Subtopic'] || '',
        difficulty: r['Difficulty'] || 'Medium',
        question: r['Question'] || '',
        expectedAnswer: r['Expected Answer'] || '',
        keywords: r['Keywords'] || '',
        marks: r['Marks'] || '10',
        estimatedTime: r['Estimated Time'] || '2'
      })).filter(q => q.question);

      try {
        await firebaseDB.saveInterviewBank(questions);
        alert(`Successfully imported ${questions.length} questions into the Global Question Bank!`);
      } catch (err) {
        alert('Failed to save to database. Please check your connection.');
        console.error(err);
      }
      setIsUploading(false);
      e.target.value = '';
    };

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const data = new Uint8Array(buffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet);
          processData(rows);
        } catch (err) {
          console.error('Failed to parse Excel', err);
          alert('Failed to parse Excel file.');
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: () => {
          alert('Failed to parse CSV file.');
          setIsUploading(false);
        }
      });
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await firebaseDB.getMockTemplates();
        setInterviews(templates);
      } catch (err) {
        console.error('Failed to load mock templates', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mock interview template?')) {
      try {
        await firebaseDB.deleteMockTemplate(id);
        setInterviews(interviews.filter(i => i.id !== id));
      } catch (err) {
        alert('Failed to delete template');
      }
    }
  };

  const handleSelectTemplate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    const template = DEFAULT_TEMPLATES.find(t => t.id === selectedId);
    if (template) {
      if (confirm(`Do you want to add the "${template.title}" template?`)) {
        const newTemplate = { ...template, id: `dt-${Date.now()}` };
        try {
          await firebaseDB.saveMockTemplate(newTemplate);
          setInterviews([...interviews, newTemplate]);
        } catch (err: any) {
          alert('Failed to save template to database: ' + (err.message || err));
        }
      }
    }
    e.target.value = ''; // Reset select
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 ">Mock Interview Templates</h2>
          <p className="text-sm text-slate-500 ">Create AI personas and templates for mock technical interviews.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <button 
              className={`flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700  text-sm font-bold rounded-lg shadow-sm transition ${isUploading ? 'opacity-50' : 'hover:bg-slate-200'}`}
            >
              <Video size={16} /> {isUploading ? 'Uploading...' : 'Upload Question Bank'}
            </button>
          </div>
          <div className="relative">
            <select
              onChange={handleSelectTemplate}
              className="appearance-none flex items-center gap-2 pl-9 pr-8 py-2 bg-slate-100 text-slate-700  text-sm font-bold rounded-lg shadow-sm hover:bg-slate-200 transition outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>✨ Load Starter Template</option>
              {DEFAULT_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500  pointer-events-none" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500  pointer-events-none" />
          </div>
          <button 
            onClick={() => setEditingInterview({ id: '', title: '', role: '', difficulty: 'Medium', techStack: '', prompt: '' })}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
          >
            <Plus size={16} /> Add Template
          </button>
        </div>
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200  text-slate-500  text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Title & Role</th>
              <th className="px-6 py-4">Tech Stack</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {interviews.map((interview) => (
              <tr key={interview.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 ">{interview.title}</p>
                  <p className="text-xs text-slate-500  mt-0.5">{interview.role}</p>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600 ">{interview.techStack}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    interview.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                    interview.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {interview.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingInterview(interview)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(interview.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {interviews.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No interview templates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingInterview && (
          <InterviewModal 
            initial={editingInterview}
            onSave={async (data) => {
              const id = data.id || `mi-${Date.now()}`;
              const updated = { ...data, id };
              try {
                await firebaseDB.saveMockTemplate(updated);
                let newInterviews = [...interviews];
                if (data.id) {
                  newInterviews = newInterviews.map(i => i.id === id ? updated : i);
                } else {
                  newInterviews.push(updated);
                }
                setInterviews(newInterviews);
                setEditingInterview(null);
              } catch (err: any) {
                alert('Failed to save template to database: ' + (err.message || err));
              }
            }}
            onClose={() => setEditingInterview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InterviewModal({ initial, onSave, onClose }: { initial: any, onSave: (data: any) => void, onClose: () => void }) {
  const [form, setForm] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white  rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-slate-900 ">{form.id ? 'Edit Template' : 'Add Template'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
        </div>
        
        <div className="px-8 py-6 flex-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Title (e.g. Senior React Engineer)</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Role Category</label>
              <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Frontend, Backend..." className="w-full border border-slate-200  rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5 bg-white ">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Tech Stack / Focus Areas</label>
            <input value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} placeholder="e.g. React, TypeScript, Redux" className="w-full border border-slate-200  rounded-lg px-4 py-2.5" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500  uppercase mb-2">AI System Prompt / Instructions</label>
            <textarea value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5" rows={4} placeholder="You are an expert interviewer..." />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500  font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={() => form.title.trim() && onSave(form)} disabled={!form.title.trim()} className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary disabled:opacity-50">
            Save Template
          </button>
        </div>
      </motion.div>
    </div>
  );
}
