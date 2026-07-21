import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { supabase } from '../services/supabaseService';
import { supabaseDB } from '../services/supabaseService';
import { firebaseAuth } from '../services/firebaseService';
import { signInWithCustomToken } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check for hardcoded mock login
      const mockRole = localStorage.getItem('mock_role');
      const mockEmail = sessionStorage.getItem('mock_email');
      
      if (mockRole) {
        setUser({
          _id: `mock_${mockRole}`,
          email: mockEmail || `${mockRole}@glintspark.com`,
          name: mockRole === 'admin' ? 'Master Admin' : 'Company Partner',
          firstName: mockRole === 'admin' ? 'Master' : 'Company',
          lastName: mockRole === 'admin' ? 'Admin' : 'Partner',
          avatar: '',
          lessonsCompleted: 0,
          completedLessonIds: [],
          unlockedLessonIds: [],
          createdAt: new Date(),
          onboardingCompleted: true,
          streak: 0,
          xp: 0,
          lastActiveAt: new Date().toISOString(),
          activity_log: [],
          activity_history: []
        });
        setLoading(false);
        return; // Bypass Supabase
      }

      // 2. Normal Supabase flow
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // INSTANT UI UNLOCK: Set a skeleton user so the app loads immediately
        setUser({
          _id: session.user.id,
          email: session.user.email || '',
          name: '',
          firstName: '',
          lastName: '',
          avatar: '',
          lessonsCompleted: 0,
          completedLessonIds: [],
          unlockedLessonIds: [],
          createdAt: new Date(),
          onboardingCompleted: true,
          streak: 0,
          xp: 0,
          lastActiveAt: new Date().toISOString(),
          activity_log: [],
          activity_history: []
        });
        setLoading(false); // Stop loading screen immediately!

        // BACKGROUND: Fetch real profile
        supabaseDB.findOne({ _id: session.user.id }).then(profile => {
          if (profile) setUser(profile);
        });

        // Fetch Custom Token and Sign in to Firebase (Run in background to avoid blocking login)
        (async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await fetch(`${apiUrl}/api/firebase-token`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            if (res.ok && firebaseAuth) {
              const { token } = await res.json();
              await signInWithCustomToken(firebaseAuth, token);
            }
          } catch (err) {
            console.error("Failed to sign in to Firebase with custom token", err);
          }
        })();
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // INSTANT UI UNLOCK for auth state changes
        setUser(prev => prev || {
          _id: session.user.id,
          email: session.user.email || '',
          name: '',
          firstName: '',
          lastName: '',
          avatar: '',
          lessonsCompleted: 0,
          completedLessonIds: [],
          unlockedLessonIds: [],
          createdAt: new Date(),
          onboardingCompleted: true,
          streak: 0,
          xp: 0,
          lastActiveAt: new Date().toISOString(),
          activity_log: [],
          activity_history: []
        });
        setLoading(false);

        // BACKGROUND: Fetch real profile
        supabaseDB.findOne({ _id: session.user.id }).then(async profile => {
          if (profile) {
            setUser(profile);
            if (profile.onboarding_completed) {
              localStorage.setItem(`onboarded_${session.user.id}`, 'true');
            }
          } else {
            // New user missing from DB, upsert a default row!
            const newProfile = {
               _id: session.user.id,
               email: session.user.email || '',
               name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
               first_name: session.user.user_metadata?.first_name || '',
               xp: 0,
               streak: 0,
               onboarding_completed: false
            };
            await supabaseDB.upsertUser(newProfile);
          }
        });

        // Fetch Custom Token and Sign in to Firebase (Run in background)
        (async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await fetch(`${apiUrl}/api/firebase-token`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            if (res.ok && firebaseAuth) {
              const { token } = await res.json();
              await signInWithCustomToken(firebaseAuth, token);
            }
          } catch (err) {
            console.error("Failed to sign in to Firebase with custom token", err);
          }
        })();
      } else {
        const mockRole = localStorage.getItem('mock_role');
        if (!mockRole) {
          setUser(null);
          if (firebaseAuth) await firebaseAuth.signOut();
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    localStorage.removeItem('mock_role');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
