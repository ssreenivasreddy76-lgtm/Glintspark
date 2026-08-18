import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Award, Trophy } from 'lucide-react';
import { mockQuizzes } from './Quizzes';
import { useAuth } from '../contexts/AuthContext';
import { supabase, supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';
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
    },
    {
      id: 4,
      question: 'The average age of a class of 30 students is 15 years. If the teacher’s age is included, the average increases by 1. What is the teacher’s age?',
      options: ['40 years', '46 years', '45 years', '50 years'],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: 'A shopkeeper sells an item at a profit of 20%. If he had bought it at 20% less and sold it for ₹18 less, he would have gained 25%. What is the cost price?',
      options: ['₹375', '₹400', '₹450', '₹500'],
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
    },
    {
      id: 3,
      question: 'Pointing to a photograph, a man said, "I have no brother or sister, but that man\'s father is my father\'s son." Whose photograph was it?',
      options: ['His son\'s', 'His father\'s', 'His nephew\'s', 'His own'],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: 'Statements: All mangoes are golden. No golden things are cheap. Conclusion I: All mangoes are cheap. Conclusion II: Golden-colored mangoes are not cheap.',
      options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither follows'],
      correctAnswer: 1,
    }
  ],
  'arithmetic-mastery': [
    {
      id: 1,
      question: 'What is the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case?',
      options: ['4', '7', '9', '13'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'The ratio of two numbers is 3 : 4 and their HCF is 4. Their LCM is:',
      options: ['12', '16', '24', '48'],
      correctAnswer: 3,
    },
    {
      id: 3,
      question: 'If 20% of a = b, then b% of 20 is the same as:',
      options: ['4% of a', '5% of a', '20% of a', 'None of these'],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: 'Find the unit digit in the product (784 × 618 × 917 × 463):',
      options: ['2', '3', '4', '8'],
      correctAnswer: 0,
    }
  ],
  'analytical-logic': [
    {
      id: 1,
      question: 'Five people A, B, C, D, and E are sitting in a row facing North. C is sitting between A and E. B is sitting at the extreme right end. D is to the immediate left of B. Who is sitting in the middle?',
      options: ['A', 'C', 'E', 'D'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'A person walks 4 km North, then turns right and walks 3 km. How far and in what direction is he from the starting point?',
      options: ['5 km North-East', '7 km East', '5 km South-East', '4 km North'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Which word does NOT belong with the others?',
      options: ['Parsley', 'Basil', 'Dill', 'Mayonnaise'],
      correctAnswer: 3,
    }
  ],
  'time-speed-work': [
    {
      id: 1,
      question: 'A can do a piece of work in 10 days, and B can do the same work in 15 days. If they work together, in how many days will the work be completed?',
      options: ['5 days', '6 days', '8 days', '9 days'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'A car travels at 60 km/hr for the first half of a journey and at 40 km/hr for the second half. What is the average speed of the car for the entire journey?',
      options: ['48 km/hr', '50 km/hr', '52 km/hr', '45 km/hr'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Two trains running in opposite directions cross a man standing on the platform in 27 seconds and 17 seconds respectively and they cross each other in 23 seconds. The ratio of their speeds is:',
      options: ['1 : 3', '3 : 2', '3 : 4', '2 : 3'],
      correctAnswer: 1,
    }
  ],
  'coding-decoding-relations': [
    {
      id: 1,
      question: 'If in a certain code language "COMPUTER" is written as "RFUVQNPC", how will "MEDICINE" be written in that code?',
      options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'EOJDJFEM'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?',
      options: ['Brother', 'Sister', 'Nephew / Niece', 'Cannot be determined'],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: 'In a code, 256 means "you are good", 637 means "we are bad", and 358 means "good and bad". Which digit stands for "and"?',
      options: ['2', '5', '8', '3'],
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
  ],
  'core-java-oop': [
    {
      id: 1,
      question: 'Which of the following is not a principle of Object-Oriented Programming in Java?',
      options: ['Encapsulation', 'Compilation', 'Inheritance', 'Polymorphism'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'What is the default value of a boolean variable declared as an instance member in Java?',
      options: ['true', 'false', 'null', '0'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which keyword prevents a class from being inherited in Java?',
      options: ['static', 'sealed', 'final', 'abstract'],
      correctAnswer: 2,
    }
  ],
  'sql-databases': [
    {
      id: 1,
      question: 'Which SQL clause is used to filter group results after an aggregate function (e.g. GROUP BY)?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'In database ACID properties, what does the "I" stand for?',
      options: ['Integrity', 'Isolation', 'Inheritance', 'Index'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which JOIN returns all rows from the left table and matching rows from the right table?',
      options: ['INNER JOIN', 'FULL OUTER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN'],
      correctAnswer: 2,
    }
  ],
  'python-mastery': [
    {
      id: 1,
      question: 'What keyword is used in Python to define a generator function that yields values one at a time?',
      options: ['return', 'yield', 'emit', 'generate'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which of the following data structures in Python is immutable?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctAnswer: 3,
    },
    {
      id: 3,
      question: 'What is the output of `type(lambda x: x)` in Python?',
      options: ['<class \'function\'>', '<class \'lambda\'>', '<class \'object\'>', '<class \'type\'>'],
      correctAnswer: 0,
    }
  ],
  'dsa-essentials': [
    {
      id: 1,
      question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL/Red-Black)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which algorithmic paradigm does Dijkstra’s Single-Source Shortest Path algorithm follow?',
      options: ['Divide and Conquer', 'Greedy', 'Dynamic Programming', 'Backtracking'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'Which data structure is primarily used to perform a Breadth-First Search (BFS) on a graph?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Array'],
      correctAnswer: 1,
    }
  ],
  'os-concurrency': [
    {
      id: 1,
      question: 'Which of the following is NOT one of Coffman\'s four conditions required for a deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctAnswer: 2,
    },
    {
      id: 2,
      question: 'In operating systems, what is "Thrashing"?',
      options: ['Excessive CPU overclocking', 'High paging activity where the system spends more time swapping than executing', 'Network buffer overflow', 'Process starvation'],
      correctAnswer: 1,
    }
  ],
  'computer-networks': [
    {
      id: 1,
      question: 'Which layer of the OSI model is responsible for end-to-end communication and reliability (e.g. TCP)?',
      options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'What is the default port number used by secure HTTPS traffic?',
      options: ['80', '8080', '443', '22'],
      correctAnswer: 2,
    }
  ],
  'verbal-ability': [
    {
      id: 1,
      question: 'Choose the correct synonym for the word "Meticulous":',
      options: ['Careless', 'Diligent / Precise', 'Speedy', 'Ambiguous'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Identify the grammatically correct sentence:',
      options: [
        'Neither of the candidates have submitted their resume.',
        'Neither of the candidates has submitted his or her resume.',
        'Neither of the candidate were present.',
        'Neither candidates is ready.'
      ],
      correctAnswer: 1,
    }
  ],
  'cloud-devops': [
    {
      id: 1,
      question: 'In Docker, what is the file that contains instructions to assemble an automated container image?',
      options: ['docker-compose.yml', 'Dockerfile', 'Containerfile.json', 'image.spec'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'What cloud service model does AWS Lambda or Google Cloud Functions represent?',
      options: ['IaaS', 'PaaS', 'SaaS', 'FaaS (Serverless)'],
      correctAnswer: 3,
    }
  ]
};

export default function QuizPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [questionsMap, setQuestionsMap] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dbQuizzes = await firebaseDB.getQuizzes();
        setQuizzesList(dbQuizzes.length > 0 ? dbQuizzes : mockQuizzes);

        const dbQuestions = await firebaseDB.getQuizQuestions();
        setQuestionsMap(Object.keys(dbQuestions).length > 0 ? dbQuestions : MOCK_QUESTIONS);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
        setQuizzesList(mockQuizzes);
        setQuestionsMap(MOCK_QUESTIONS);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const quiz = quizzesList.find(q => q.id === id);
  const questions = questionsMap[id || ''] || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [isFinished, setIsFinished] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (quiz && timeLeft === 0 && !isFinished && currentQuestionIndex === 0 && Object.keys(selectedOptions).length === 0) {
      setTimeLeft((quiz.timeLimit || 15) * 60);
    }
  }, [quiz, timeLeft, isFinished, currentQuestionIndex, selectedOptions]);

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
    const currentSelected = selectedOptions[currentQuestionIndex] || [];
    const currentCorrect = questions[currentQuestionIndex].correctAnswer;
    const isMultiChoice = Array.isArray(currentCorrect) && currentCorrect.length > 1;
    
    if (isMultiChoice) {
      if (currentSelected.includes(optionIndex)) {
        setSelectedOptions({
          ...selectedOptions,
          [currentQuestionIndex]: currentSelected.filter(i => i !== optionIndex)
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [currentQuestionIndex]: [...currentSelected, optionIndex]
        });
      }
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestionIndex]: [optionIndex]
      });
    }
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
      const userAns = selectedOptions[idx] || [];
      if (Array.isArray(q.correctAnswer)) {
        if (userAns.length === q.correctAnswer.length && userAns.every(v => q.correctAnswer.includes(v))) {
          score++;
        }
      } else {
        if (userAns.length === 1 && userAns[0] === q.correctAnswer) {
          score++;
        }
      }
    });

    const percentage = score / questions.length;
    
    // Only award XP if they pass 50%
    if (percentage >= 0.5 && user) {
      const xpToAward = quiz?.xpReward || 50;
      try {
        let updatedUser = { ...user, xp: (user.xp || 0) + xpToAward };
        await supabase
          .from('users')
          .update({ xp: updatedUser.xp })
          .eq('id', user.id);

        const lessonId = searchParams.get('lessonId');
        if (lessonId) {
          const currentCompleted = user.completedLessonIds || [];
          if (!currentCompleted.includes(lessonId)) {
            const newCompleted = [...currentCompleted, lessonId];
            updatedUser = { ...updatedUser, completedLessonIds: newCompleted };
            await supabaseDB.updateOne(user._id, { completedLessonIds: newCompleted });
          }
          // Emit event to other tabs
          const channel = new BroadcastChannel('quiz_channel');
          channel.postMessage({ type: 'QUIZ_COMPLETED', lessonId });
          channel.close();
        }
        
        updateUser(updatedUser);
      } catch (err) {
        console.error("Failed to update XP or progress:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24 pb-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

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
      const userAns = selectedOptions[idx] || [];
      if (Array.isArray(q.correctAnswer)) {
        if (userAns.length === q.correctAnswer.length && userAns.every(v => q.correctAnswer.includes(v))) {
          score++;
        }
      } else {
        if (userAns.length === 1 && userAns[0] === q.correctAnswer) {
          score++;
        }
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
              <div className="mt-6 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full font-bold text-xl border border-white/30">
                <Award size={24} className="text-yellow-300" /> +{quiz.xpReward} XP Earned
              </div>
            )}
          </div>
          
          <div className="p-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Detailed Breakdown</h3>
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = selectedOptions[idx] || [];
                let isCorrect = false;
                const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                if (Array.isArray(q.correctAnswer)) {
                  isCorrect = userAns.length === q.correctAnswer.length && userAns.every(v => q.correctAnswer.includes(v));
                } else {
                  isCorrect = userAns.length === 1 && userAns[0] === q.correctAnswer;
                }
                
                return (
                  <div key={idx} className={`p-6 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-0.5">
                        {isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3">{idx + 1}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isOptCorrect = correctAnswers.includes(optIdx);
                            const isOptSelected = userAns.includes(optIdx);
                            return (
                              <div key={optIdx} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between
                                ${isOptCorrect ? 'bg-emerald-500 text-white' : 
                                  isOptSelected && !isOptCorrect ? 'bg-red-500 text-white' : 'bg-white text-slate-600'}
                              `}>
                                {opt}
                                {isOptCorrect && <span className="text-xs uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Correct</span>}
                                {isOptSelected && !isOptCorrect && <span className="text-xs uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-10 flex justify-center">
              {searchParams.get('newTab') === 'true' && passed ? (
                <button onClick={() => window.close()} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2">
                  Close Window <CheckCircle2 size={20} />
                </button>
              ) : searchParams.get('returnTo') && passed ? (
                <button onClick={() => navigate(searchParams.get('returnTo')!)} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2">
                  Return to Lesson <ArrowRight size={20} />
                </button>
              ) : (
                <button onClick={() => navigate('/quizzes')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-brand-primary transition-colors shadow-lg">
                  Return to Quizzes
                </button>
              )}
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
              <div key={idx} className={`w-2.5 h-2.5 rounded-full ${idx === currentQuestionIndex ? 'bg-brand-primary' : (selectedOptions[idx] && selectedOptions[idx].length > 0) ? 'bg-emerald-400' : 'bg-slate-200'}`} />
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
                const isSelected = selectedOptions[currentQuestionIndex]?.includes(idx);
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
