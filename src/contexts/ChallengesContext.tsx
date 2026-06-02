import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  points: number;
  successRate: string;
  track: string;
  description?: string;
}

export interface PracticeTrack {
  id: string;
  name: string;
  initials: string;
  desc: string;
  difficulty: string;
  icon: string;
}

const STORAGE_KEY = 'glintspark_admin_data_v1';

export const INITIAL_TRACKS: PracticeTrack[] = [
  { id: 'c', name: 'C', initials: 'C', desc: 'Master low-level system programming, pointers, structures, and direct memory management.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { id: 'sql', name: 'SQL', initials: 'SQL', desc: 'Learn relational database design, complex joins, subqueries, grouping, aggregates, and query optimization.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { id: 'javascript', name: 'JavaScript', initials: 'JS', desc: 'Master prototype closures, dynamic event loops, asynchronous promises, DOM API, and ES6+ programming.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { id: 'java', name: 'Java', initials: 'J', desc: 'Excel in Object-Oriented Design patterns, abstract inheritance, generic collections, and robust threading models.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { id: 'python', name: 'Python', initials: 'PY', desc: 'Acquire pythonic elegance: generator iterators, list comprehensions, complex regex, and scripting automations.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { id: 'data-structures', name: 'Data Structures & Algos', initials: 'DS', desc: 'Design highly efficient queues, stacks, linked nodes, BST traversal, and graphs.', difficulty: 'Beginner to Advanced', icon: 'https://img.icons8.com/color/96/data-configuration.png' },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'sum-and-difference', title: 'Sum and Difference of Two Numbers', difficulty: 'Easy', category: 'Warmup', points: 10, successRate: '98.5%', track: 'c' },
  { id: '1d-arrays', title: '1D Arrays in C', difficulty: 'Medium', category: 'Arrays', points: 30, successRate: '75.4%', track: 'c' },
  { id: 'querying-document', title: 'Querying the Document', difficulty: 'Hard', category: 'Pointers', points: 50, successRate: '42.8%', track: 'c' },
  { id: 'revising-select', title: 'Revising the Select Query', difficulty: 'Easy', category: 'Basic Select', points: 10, successRate: '92.1%', track: 'sql' },
  { id: 'the-pads', title: 'The PADS (String Manipulation)', difficulty: 'Medium', category: 'Advanced Select', points: 25, successRate: '68.2%', track: 'sql' },
  { id: 'occupations-pivot', title: 'Occupations Pivot', difficulty: 'Hard', category: 'Pivot', points: 50, successRate: '12.4%', track: 'sql' },
  { id: 'hello-world-js', title: 'Hello World (JS Foundations)', difficulty: 'Easy', category: 'Warmup', points: 10, successRate: '99.1%', track: 'javascript' },
  { id: 'arithmetic-operators', title: 'Arithmetic Operators', difficulty: 'Easy', category: 'Control Flow', points: 15, successRate: '94.2%', track: 'javascript' },
  { id: 'conditional-statements', title: 'Conditional Statements: If-Else', difficulty: 'Easy', category: 'Control Flow', points: 15, successRate: '88.9%', track: 'javascript' },
  { id: 'loops-iteration', title: 'Loops & Iteration', difficulty: 'Medium', category: 'Loops', points: 25, successRate: '76.4%', track: 'javascript' },
  { id: 'arrow-functions', title: 'Arrow Functions & Closures', difficulty: 'Medium', category: 'Functions', points: 30, successRate: '65.8%', track: 'javascript' },
  { id: 'js-promises', title: 'JavaScript Promises & Async/Await', difficulty: 'Hard', category: 'Asynchronous', points: 60, successRate: '38.2%', track: 'javascript' },
  { id: 'java-stdin-stdout', title: 'Java Stdin and Stdout', difficulty: 'Easy', category: 'Basic', points: 10, successRate: '95.6%', track: 'java' },
  { id: 'java-subarray', title: 'Java Subarray (1D Array)', difficulty: 'Medium', category: 'Arrays', points: 30, successRate: '70.1%', track: 'java' },
  { id: 'java-visitor-pattern', title: 'Java Visitor Pattern', difficulty: 'Hard', category: 'Advanced', points: 60, successRate: '22.8%', track: 'java' },
  { id: 'python-division', title: 'Python: Division & Operators', difficulty: 'Easy', category: 'Warmup', points: 10, successRate: '98.0%', track: 'python' },
  { id: 'write-a-function', title: 'Write a Function (Leap Year)', difficulty: 'Easy', category: 'Functions', points: 15, successRate: '92.3%', track: 'python' },
  { id: 'merge-the-tools', title: 'Merge the Tools! (String Slicing)', difficulty: 'Medium', category: 'Strings', points: 30, successRate: '71.5%', track: 'python' },
  { id: 'matrix-script', title: 'Matrix Script (Regex Parsing)', difficulty: 'Hard', category: 'Advanced', points: 60, successRate: '18.4%', track: 'python' },
  { id: 'print-linked-list', title: 'Print the Elements of a Linked List', difficulty: 'Easy', category: 'Linked List', points: 15, successRate: '89.7%', track: 'data-structures' },
  { id: 'tree-preorder', title: 'Tree: Preorder Traversal', difficulty: 'Medium', category: 'Trees', points: 35, successRate: '62.4%', track: 'data-structures' },
  { id: 'array-manipulation', title: 'Array Manipulation (Segment Tree)', difficulty: 'Hard', category: 'Advanced', points: 60, successRate: '15.9%', track: 'data-structures' },
];

interface ChallengesContextType {
  tracks: PracticeTrack[];
  challenges: Challenge[];
  getChallengesByTrack: (trackId: string) => Challenge[];
  addChallenge: (c: Challenge) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  addTrack: (t: PracticeTrack) => void;
  updateTrack: (id: string, updates: Partial<PracticeTrack>) => void;
  deleteTrack: (id: string) => void;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

function loadStored(): { tracks: PracticeTrack[]; challenges: Challenge[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export const ChallengesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = loadStored();
  const [tracks, setTracks] = useState<PracticeTrack[]>(stored?.tracks ?? INITIAL_TRACKS);
  const [challenges, setChallenges] = useState<Challenge[]>(stored?.challenges ?? INITIAL_CHALLENGES);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tracks, challenges }));
  }, [tracks, challenges]);

  const getChallengesByTrack = useCallback(
    (trackId: string) => challenges.filter(c => c.track === trackId),
    [challenges]
  );

  const addChallenge = useCallback((c: Challenge) => setChallenges(p => [...p, c]), []);
  const updateChallenge = useCallback((id: string, upd: Partial<Challenge>) =>
    setChallenges(p => p.map(c => c.id === id ? { ...c, ...upd } : c)), []);
  const deleteChallenge = useCallback((id: string) =>
    setChallenges(p => p.filter(c => c.id !== id)), []);

  const addTrack = useCallback((t: PracticeTrack) => setTracks(p => [...p, t]), []);
  const updateTrack = useCallback((id: string, upd: Partial<PracticeTrack>) =>
    setTracks(p => p.map(t => t.id === id ? { ...t, ...upd } : t)), []);
  const deleteTrack = useCallback((id: string) => {
    setTracks(p => p.filter(t => t.id !== id));
    setChallenges(p => p.filter(c => c.track !== id));
  }, []);

  return (
    <ChallengesContext.Provider value={{
      tracks, challenges, getChallengesByTrack,
      addChallenge, updateChallenge, deleteChallenge,
      addTrack, updateTrack, deleteTrack,
    }}>
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = () => {
  const ctx = useContext(ChallengesContext);
  if (!ctx) throw new Error('useChallenges must be used within ChallengesProvider');
  return ctx;
};
