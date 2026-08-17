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
  
  // Sample Test Cases
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
  allowedLanguages?: string[];
  companies?: string[];
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

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    track: "data-structures",
    category: "Arrays & Strings",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    initialCode: "function twoSum(nums, target) {\n  \n}",
    testCases: [],
    companies: ["Google", "Amazon", "Apple", "Meta", "Microsoft"],
    topics: ["Arrays", "Hash Table"]
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "Medium",
    track: "data-structures",
    category: "Linked Lists",
    description: "You are given two non-empty linked lists representing two non-negative integers.",
    initialCode: "function addTwoNumbers(l1, l2) {\n  \n}",
    testCases: [],
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    topics: ["Linked Lists", "Math"]
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    track: "data-structures",
    category: "Arrays & Strings",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    initialCode: "function lengthOfLongestSubstring(s) {\n  \n}",
    testCases: [],
    companies: ["Amazon", "Bloomberg", "Spotify"],
    topics: ["Strings", "Sliding Window"]
  },
  {
    id: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    track: "data-structures",
    category: "Arrays & Strings",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    initialCode: "function findMedianSortedArrays(nums1, nums2) {\n  \n}",
    testCases: [],
    companies: ["Google", "Microsoft", "Apple", "Yahoo"],
    topics: ["Arrays", "Binary Search", "Divide and Conquer"]
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    track: "data-structures",
    category: "Arrays & Strings",
    description: "Given a string s, return the longest palindromic substring in s.",
    initialCode: "function longestPalindrome(s) {\n  \n}",
    testCases: [],
    companies: ["Amazon", "Microsoft"],
    topics: ["Strings", "Dynamic Programming"]
  },
  {
    id: "regular-expression-matching",
    title: "Regular Expression Matching",
    difficulty: "Hard",
    track: "data-structures",
    category: "Dynamic Programming",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
    initialCode: "function isMatch(s, p) {\n  \n}",
    testCases: [],
    companies: ["Meta", "Google"],
    topics: ["Strings", "Dynamic Programming", "Recursion"]
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    track: "data-structures",
    category: "Arrays & Strings",
    description: "You are given an integer array height of length n.",
    initialCode: "function maxArea(height) {\n  \n}",
    testCases: [],
    companies: ["Amazon", "Meta", "Adobe"],
    topics: ["Arrays", "Two Pointers"]
  },
  {
    id: "integer-to-roman",
    title: "Integer to Roman",
    difficulty: "Medium",
    track: "data-structures",
    category: "Math",
    description: "Roman numerals are represented by seven different symbols.",
    initialCode: "function intToRoman(num) {\n  \n}",
    testCases: [],
    companies: ["Amazon", "Microsoft", "Twitter"],
    topics: ["Math", "Strings"]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    track: "data-structures",
    category: "Stacks & Queues",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    initialCode: "function isValid(s) {\n  \n}",
    testCases: [],
    companies: ["Meta", "Amazon", "Microsoft", "LinkedIn", "Spotify"],
    topics: ["Strings", "Stacks"]
  },
  {
    id: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    track: "data-structures",
    category: "Linked Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.",
    initialCode: "function mergeKLists(lists) {\n  \n}",
    testCases: [],
    companies: ["Meta", "Google", "Amazon", "Uber", "Apple"],
    topics: ["Linked Lists", "Divide and Conquer", "Heap"]
  }
];

interface ChallengesContextType {
  tracks: PracticeTrack[];
  challenges: Challenge[];
  getChallengesByTrack: (trackId: string) => Challenge[];
  addChallenge: (c: Challenge) => void;
  addChallengesBulk: (challenges: Challenge[]) => Promise<void>;
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
    const s = Array.isArray(stored?.tracks) ? stored.tracks : [];
    const merged = [...INITIAL_TRACKS];
    for (const t of s) {
      if (!merged.find(m => m.id === t.id)) merged.push(t);
    }
    return merged;
  });
  const initialChallenges = Array.isArray(stored?.challenges) ? stored.challenges : INITIAL_CHALLENGES;
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);

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
        setChallenges(dbChallenges || []);
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

  const addChallengesBulk = useCallback(async (newChallenges: Challenge[]) => {
    setChallenges(p => [...p, ...newChallenges]);
    try {
      await supabaseDB.createProblemsBulk(newChallenges);
    } catch (err) {
      console.error("Failed to bulk save challenges to Supabase:", err);
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
      addChallenge, addChallengesBulk, updateChallenge, deleteChallenge,
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
