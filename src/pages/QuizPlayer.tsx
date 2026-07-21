import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Award, Trophy } from 'lucide-react';
import { mockQuizzes } from './Quizzes';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { Logo } from '../components/Logo';

// Mock questions for the 3 demo quizzes
export const MOCK_QUESTIONS: Record<string, any[]> = {
  'aptitude-101': [
    {
      id: 1,
      question: 'A train 120 meters long is running with a speed of 60 km/hr. In what time will it pass a man who is running at 6 km/hr in the direction opposite to that in which the train is going?',
      options: ['5.24 sec', '6.54 sec', '7.0 sec', '6.8 sec'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are used together, then how long will it take to fill the tank?',
      options: ['12 mins', '15 mins', '25 mins', '50 mins'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'If the price of a book is first decreased by 25% and then increased by 20%, then the net change in the price will be:',
      options: ['10% decrease', '5% decrease', 'No change', '10% increase'],
      correctAnswer: 0,
    }
  ],
  'reasoning-logic': [
    {
      id: 1,
      question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
      options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'SCD, TEF, UGH, ____, WKL. What comes next?',
      options: ['CMN', 'UJI', 'VIJ', 'IJT'],
      correctAnswer: 2,
    }
  ],
  'tech-react-basics': [
    {
      id: 1,
      question: 'What is the correct syntax to update the state variable "count" using the useState hook?',
      options: ['this.setState({count: count + 1})', 'setCount(count + 1)', 'count = count + 1', 'updateCount(count + 1)'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which hook is used to perform side effects in a functional React component?',
      options: ['useSideEffect', 'useEffect', 'useReducer', 'useContext'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'What does a React component return?',
      options: ['HTML string', 'React Elements', 'DOM nodes', 'JSON object'],
      correctAnswer: 1,
    }
  ]
};

export default function QuizPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [questionsMap, setQuestionsMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const savedQuizzes = localStorage.getItem('mock_quizzes');
    if (savedQuizzes) {
      try {
        setQuizzesList(JSON.parse(savedQuizzes));
      } catch {
        setQuizzesList(mockQuizzes);
      }
    } else {
      setQuizzesList(mockQuizzes);
    }

    const savedQuestions = localStorage.getItem('mock_quiz_questions');
    if (savedQuestions) {
      try {
        setQuestionsMap(JSON.parse(savedQuestions));
      } catch {
        setQuestionsMap(MOCK_QUESTIONS);
      }
    } else {
      setQuestionsMap(MOCK_QUESTIONS);
    }
  }, []);

  const quiz = quizzesList.find(q => q.id === id);
  const questions = questionsMap[id || ''] || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState((quiz?.timeLimit || 15) * 60);

  useEffect(() => {
    if (!quiz) return;
    
    if (timeLeft <= 0 && !isFinished) {
      handleFinish();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, quiz]);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsFinished(true);
    
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = score / questions.length;
    
    // Only award XP if they pass 50%
    if (percentage >= 0.5 && user) {
      const xpToAward = quiz?.xpReward || 50;
      try {
        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + xpToAward })
          .eq('id', user.id);
      } catch (err) {
        console.error("Failed to update XP:", err);
      }
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <button onClick={() => navigate('/quizzes')} className="px-6 py-2 bg-brand-primary text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- RESULTS SCREEN ---
  if (isFinished) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correctAnswer) {
        score++;
      }
    });
    const passed = (score / questions.length) >= 0.5;

    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className={`p-10 text-center ${passed ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
            {passed ? <Trophy size={64} className="mx-auto mb-4" /> : <XCircle size={64} className="mx-auto mb-4" />}
            <h1 className="text-4xl font-black mb-2">{passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
            <p className="text-lg opacity-90">You scored {score} out of {questions.length}</p>
            {passed && (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full font-bold text-xl border border-white/30">
                <Award size={24} className="text-yellow-300" /> +{quiz.xpReward} XP Earned
              </div>
            )}
          </div>
          
          <div className="p-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Detailed Breakdown</h3>
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = selectedOptions[idx];
                const isCorrect = userAns === q.correctAnswer;
                
                return (
                  <div key={idx} className={`p-6 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-0.5">
                        {isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3">{idx + 1}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between
                              ${optIdx === q.correctAnswer ? 'bg-emerald-500 text-white' : 
                                optIdx === userAns && !isCorrect ? 'bg-red-500 text-white' : 'bg-white text-slate-600'}
                            `}>
                              {opt}
                              {optIdx === q.correctAnswer && <span className="text-xs uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Correct</span>}
                              {optIdx === userAns && !isCorrect && <span className="text-xs uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Your Answer</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-10 flex justify-center">
              <button onClick={() => navigate('/quizzes')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-brand-primary transition-colors shadow-lg">
                Return to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ ACTIVE SCREEN ---
  const currentQ = questions[currentQuestionIndex];
  
  if (!currentQ) {
    return <div className="p-8 text-center text-xl font-bold text-slate-500">Coming soon... No questions available for this quiz yet!</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quizzes')} className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-slate-900 leading-tight">{quiz.title}</h1>
            <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">{quiz.category}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 lg:p-12">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-full ${idx === currentQuestionIndex ? 'bg-brand-primary' : selectedOptions[idx] !== undefined ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-relaxed">
              {currentQ.question}
            </h2>
            
            <div className="space-y-4">
              {currentQ.options.map((option: string, idx: number) => {
                const isSelected = selectedOptions[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 group
                      ${isSelected 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                        : 'border-slate-100 hover:border-brand-primary/30 hover:bg-slate-50 text-slate-700'
                      }
                    `}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors
                      ${isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-300 text-slate-500 group-hover:border-brand-primary group-hover:text-brand-primary'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-200' : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            <ArrowLeft size={20} /> Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              onClick={handleFinish}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
            >
              Submit Quiz <CheckCircle2 size={20} />
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white bg-slate-900 hover:bg-brand-primary transition-colors shadow-md"
            >
              Next <ArrowRight size={20} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
