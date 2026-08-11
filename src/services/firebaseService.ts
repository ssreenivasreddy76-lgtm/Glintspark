import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, writeBatch, limit, startAfter, orderBy } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import type { Challenge, Submission, InterviewSession } from '../types';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if configured
const isConfigured = !!firebaseConfig.apiKey;

let app;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export const firebaseAuth = auth;

export class FirebaseService {
  // --- Challenges API ---
  async getChallenges(): Promise<Challenge[]> {
    if (!db) return [];
    try {
      const q = collection(db, 'challenges');
      const querySnapshot = await getDocs(q);
      const list: Challenge[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Challenge);
      });
      return list;
    } catch (err) {
      console.error("Error fetching challenges from Firestore:", err);
      return [];
    }
  }

  async addChallenge(challenge: Challenge): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'challenges', challenge.id), challenge);
    } catch (err) {
      console.error("Error adding challenge to Firestore:", err);
      throw err;
    }
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'challenges', id), updates);
    } catch (err) {
      console.error("Error updating challenge in Firestore:", err);
      throw err;
    }
  }

  async deleteChallenge(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'challenges', id));
    } catch (err) {
      console.error("Error deleting challenge in Firestore:", err);
      throw err;
    }
  }

  // --- Submissions API ---
  async saveSubmission(submission: Submission): Promise<void> {
    if (!db) return;
    try {
      const submissionId = `sub-${Date.now()}`;

      // Fallback: If Storage fails (e.g. billing blocker), store the code payload directly in Firestore!
      let gcsUrl = '';
      if (storage) {
        try {
          const codeBlob = new Blob([submission.code], { type: 'text/plain' });
          const storageRef = ref(storage, `submissions/${submissionId}.${submission.language}`);
          const snapshot = await uploadBytes(storageRef, codeBlob);
          gcsUrl = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.warn("Storage upload failed, falling back to storing code inside Firestore directly:", storageErr);
        }
      }

      await setDoc(doc(db, 'solved_challenges', submissionId), {
        submissionId,
        userId: submission.userId,
        challengeId: submission.challengeId,
        language: submission.language,
        status: submission.status,
        runtimeMs: submission.runtimeMs,
        memoryKb: submission.memoryKb,
        code: gcsUrl ? '' : submission.code, // Firestore fallback
        gcsUrl,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving submission:", err);
      throw err;
    }
  }

  // --- Fetch Solved Submissions for a User ---
  async getUserSubmissions(userId: string): Promise<Submission[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'solved_challenges'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      console.error("Error fetching user submissions:", err);
      return [];
    }
  }

  // --- Fetch Solved Submissions for a Challenge ---
  async getChallengeSubmissions(challengeId: string): Promise<Submission[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'solved_challenges'), where('challengeId', '==', challengeId));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      console.error("Error fetching challenge submissions:", err);
      return [];
    }
  }

  // --- Fetch All Submissions (with Pagination) ---
  async getAllSubmissions(limitNum: number = 50, startAfterDoc: any = null): Promise<{ submissions: Submission[], lastDoc: any }> {
    if (!db) return { submissions: [], lastDoc: null };
    try {
      let q = query(collection(db, 'solved_challenges'), orderBy('createdAt', 'desc'), limit(limitNum));
      if (startAfterDoc) {
        q = query(collection(db, 'solved_challenges'), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitNum));
      }
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      let lastVisible = null;
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
        lastVisible = docSnap;
      });
      return { submissions: list, lastDoc: lastVisible };
    } catch (err) {
      console.error("Error fetching all submissions:", err);
      return { submissions: [], lastDoc: null };
    }
  }

  // --- Fetch Aggregated Dashboard Stats ---
  async getGlobalStats(): Promise<any> {
    if (!db) return null;
    try {
      const docRef = doc(db, 'global_stats', 'dashboard');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err) {
      console.error("Error fetching global stats:", err);
      return null;
    }
  }

  // --- Count All Submissions ---
  async getAllSubmissionsCount(): Promise<number> {
    if (!db) return 0;
    try {
      const q = collection(db, 'solved_challenges');
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (err) {
      console.error("Error counting all submissions:", err);
      return 0;
    }
  }

  // --- Save Interview Session ---
  async saveInterview(session: InterviewSession): Promise<void> {
    if (!db) return;
    try {
      const sessionId = `session-${Date.now()}`;

      let gcsTranscriptUrl = '';
      if (storage) {
        try {
          const transcriptBlob = new Blob([JSON.stringify(session.messages)], { type: 'application/json' });
          const storageRef = ref(storage, `transcripts/${sessionId}.json`);
          const snapshot = await uploadBytes(storageRef, transcriptBlob);
          gcsTranscriptUrl = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.warn("Storage transcript upload failed, falling back to storing dialogue inside Firestore directly:", storageErr);
        }
      }

      await setDoc(doc(db, 'interview_sessions', sessionId), {
        sessionId,
        userId: session.userId,
        topic: session.topic,
        feedback: session.feedback,
        score: session.score,
        messages: gcsTranscriptUrl ? [] : session.messages,
        gcsTranscriptUrl,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving interview session:", err);
      throw err;
    }
  }

  // --- Fetch Interview Sessions for a User ---
  async getUserInterviews(userId: string): Promise<InterviewSession[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'interview_sessions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      console.error("Error fetching user interviews:", err);
      return [];
    }
  }
  // --- Mock Interview Templates API ---
  async getMockTemplates(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = collection(db, 'mock_templates');
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.error("Error fetching mock templates from Firestore:", err);
      return [];
    }
  }

  async saveMockTemplate(template: any): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'mock_templates', template.id), template);
    } catch (err) {
      console.error("Error saving mock template in Firestore:", err);
      throw err;
    }
  }

  async deleteMockTemplate(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'mock_templates', id));
    } catch (err) {
      console.error("Error deleting mock template in Firestore:", err);
      throw err;
    }
  }

  // --- Firestore REST Converters ---
  private _toFirestoreREST(obj: any): any {
    if (obj === null || obj === undefined) return { nullValue: null };
    if (typeof obj === 'boolean') return { booleanValue: obj };
    if (typeof obj === 'number') return { doubleValue: obj };
    if (typeof obj === 'string') return { stringValue: obj };
    if (Array.isArray(obj)) return { arrayValue: { values: obj.map(v => this._toFirestoreREST(v)) } };
    if (typeof obj === 'object') {
      const fields: any = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) fields[k] = this._toFirestoreREST(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(obj) };
  }

  private _fromFirestoreREST(obj: any): any {
    if (!obj) return null;
    if ('nullValue' in obj) return null;
    if ('booleanValue' in obj) return obj.booleanValue;
    if ('integerValue' in obj) return Number(obj.integerValue);
    if ('doubleValue' in obj) return Number(obj.doubleValue);
    if ('stringValue' in obj) return obj.stringValue;
    if ('arrayValue' in obj) return (obj.arrayValue.values || []).map((v: any) => this._fromFirestoreREST(v));
    if ('mapValue' in obj) {
      const result: any = {};
      const fields = obj.mapValue.fields || {};
      for (const [k, v] of Object.entries(fields)) {
        result[k] = this._fromFirestoreREST(v);
      }
      return result;
    }
    return null;
  }

  // --- Curriculum API ---
  async getCurriculum(trackId: string): Promise<any[]> {
    try {
      const projectId = firebaseConfig.projectId;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks/${trackId}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error(`REST API error: ${res.status}`);
      }
      const data = await res.json();
      const parsed = this._fromFirestoreREST({ mapValue: { fields: data.fields } });
      return parsed.modules || [];
    } catch (err) {
      console.error("Error fetching curriculum via REST:", err);
      return [];
    }
  }

  async getAllCurricula(): Promise<Record<string, any[]>> {
    try {
      const projectId = firebaseConfig.projectId;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`REST API error: ${res.status}`);
      const data = await res.json();
      const curriculaMap: Record<string, any[]> = {};
      
      if (data.documents) {
        data.documents.forEach((docSnap: any) => {
          const parsed = this._fromFirestoreREST({ mapValue: { fields: docSnap.fields } });
          const id = docSnap.name.split('/').pop();
          if (id) curriculaMap[id] = parsed.modules || [];
        });
      }
      return curriculaMap;
    } catch (err) {
      console.error("Error fetching all curricula via REST:", err);
      return {};
    }
  }

  async saveCurriculum(trackId: string, modules: any[]): Promise<void> {
    try {
      const projectId = firebaseConfig.projectId;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/curriculum_tracks/${trackId}`;
      
      const payload = {
        fields: {
          modules: this._toFirestoreREST(modules),
          updatedAt: this._toFirestoreREST(new Date().toISOString())
        }
      };

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(`REST API error: ${res.status}`);
    } catch (err) {
      console.error("Error saving curriculum via REST:", err);
      throw err;
    }
  }

  // --- Quizzes API ---
  async getQuizzes(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = collection(db, 'quizzes');
      const querySnapshot = await getDocs(q);
      const quizzes: any[] = [];
      querySnapshot.forEach((docSnap) => {
        quizzes.push(docSnap.data());
      });
      return quizzes;
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      return [];
    }
  }

  async saveQuizzes(quizzes: any[]): Promise<void> {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      quizzes.forEach(quiz => {
        const docRef = doc(db, 'quizzes', quiz.id);
        batch.set(docRef, quiz);
      });
      await batch.commit();
    } catch (err) {
      console.error("Error saving quizzes:", err);
      throw err;
    }
  }

  async getQuizQuestions(): Promise<Record<string, any[]>> {
    if (!db) return {};
    try {
      const q = collection(db, 'quiz_questions');
      const querySnapshot = await getDocs(q);
      const questionsMap: Record<string, any[]> = {};
      querySnapshot.forEach((docSnap) => {
        questionsMap[docSnap.id] = docSnap.data().questions || [];
      });
      return questionsMap;
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
      return {};
    }
  }

  async saveQuizQuestions(questionsMap: Record<string, any[]>): Promise<void> {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      Object.keys(questionsMap).forEach(quizId => {
        const docRef = doc(db, 'quiz_questions', quizId);
        batch.set(docRef, { questions: questionsMap[quizId] });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error saving quiz questions:", err);
      throw err;
    }
  }

  // --- Mock Interviews API ---
  async getInterviewBank(): Promise<any[]> {
    if (!db) return [];
    try {
      const docRef = doc(db, 'interview_banks', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().questions || [];
      }
      return [];
    } catch (err) {
      console.error("Error fetching interview bank:", err);
      return [];
    }
  }

  // --- Contests API ---
  async getContests(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = collection(db, 'contests');
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.error("Error fetching contests:", err);
      return [];
    }
  }

  async saveContest(contest: any): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'contests', contest.id.toString()), contest);
    } catch (err) {
      console.error("Error saving contest:", err);
      throw err;
    }
  }

  async updateContest(id: string, updates: any): Promise<void> {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'contests', id), updates);
    } catch (err) {
      console.error("Error updating contest:", err);
      throw err;
    }
  }

  async deleteContest(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'contests', id));
    } catch (err) {
      console.error("Error deleting contest:", err);
      throw err;
    }
  }

  // --- Company Permissions API ---
  async getCompanyPermissions(): Promise<any> {
    if (!db) return { permissions: [], requests: [] };
    try {
      const docRef = doc(db, 'company_data', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { permissions: [], requests: [] };
    } catch (err) {
      console.error("Error fetching company permissions:", err);
      return { permissions: [], requests: [] };
    }
  }

  async saveCompanyPermissions(data: any): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'company_data', 'global'), data, { merge: true });
    } catch (err) {
      console.error("Error saving company permissions:", err);
      throw err;
    }
  }

  // --- User Progress API (Bookmarks, Solved, etc) ---
  async getUserProgress(userId: string): Promise<any> {
    if (!db) return { bookmarks: [], solved: [] };
    try {
      const docRef = doc(db, 'user_progress', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { bookmarks: [], solved: [] };
    } catch (err) {
      console.error("Error fetching user progress:", err);
      return { bookmarks: [], solved: [] };
    }
  }

  async updateUserProgress(userId: string, data: any): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'user_progress', userId), data, { merge: true });
    } catch (err) {
      console.error("Error updating user progress:", err);
      throw err;
    }
  }

  // --- Users API (for mock_users_data fallback) ---
  async getUsersData(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = collection(db, 'users');
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  }

  async saveInterviewBank(questions: any[]): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'interview_banks', 'global'), {
        questions,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving interview bank:", err);
      throw err;
    }
  }
}

export const firebaseDB = new FirebaseService();
