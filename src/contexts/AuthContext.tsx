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
        supabaseDB.findOne({ _id: session.user.id }).then(profile => {
          if (profile) setUser(profile);
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
        setUser(null);
        if (firebaseAuth) await firebaseAuth.signOut();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
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
