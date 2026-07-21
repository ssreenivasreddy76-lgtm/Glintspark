import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseDB } from '../services/supabaseService';
import { firebaseDB } from '../services/firebaseService';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  points: number;
  successRate: string;
  track: string;
  description?: string;
  topics?: string[];
  
  // Competitive Programming Fields
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
  sampleInput1?: string;
  sampleOutput1?: string;
  explanation1?: string;
  sampleInput2?: string;
  sampleOutput2?: string;
  explanation2?: string;
  hiddenTestCases?: string; // Legacy string format
  hiddenTestCasesList?: { input: string; output: string }[];
  isPractice?: boolean;
  tracks?: string[];
  testCases?: TestCase[];
}

export interface PracticeTrack {
  id: string;
  name: string;
  initials: string;
  desc: string;
  difficulty: string;
  icon: string;
}

const STORAGE_KEY = 'glintspark_admin_data_v3';

export const INITIAL_TRACKS: PracticeTrack[] = [
  { id: 'c', name: 'C', initials: 'C', desc: 'Master low-level system programming, pointers, structures, and direct memory management.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { id: 'cplusplus', name: 'C++', initials: 'C++', desc: 'Dive into object-oriented programming, STL, memory management, and high-performance applications.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { id: 'csharp', name: 'C#', initials: 'C#', desc: 'Build modern applications with robust type safety, LINQ, and the expansive .NET ecosystem.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { id: 'sql', name: 'SQL', initials: 'SQL', desc: 'Learn relational database design, complex joins, subqueries, grouping, aggregates, and query optimization.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { id: 'postgresql', name: 'PostgreSQL', initials: 'PG', desc: 'Master advanced RDBMS concepts, JSONB data types, powerful indexing, and complex analytical functions.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { id: 'javascript', name: 'JavaScript', initials: 'JS', desc: 'Master prototype closures, dynamic event loops, asynchronous promises, DOM API, and ES6+ programming.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { id: 'java', name: 'Java', initials: 'J', desc: 'Excel in Object-Oriented Design patterns, abstract inheritance, generic collections, and robust threading models.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { id: 'python', name: 'Python', initials: 'PY', desc: 'Acquire pythonic elegance: generator iterators, list comprehensions, complex regex, and scripting automations.', difficulty: 'Beginner to Advanced', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { id: 'data-structures', name: 'Data Structures & Algos', initials: 'DS', desc: 'Design highly efficient queues, stacks, linked nodes, BST traversal, and graphs.', difficulty: 'Beginner to Advanced', icon: 'https://img.icons8.com/color/96/data-configuration.png' },
];

export const INITIAL_CHALLENGES: Challenge[] = [];

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
  const [tracks, setTracks] = useState<PracticeTrack[]>(() => {
    const s = stored?.tracks || [];
    const merged = [...INITIAL_TRACKS];
    for (const t of s) {
      if (!merged.find(m => m.id === t.id)) merged.push(t);
    }
    return merged;
  });
  const [challenges, setChallenges] = useState<Challenge[]>(stored?.challenges ?? INITIAL_CHALLENGES);

  // Sync tracks from Supabase on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const dbTracks = await supabaseDB.getTracks();
        if (dbTracks && dbTracks.length > 0) {
          const merged = [...INITIAL_TRACKS];
          for (const dt of dbTracks) {
            if (!merged.find(m => m.id === dt.id)) merged.push(dt);
          }
          setTracks(merged);
        }
      } catch (err) {
        console.error("Failed to load tracks from Supabase:", err);
      }
    };
    fetchTracks();
  }, []);

  // Sync challenges from Supabase on mount
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const dbChallenges = await supabaseDB.getProblems();
        if (dbChallenges && dbChallenges.length > 0) {
          setChallenges(dbChallenges);
        } else if (!stored?.challenges?.length) {
          setChallenges(INITIAL_CHALLENGES); 
        }
      } catch (err) {
        console.error("Failed to load challenges from Supabase:", err);
      }
    };
    fetchChallenges();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tracks, challenges }));
  }, [tracks, challenges]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.tracks) setTracks(parsed.tracks);
          if (parsed.challenges) setChallenges(parsed.challenges);
        } catch (err) {
          console.error("Failed to sync challenges from storage", err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getChallengesByTrack = useCallback(
    (trackId: string) => challenges.filter(c => c.track === trackId),
    [challenges]
  );

  const addChallenge = useCallback(async (c: Challenge) => {
    setChallenges(p => [...p, c]);
    try {
      await supabaseDB.createProblem(c);
    } catch (err) {
      console.error("Failed to save challenge to Supabase:", err);
    }
  }, []);

  const updateChallenge = useCallback(async (id: string, upd: Partial<Challenge>) => {
    setChallenges(p => p.map(c => c.id === id ? { ...c, ...upd } : c));
    try {
      // Find the full challenge object to recreate it
      const current = challenges.find(c => c.id === id) || {};
      const fullUpdate = { ...current, ...upd, id };
      await supabaseDB.deleteProblem(id);
      await supabaseDB.createProblem(fullUpdate);
    } catch (err) {
      console.error("Failed to update challenge in Supabase:", err);
    }
  }, [challenges]);

  const deleteChallenge = useCallback(async (id: string) => {
    setChallenges(p => p.filter(c => c.id !== id));
    try {
      await supabaseDB.deleteProblem(id);
    } catch (err) {
      console.error("Failed to delete challenge from Supabase:", err);
    }
  }, []);

  const addTrack = useCallback(async (t: PracticeTrack) => {
    setTracks(p => [...p, t]);
    try {
      await supabaseDB.addTrack(t);
    } catch (err) {
      console.error("Failed to save track to Supabase:", err);
    }
  }, []);

  const updateTrack = useCallback(async (id: string, upd: Partial<PracticeTrack>) => {
    setTracks(p => p.map(t => t.id === id ? { ...t, ...upd } : t));
    try {
      await supabaseDB.updateTrack(id, upd);
    } catch (err) {
      console.error("Failed to update track in Supabase:", err);
    }
  }, []);

  const deleteTrack = useCallback(async (id: string) => {
    setTracks(p => p.filter(t => t.id !== id));
    setChallenges(p => p.filter(c => c.track !== id));
    try {
      await supabaseDB.deleteTrack(id);
    } catch (err) {
      console.error("Failed to delete track from Supabase:", err);
    }
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
