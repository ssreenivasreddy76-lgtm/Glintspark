import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockQuizzes } from '../pages/Quizzes';
import { MOCK_QUESTIONS } from '../pages/QuizPlayer';
import { firebaseDB } from '../services/firebaseService';

export function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [questionsMap, setQuestionsMap] = useState<Record<string, any[]>>({});
  
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dbQuizzes = await firebaseDB.getQuizzes();
        setQuizzes(dbQuizzes.length > 0 ? dbQuizzes : mockQuizzes);

        const dbQuestions = await firebaseDB.getQuizQuestions();
        setQuestionsMap(Object.keys(dbQuestions).length > 0 ? dbQuestions : MOCK_QUESTIONS);
      } catch (e) {
        console.error(e);
        setQuizzes(mockQuizzes);
        setQuestionsMap(MOCK_QUESTIONS);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const saveToStorage = async (newQuizzes: any[], newQuestionsMap: any) => {
    setQuizzes(newQuizzes);
    setQuestionsMap(newQuestionsMap);
    try {
      await firebaseDB.saveQuizzes(newQuizzes);
      await firebaseDB.saveQuizQuestions(newQuestionsMap);
    } catch (err) {
      console.error("Failed to save quizzes to DB", err);
      alert("Failed to save to database. Please check your connection.");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      const newQuizzes = quizzes.filter(q => q.id !== id);
      const newQuestionsMap = { ...questionsMap };
      delete newQuestionsMap[id];
      saveToStorage(newQuizzes, newQuestionsMap);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 ">Quiz Management</h2>
          <p className="text-sm text-slate-500 ">Manage Aptitude, Reasoning, and Technical quizzes.</p>
        </div>
        <button 
          onClick={() => setEditingQuiz({ id: '', title: '', category: 'Aptitude', description: '', timeLimit: 15, xpReward: 50, questionsData: [] })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition"
        >
          <Plus size={16} /> Add Quiz
        </button>
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200  text-slate-500  text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Questions</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-900 ">{quiz.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600  rounded text-xs font-bold">
                    {quiz.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 ">
                  {questionsMap[quiz.id]?.length || quiz.questions || 0} Questions
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setEditingQuiz({ ...quiz, questionsData: questionsMap[quiz.id] || [] })}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No quizzes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingQuiz && (
          <QuizModal 
            initial={editingQuiz}
            onSave={(quizData, questionsData) => {
              const id = quizData.id || `quiz-${Date.now()}`;
              const updatedQuiz = { ...quizData, id, questions: questionsData.length };
              
              let newQuizzes = [...quizzes];
              if (quizData.id) {
                newQuizzes = newQuizzes.map(q => q.id === id ? updatedQuiz : q);
              } else {
                newQuizzes.push(updatedQuiz);
              }
              
              const newQuestionsMap = { ...questionsMap, [id]: questionsData };
              saveToStorage(newQuizzes, newQuestionsMap);
              setEditingQuiz(null);
            }}
            onClose={() => setEditingQuiz(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuizModal({ initial, onSave, onClose }: { initial: any, onSave: (q: any, qs: any[]) => void, onClose: () => void }) {
  const [form, setForm] = useState({
    id: initial.id,
    title: initial.title || '',
    category: initial.category || 'Aptitude',
    description: initial.description || '',
    timeLimit: initial.timeLimit || 15,
    xpReward: initial.xpReward || 50,
  });
  
  const [questions, setQuestions] = useState<any[]>(initial.questionsData || []);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: [0] }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[index] = { ...newQ[index], [field]: value };
    setQuestions(newQ);
  };

  const toggleCorrectAnswer = (qIndex: number, optIndex: number) => {
    const newQ = [...questions];
    let correctAnswers = newQ[qIndex].correctAnswer;
    
    if (typeof correctAnswers === 'number') {
      correctAnswers = [correctAnswers];
    } else if (!Array.isArray(correctAnswers)) {
      correctAnswers = [];
    }

    if (correctAnswers.includes(optIndex)) {
      if (correctAnswers.length > 1) {
        correctAnswers = correctAnswers.filter((i: number) => i !== optIndex);
      }
    } else {
      correctAnswers = [...correctAnswers, optIndex];
    }
    
    newQ[qIndex].correctAnswer = correctAnswers;
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    setQuestions(newQ);
  };

  const addOptionToQuestion = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.push('');
    setQuestions(newQ);
  };

  const removeOptionFromQuestion = (qIndex: number, optIndex: number) => {
    const newQ = [...questions];
    if (newQ[qIndex].options.length <= 2) {
      alert("A question must have at least 2 options.");
      return;
    }
    newQ[qIndex].options = newQ[qIndex].options.filter((_: any, i: number) => i !== optIndex);
    
    let correctAnswers = newQ[qIndex].correctAnswer;
    if (typeof correctAnswers === 'number') {
      correctAnswers = [correctAnswers];
    } else if (!Array.isArray(correctAnswers)) {
      correctAnswers = [];
    }

    if (correctAnswers.includes(optIndex)) {
      correctAnswers = correctAnswers.filter((i: number) => i !== optIndex);
    }
    correctAnswers = correctAnswers.map((i: number) => i > optIndex ? i - 1 : i);
    
    if (correctAnswers.length === 0) {
      correctAnswers = [0];
    }
    
    newQ[qIndex].correctAnswer = correctAnswers;
    setQuestions(newQ);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
            <h2 className="text-xl font-black text-slate-900 ">{form.id ? 'Edit Assessment' : 'Build New Assessment'}</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={() => onSave(form, questions)} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary shadow-md">
              Save Assessment
            </button>
          </div>
        </div>
        
        <div className="px-8 py-8 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
          <div className="max-w-4xl w-full space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5">
                <option>Aptitude</option>
                <option>Reasoning</option>
                <option>Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Time Limit (mins)</label>
              <input type="number" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: parseInt(e.target.value)})} className="w-full border border-slate-200  rounded-lg px-4 py-2.5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="font-black text-slate-900 ">Questions ({questions.length})</h3>
              <button onClick={addQuestion} className="text-sm font-bold text-brand-primary flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={q.id || qIndex} className="bg-white  p-6 rounded-xl border border-slate-200  relative shrink-0">
                <button onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
                <label className="block text-xs font-bold text-slate-500  uppercase mb-2">Question {qIndex + 1}</label>
                <input value={q.question} onChange={e => updateQuestion(qIndex, 'question', e.target.value)} className="w-full border border-slate-200  rounded-lg px-4 py-2 mb-4" />
                
                <div className="space-y-2">
                  {q.options.map((opt: string, oIndex: number) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        name={`correct-${qIndex}-${oIndex}`} 
                        checked={
                          Array.isArray(q.correctAnswer) 
                            ? q.correctAnswer.includes(oIndex) 
                            : q.correctAnswer === oIndex
                        }
                        onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                        className="w-4 h-4 text-brand-primary rounded"
                      />
                      <input 
                        value={opt} 
                        onChange={e => updateOption(qIndex, oIndex, e.target.value)} 
                        className="flex-1 border border-slate-200  rounded-lg px-4 py-2" 
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      {q.options.length > 2 && (
                        <button 
                          onClick={() => removeOptionFromQuestion(qIndex, oIndex)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          title="Remove Option"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => addOptionToQuestion(qIndex)}
                  className="mt-4 text-sm font-bold text-brand-primary flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
