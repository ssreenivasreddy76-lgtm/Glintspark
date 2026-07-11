import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, InterviewSession } from '../types';
import { firebaseDB } from './firebaseService';

const getEnv = (key: string): string => {
  return (import.meta.env[key] as string) || '';
};

class SupabaseService {
  public supabase: SupabaseClient;
  private isConfigured: boolean = false;
  private streakEnabled: boolean = true;
  private supabaseUrl: string;

  constructor() {
    const envUrl = getEnv('VITE_SUPABASE_URL');
    const envKey = getEnv('VITE_SUPABASE_ANON_KEY');
    this.supabaseUrl = envUrl;

    if (!envUrl || !envKey) {
      console.warn("❌ Supabase Configuration Missing.");
      this.supabase = createClient('https://placeholder.supabase.co', 'placeholder');
    } else {
      this.isConfigured = true;
      this.supabase = createClient(this.supabaseUrl, envKey);
    }
  }

  private async formatUserForApp(profile: Record<string, unknown>): Promise<User | null> {
    if (!profile) return null;
    return {
      _id: profile.id as string,
      email: profile.email as string,
      name: (profile.name as string) || 'User',
      firstName: profile.first_name as string,
      lastName: profile.last_name as string,
      avatar: profile.avatar as string,
      lessonsCompleted: (profile.lessons_completed as number) || 0,
      completedLessonIds: (profile.completed_lesson_ids as string[]) || [],
      unlockedLessonIds: (profile.unlocked_lesson_ids as string[]) || ['c1'],
      createdAt: new Date(profile.created_at as string),
      onboardingCompleted: (profile.onboarding_completed as boolean) || false,
      streak: (profile.streak as number) || 0,
      xp: (profile.xp as number) || 0,
      lastActiveAt: profile.last_active_at as string,
      activity_log: (profile.activity_log as string[]) || [],
      activity_history: (profile.activity_history as any[]) || [],
    };
  }

  async findOne(query: { _id?: string }): Promise<User | null> {
    if (!query._id) return null;
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return null;

      try {
        const res = await fetch(`/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const profile = await res.json();
          return this.formatUserForApp(profile);
        }
      } catch (e) {
        console.warn("Go API failed, falling back to direct Supabase DB", e);
      }
      
      const { data } = await this.supabase.from('users').select('*').eq('id', query._id).single();
      return this.formatUserForApp(data as Record<string, unknown>);
    } catch (err) {
      console.error("Error in findOne:", err);
      return null;
    }
  }

  async updateOne(id: string, updates: Partial<User>): Promise<User> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.activity_log !== undefined) dbUpdates.activity_log = updates.activity_log;
    if (updates.activity_history !== undefined) dbUpdates.activity_history = updates.activity_history;

    try {
      const res = await fetch(`/api/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dbUpdates)
      });
      if (res.ok) {
        const data = await res.json();
        return (await this.formatUserForApp(data))!;
      }
    } catch (e) {
      console.warn("Go API failed for updateOne, falling back to direct Supabase DB", e);
    }

    const { data, error } = await this.supabase.from('users').update(dbUpdates).eq('id', id).select().single();
    if (error) throw new Error(error.message || "Failed to update profile");
    return (await this.formatUserForApp(data as Record<string, unknown>))!;
  }

  // --- PRACTICE TRACKS API ---
  async getTracks(): Promise<unknown[]> {
    try {
      try {
        const res = await fetch(`/api/tracks`);
        if (res.ok) return await res.json();
      } catch {
        console.warn("Go API failed for getTracks, falling back to direct Supabase DB");
      }
      const { data } = await this.supabase.from('practice_tracks').select('*').order('created_at', { ascending: true });
      return data || [];
    } catch (err) {
      console.error("Error in getTracks:", err);
      return [];
    }
  }

  async addTrack(track: unknown): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(track)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to add track");
    }
  }

  async updateTrack(id: string, updates: unknown): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/tracks?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to update track");
    }
  }

  async deleteTrack(id: string): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/tracks?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to delete track");
    }
  }

  // --- CONTESTS API ---
  async getContests(): Promise<unknown[]> {
    try {
      try {
        const res = await fetch(`/api/contests`);
        if (res.ok) return await res.json();
      } catch {
        console.warn("Go API failed for getContests, falling back to direct Supabase DB");
      }
      const { data } = await this.supabase.from('contests').select('*').order('created_at', { ascending: false });
      return data || [];
    } catch (err) {
      console.error("Error in getContests:", err);
      return [];
    }
  }

  async addContest(contest: unknown): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/contests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contest)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to add contest");
    }
  }

  async updateContest(id: string, updates: unknown): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/contests?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to update contest");
    }
  }

  async deleteContest(id: string): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No active session");

    const res = await fetch(`/api/contests?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || "Failed to delete contest");
    }
  }

  // --- SAVE INTERVIEW SESSION TO GCP FIRESTORE ---
  async saveInterview(session: InterviewSession): Promise<void> {
    if (!this.isConfigured) return;
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const feedbackObj = session.feedback as Record<string, unknown> | undefined;
    const score = feedbackObj?.overallScore || 
                  Math.round(((feedbackObj?.technicalScore as number || 0) + 
                  (feedbackObj?.communicationScore as number || 0) + 
                  (feedbackObj?.confidenceScore as number || 0)) / 3);

    try {
      await firebaseDB.saveInterview({
        userId: user.id,
        topic: session.topic,
        messages: session.messages,
        feedback: session.feedback,
        score: score as number
      });
    } catch (err) {
      console.error("Failed to save interview session to Firestore:", err);
      // LocalStorage fallback if offline or Firestore fails
      try {
        const stored = JSON.parse(localStorage.getItem('glintspark_interviews') || '[]');
        const newSession = {
          id: `session-${Date.now()}`,
          topic: session.topic,
          messages: session.messages,
          feedback: session.feedback,
          score: score,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('glintspark_interviews', JSON.stringify([newSession, ...stored]));
      } catch (e) {
        console.error("Error saving interview locally:", e);
      }
    }
  }

  async getPlatformStats() {
    if (!this.isConfigured) {
      return { users: 45230, sessions: 1240, accuracy: 99.9, efficiency: 40 };
    }

    try {
      // Fetch total user count
      const { count: userCount } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Return mock count for session count since it is stored in GCS
      const stored = JSON.parse(localStorage.getItem('glintspark_interviews') || '[]');
      const localSessionCount = stored.length;

      return {
        users: (userCount || 0) + 45200, // mock offset + real users
        sessions: localSessionCount + 1240,
        accuracy: 99.9,
        efficiency: 40
      };
    } catch {
      return { users: 45230, sessions: 1240, accuracy: 99.9, efficiency: 40 };
    }
  }
}

export const supabaseDB = new SupabaseService();
export const supabase = supabaseDB.supabase;
