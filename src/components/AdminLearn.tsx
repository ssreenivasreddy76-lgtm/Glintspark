import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Book, X, ChevronRight, Video, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initial default tracks for curriculum (similar to Practice tracks)
const initialTracks = [
  { id: 'c', name: 'C', desc: 'Master low-level system programming' },
  { id: 'sql', name: 'SQL', desc: 'Learn relational database design' },
  { id: 'javascript', name: 'JavaScript', desc: 'Master prototype closures, dynamic event loops' },
  { id: 'java', name: 'Java', desc: 'Excel in Object-Oriented Design patterns' },
  { id: 'python', name: 'Python', desc: 'Acquire pythonic elegance' },
  { id: 'dsa', name: 'Data Structures & Algos', desc: 'Design highly efficient queues, stacks, linked nodes' }
];

export function AdminLearn() {
  const [tracks, setTracks] = useState(initialTracks);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  
  const [lessonsMap, setLessonsMap] = useState<Record<string, any[]>>({});
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  useEffect(() => {
    const savedLessons = localStorage.getItem('mock_curriculum_lessons');
    if (savedLessons) {
      try {
        setLessonsMap(JSON.parse(savedLessons));
      } catch {
        setLessonsMap({});
      }
    }
  }, []);

  const saveToStorage = (newMap: Record<string, any[]>) => {
    localStorage.setItem('mock_curriculum_lessons', JSON.stringify(newMap));
    setLessonsMap(newMap);
  };

  const handleDeleteLesson = (trackId: string, lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      const trackLessons = lessonsMap[trackId] || [];
      const newMap = { ...lessonsMap, [trackId]: trackLessons.filter(l => l.id !== lessonId) };
      saveToStorage(newMap);
    }
  };

  if (selectedTrackId) {
    const track = tracks.find(t => t.id === selectedTrackId);
    const trackLessons = lessonsMap[selectedTrackId] || [];

    return (
      <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setSelectedTrackId(null)} className="text-slate-500 hover:text-brand-primary font-bold">Curriculum</button>
          <ChevronRight size={16} className="text-slate-300" />
          <h2 className="text-xl font-black text-slate-900">{track?.name} Lessons</h2>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500">Manage lessons and modules for the {track?.name} curriculum.</p>
          <button 
            onClick={() => setEditingLesson({ id: '', title: '', type: 'video', contentUrl: '', description: '', duration: 10 })}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
          >
            <Plus size={16} /> Add Lesson
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">Lesson</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {trackLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{lesson.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lesson.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      {lesson.type === 'video' ? <Video size={14} className="text-blue-500"/> : <FileText size={14} className="text-orange-500"/>}
                      {lesson.type === 'video' ? 'Video' : 'Article'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{lesson.duration} mins</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingLesson(lesson)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteLesson(selectedTrackId, lesson.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {trackLessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No lessons added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {editingLesson && (
            <LessonModal 
              initial={editingLesson}
              onSave={(data) => {
                const id = data.id || `lsn-${Date.now()}`;
                const updated = { ...data, id };
                
                let currentLessons = [...(lessonsMap[selectedTrackId] || [])];
                if (data.id) {
                  currentLessons = currentLessons.map(l => l.id === id ? updated : l);
                } else {
                  currentLessons.push(updated);
                }
                
                saveToStorage({ ...lessonsMap, [selectedTrackId]: currentLessons });
                setEditingLesson(null);
              }}
              onClose={() => setEditingLesson(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Curriculum Management</h2>
          <p className="text-sm text-slate-500">Select a programming language track to manage its lessons and modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map(t => {
          const count = (lessonsMap[t.id] || []).length;
          return (
            <div 
              key={t.id} 
              onClick={() => setSelectedTrackId(t.id)} 
              className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all relative group cursor-pointer"
            >
              <div className="w-12 h-12 bg-indigo-50 text-brand-primary border border-indigo-100 rounded-xl flex items-center justify-center p-2 mb-4 group-hover:scale-110 transition-transform">
                <Book size={20} />
              </div>
              <h3 className="text-[17px] font-black text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">{t.name}</h3>
              <p className="text-[13px] text-slate-500 font-medium line-clamp-2">{t.desc}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{count} Lessons</span>
                <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform">Manage →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonModal({ initial, onSave, onClose }: { initial: any, onSave: (data: any) => void, onClose: () => void }) {
  const [form, setForm] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-slate-900">{form.id ? 'Edit Lesson' : 'Add Lesson'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
        </div>
        
        <div className="px-8 py-6 flex-1 space-y-4 bg-slate-50">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lesson Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white">
                <option value="video">Video</option>
                <option value="article">Article / Text</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (mins)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Content URL (Video ID or Markdown URL)</label>
            <input value={form.contentUrl} onChange={e => setForm({...form, contentUrl: e.target.value})} placeholder="e.g. YouTube ID or link" className="w-full border border-slate-200 rounded-lg px-4 py-2.5" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lesson Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5" rows={3} />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={() => form.title.trim() && onSave(form)} disabled={!form.title.trim()} className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary disabled:opacity-50">
            Save Lesson
          </button>
        </div>
      </motion.div>
    </div>
  );
}
