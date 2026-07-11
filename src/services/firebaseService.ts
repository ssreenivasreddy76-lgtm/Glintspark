import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
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

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

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
}

export const firebaseDB = new FirebaseService();
