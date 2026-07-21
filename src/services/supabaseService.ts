import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, InterviewSession } from '../types';
import { firebaseDB } from './firebaseService';

class SupabaseService {
  public supabase: SupabaseClient;
  private isConfigured: boolean = false;
  private streakEnabled: boolean = true;
  private supabaseUrl: string;
  private apiUrl: string;

  constructor() {
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    this.supabaseUrl = envUrl;
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

  async upsertUser(user: Partial<User> & { _id: string }): Promise<void> {
    if (!this.isConfigured) return;
    try {
      // First, get existing user to preserve xp/streak if not provided
      const { data: existing } = await this.supabase.from('users').select('xp, streak').eq('id', user._id).maybeSingle();
      
      const payload: any = {
        id: user._id,
        email: user.email,
        created_at: new Date().toISOString()
      };
      
      if (user.name !== undefined) payload.name = user.name;
      if (user.firstName !== undefined || user.first_name !== undefined) payload.first_name = user.first_name || user.firstName;
      if (user.lastName !== undefined || user.last_name !== undefined) payload.last_name = user.last_name || user.lastName;
      if (user.avatar !== undefined) payload.avatar = user.avatar;
      if (user.country !== undefined) payload.country = user.country;
      
      payload.xp = user.xp !== undefined ? user.xp : (existing?.xp || 0);
      payload.streak = user.streak !== undefined ? user.streak : (existing?.streak || 0);
      
      if (user.onboardingCompleted !== undefined || user.onboarding_completed !== undefined) {
        payload.onboarding_completed = user.onboarding_completed || user.onboardingCompleted;
      }

      const { error } = await this.supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      console.error("Error upserting user:", err);
    }
  }

  async findOne(query: { _id?: string }): Promise<User | null> {
    if (!this.isConfigured || !query._id) return null;
    try {
      const { data, error } = await this.supabase.from('users').select('*').eq('id', query._id).maybeSingle();
      if (error || !data) return null;
      return this.formatUserForApp(data as Record<string, unknown>);
    } catch (err) {
      console.error("Error in findOne:", err);
      return null;
    }
  }

  async getUserRank(xp: number): Promise<number> {
    if (!this.isConfigured) return 1;
    try {
      const { count, error } = await this.supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gt('xp', xp);
        
      if (error) throw error;
      return (count || 0) + 1;
    } catch (err) {
      console.error("Error in getUserRank:", err);
      return 1; // Fallback to Rank 1 if it fails
    }
  }

  async getLeaderboard(limit: number = 50): Promise<User[]> {
    if (!this.isConfigured) return [];
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return Promise.all((data || []).map(async d => await this.formatUserForApp(d) as User));
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      return [];
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

    const { data, error } = await this.supabase.from('users').update(dbUpdates).eq('id', id).select().single();
    if (error) throw new Error(error.message || "Failed to update profile");
    return (await this.formatUserForApp(data as Record<string, unknown>))!;
  }

  // --- PRACTICE TRACKS API ---
  async getTracks(): Promise<unknown[]> {
    try {
      try {
        const res = await fetch(`${this.apiUrl}/api/tracks`);
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

    const res = await fetch(`${this.apiUrl}/api/tracks`, {
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

    const res = await fetch(`${this.apiUrl}/api/tracks?id=${id}`, {
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

    const res = await fetch(`${this.apiUrl}/api/tracks?id=${id}`, {
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
        const res = await fetch(`${this.apiUrl}/api/contests`);
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

    const res = await fetch(`${this.apiUrl}/api/contests`, {
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

    const res = await fetch(`${this.apiUrl}/api/contests?id=${id}`, {
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

    const res = await fetch(`${this.apiUrl}/api/contests?id=${id}`, {
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

  // --- SAVE CHALLENGE SUBMISSIONS ---
  async saveSubmission(submission: any): Promise<void> {
    if (!this.isConfigured) return;
    try {
      // 1. Check if already solved to prevent duplicate XP
      let alreadySolved = false;
      if (submission.status === 'PASS' && submission.pointsEarned > 0) {
        const { data: existing } = await this.supabase
          .from('solved_challenges')
          .select('id')
          .eq('user_id', submission.userId)
          .eq('challenge_id', submission.challengeId)
          .eq('status', 'PASS')
          .limit(1);
        alreadySolved = existing && existing.length > 0;
      }

      // 2. Insert submission
      const { error } = await this.supabase.from('solved_challenges').insert({
        submission_id: `sub-${Date.now()}`,
        user_id: submission.userId,
        challenge_id: submission.challengeId,
        language: submission.language,
        status: submission.status,
        code: submission.code,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error("Supabase insert submission error:", error);
        throw error;
      }
      
      // 3. Award XP if first time solved
      if (submission.status === 'PASS' && submission.pointsEarned > 0 && !alreadySolved) {
        const { data: userData } = await this.supabase
          .from('users')
          .select('xp')
          .eq('id', submission.userId)
          .single();
          
        const currentXp = userData?.xp || 0;
        await this.supabase.from('users').update({ xp: currentXp + submission.pointsEarned }).eq('id', submission.userId);
      }
    } catch (err) {
      console.error("Error saving submission to Supabase:", err);
    }
  }

  async getUserSubmissions(userId: string): Promise<any[]> {
    if (!this.isConfigured) return [];
    try {
      const { data, error } = await this.supabase
        .from('solved_challenges')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Supabase get submissions error:", error);
        return [];
      }
      return data.map((d: any) => ({
        challengeId: d.challenge_id,
        language: d.language,
        status: d.status
      }));
    } catch (err) {
      console.error("Error fetching submissions:", err);
      return [];
    }
  }

  async getGlobalChallengeStats(): Promise<Record<string, string>> {
    if (!this.isConfigured) return {};
    try {
      const { data, error } = await this.supabase
        .from('solved_challenges')
        .select('challenge_id, status');
      
      if (error) {
        console.error("Supabase get stats error:", error);
        return {};
      }

      const stats: Record<string, { total: number, passed: number }> = {};
      data.forEach((d: any) => {
        if (!stats[d.challenge_id]) {
          stats[d.challenge_id] = { total: 0, passed: 0 };
        }
        stats[d.challenge_id].total += 1;
        if (d.status === 'PASS') {
          stats[d.challenge_id].passed += 1;
        }
      });

      const result: Record<string, string> = {};
      for (const [id, counts] of Object.entries(stats)) {
        if (counts.total === 0) {
          result[id] = '0%';
        } else {
          result[id] = `${Math.round((counts.passed / counts.total) * 100)}%`;
        }
      }
      return result;
    } catch (err) {
      console.error("Error fetching challenge stats:", err);
      return {};
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
  async createProblem(data: any) {
    if (!this.isConfigured) {
      console.warn("Supabase not configured, cannot create problem.");
      return;
    }
    
    // 1. Insert into problems table
    const problemId = data.id || `prob-${Date.now()}`;
    const { error: probError } = await this.supabase
      .from('problems')
      .insert({
        id: problemId,
        title: data.title,
        difficulty: data.difficulty,
        category: data.category,
        description: data.description || '',
        input_format: data.inputFormat || '',
        output_format: data.outputFormat || '',
        constraints: data.constraints || '',
        is_practice: data.isPractice !== false
      });
      
    if (probError) {
      console.error("Error inserting problem:", probError);
      return;
    }

    // 2. Insert into problem_languages table for ALL selected tracks
    const tracksToInsert = Array.isArray(data.tracks) && data.tracks.length > 0 ? data.tracks : [data.track || 'javascript'];
    for (const track of tracksToInsert) {
      await this.supabase
        .from('problem_languages')
        .insert({
          problem_id: problemId,
          language_id: track,
          time_limit_seconds: data.timeLimit || 2.0,
          memory_limit_mb: data.memoryLimit || 256,
          score: data.points || 10
        });
    }

    // 3. Insert sample test cases
    if (data.sampleInput1 || data.sampleOutput1) {
      await this.supabase.from('sample_test_cases').insert({
        problem_id: problemId,
        input_data: data.sampleInput1 || '',
        output_data: data.sampleOutput1 || '',
        explanation: data.explanation1 || ''
      });
    }
    if (data.sampleInput2 || data.sampleOutput2) {
      await this.supabase.from('sample_test_cases').insert({
        problem_id: problemId,
        input_data: data.sampleInput2 || '',
        output_data: data.sampleOutput2 || '',
        explanation: data.explanation2 || ''
      });
    }

    // 4. Insert hidden test cases from dynamic list
    if (Array.isArray(data.hiddenTestCasesList)) {
      for (const tc of data.hiddenTestCasesList) {
        if (tc.input && tc.output) {
          await this.supabase.from('hidden_test_cases').insert({
             problem_id: problemId,
             input_data: tc.input,
             expected_output: tc.output,
             is_hidden: true
          });
        }
      }
    }
    
    return problemId;
  }

  async deleteProblem(id: string) {
    if (!this.isConfigured) return;
    const { error } = await this.supabase.from('problems').delete().eq('id', id);
    if (error) console.error("Error deleting problem:", error);
  }

  async getProblems() {
    if (!this.isConfigured) return [];
    
    const { data: problems, error } = await this.supabase
      .from('problems')
      .select(`
        *,
        problem_languages (
          language_id,
          time_limit_seconds,
          memory_limit_mb,
          score
        ),
        sample_test_cases (
          input_data,
          output_data,
          explanation
        )
      `);
      
    if (error) {
      console.error("Error fetching problems:", error);
      return [];
    }

    // Map the Supabase relational data back to our Frontend Challenge interface
    // We also filter out any corrupted challenges with insanely long IDs (e.g. accidentally pasting a SQL script into the title)
    return problems.filter((p: any) => p.id && p.id.length < 200).map((p: any) => {
      const langs = p.problem_languages || [];
      const firstLang = langs[0] || {};
      const samples = p.sample_test_cases || [];
      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        category: p.category,
        description: p.description,
        inputFormat: p.input_format,
        outputFormat: p.output_format,
        constraints: p.constraints,
        isPractice: p.is_practice,
        
        // Language specific (we map all languages to tracks array)
        tracks: langs.map((l: any) => l.language_id),
        track: firstLang.language_id || 'javascript', // legacy fallback
        timeLimit: firstLang.time_limit_seconds || 2.0,
        memoryLimit: firstLang.memory_limit_mb || 256,
        points: firstLang.score || 10,
        
        // Samples
        sampleInput1: samples[0]?.input_data || '',
        sampleOutput1: samples[0]?.output_data || '',
        explanation1: samples[0]?.explanation || '',
        sampleInput2: samples[1]?.input_data || '',
        sampleOutput2: samples[1]?.output_data || '',
        explanation2: samples[1]?.explanation || '',
      };
    });
  }
}

export const supabaseDB = new SupabaseService();
export const supabase = supabaseDB.supabase;
