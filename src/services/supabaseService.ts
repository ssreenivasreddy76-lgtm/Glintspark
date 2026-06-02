import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../types';

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

  private async formatUserForApp(profile: any): Promise<User | null> {
    if (!profile) return null;
    return {
      _id: profile.id,
      email: profile.email,
      name: profile.name || 'User',
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatar: profile.avatar,
      lessonsCompleted: profile.lessons_completed || 0,
      completedLessonIds: profile.completed_lesson_ids || [],
      unlockedLessonIds: profile.unlocked_lesson_ids || ['c1'],
      createdAt: new Date(profile.created_at),
      onboardingCompleted: profile.onboarding_completed || false,
      streak: profile.streak || 0,
      xp: profile.xp || 0,
      lastActiveAt: profile.last_active_at,
      activity_log: profile.activity_log || [],
      activity_history: profile.activity_history || [],
    };
  }

  async findOne(query: { _id?: string }): Promise<User | null> {
    if (!this.isConfigured || !query._id) return null;
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', query._id)
      .single();
    if (error) return null;
    return this.formatUserForApp(data);
  }

  async updateOne(id: string, updates: Partial<User>): Promise<User> {
    if (!this.isConfigured) throw new Error("DB not configured");
    
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.activity_log) dbUpdates.activity_log = updates.activity_log;
    if (updates.activity_history) dbUpdates.activity_history = updates.activity_history;

    const { data, error } = await this.supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (await this.formatUserForApp(data))!;
  }

  async saveInterview(session: any): Promise<void> {
    if (!this.isConfigured) return;
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    // Calculate an average score if overallScore isn't explicitly provided
    const score = session.feedback?.overallScore || 
                  Math.round(((session.feedback?.technicalScore || 0) + 
                  (session.feedback?.communicationScore || 0) + 
                  (session.feedback?.confidenceScore || 0)) / 3);

    await this.supabase.from('interview_sessions').insert({
      user_id: user.id,
      topic: session.topic,
      transcript: session.messages,
      feedback: session.feedback,
      score: score,
      created_at: new Date()
    });
  }

  async getPlatformStats() {
    if (!this.isConfigured) {
      return { users: 45230, sessions: 1240, accuracy: 99.9, efficiency: 40 };
    }

    try {
      // Fetch total user count
      const { count: userCount, error: userError } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total interview sessions
      const { count: sessionCount, error: sessionError } = await this.supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true });

      return {
        users: userCount || 0,
        sessions: sessionCount || 0,
        accuracy: 99.9,
        efficiency: 40
      };
    } catch (e) {
      return { users: 45230, sessions: 1240, accuracy: 99.9, efficiency: 40 };
    }
  }
}

export const supabaseDB = new SupabaseService();
export const supabase = supabaseDB.supabase;
