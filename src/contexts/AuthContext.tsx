import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { supabase } from '../services/supabaseService';
import { supabaseDB } from '../services/supabaseService';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // We are migrating entirely to Supabase DB for auth and user profiles.
      // Removed all localStorage mock_role logic.
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


      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && window.location.pathname === '/') {
        window.location.href = '/dashboard';
        return;
      }

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


      } else {
        const mockRole = localStorage.getItem('mock_role');
        if (!mockRole) {
          setUser(null);

        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser }}>
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
