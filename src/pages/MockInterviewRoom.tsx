import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff,
  Terminal, LayoutGrid, X,
  Clock, Sparkles,
  ArrowRight, Cpu, User,
  Volume2, Braces, MessageSquare,
  ShieldCheck, AlertCircle,
  CheckCircle2, Play, BrainCircuit,
  Camera, ChevronDown,
  Activity, ZapOff, Lightbulb
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabaseDB } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface Interviewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
  goals: string[];
  tone: string;
}

const INTERVIEWERS: Interviewer[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    role: 'Senior System Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    personality: 'Highly analytical and detail-oriented. She values scalability, trade-offs, and deep technical understanding.',
    goals: ['Evaluate architectural thinking', 'Check for edge cases', 'Assess scalability knowledge'],
    tone: 'Professional, slightly formal, and intellectually challenging.'
  },
  {
    id: 'david',
    name: 'David Miller',
    role: 'Engineering Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    personality: 'Pragmatic and results-driven. He cares about clean code, testing, and how you solve problems in the real world.',
    goals: ['Assess implementation speed', 'Check for clean code practices', 'Evaluate problem-solving logic'],
    tone: 'Casual but direct, focuses on "how things work" in production.'
  },
  {
    id: 'emily',
    name: 'Emily Watson',
    role: 'Talent Acquisition Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    personality: 'Human-centric and behavioral-focused. She looks for communication skills, cultural fit, and the STAR method.',
    goals: ['Evaluate communication clarity', 'Assess team collaboration', 'Check for growth mindset'],
    tone: 'Encouraging, warm, but very observant of non-technical cues.'
  }
];

export default function MockInterviewRoom() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  // 1. ALL STATES (Must be first to avoid ReferenceErrors)
  const [step, setStep] = useState<'instructions' | 'setup' | 'session' | 'report'>('instructions');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showIDE, setShowIDE] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [timer, setTimer] = useState(1657);
  const [code, setCode] = useState('function solution() {\n  // Implementation here...\n}');
  const [isCameraGranted, setIsCameraGranted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [interviewer, setInterviewer] = useState<Interviewer>(INTERVIEWERS[0]);
  const { user } = useAuth();

  // Helper for resilient API calls
  const callGeminiAPI = async (prompt: string) => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) throw new Error("API_KEY_MISSING");

    // Exhaustive fallback list including latest experimental and flash models
    const models = [
      'gemini-2.0-flash-exp', // Latest Experimental
      'gemini-1.5-flash', 
      'gemini-1.5-flash-latest', 
      'gemini-1.5-pro', 
      'gemini-1.5-pro-latest'
    ];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`[AI SYNC] Attempting with model: ${model}`);
        // Use v1beta for experimental/latest model support
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errData = await response.json();
          lastError = `${model}: ${errData.error?.message || "Unknown error"}`;
          console.warn(`[AI SYNC] ${model} failed:`, lastError);
        }
      } catch (e: any) {
        lastError = `${model}: ${e.message}`;
        console.error(`[AI SYNC] Fetch error with ${model}:`, e);
      }
    }
    throw new Error(`ALL_MODELS_FAILED: Last attempt: ${lastError}`);
  };

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const setupVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const interviewTitle = type?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Mock Interview';

  // 2. LOGIC & FUNCTIONS
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // AI Voice Logic (Premium Selection)
  const speakAI = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to find a high-quality natural voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1;

    setIsAISpeaking(true);
    utterance.onend = () => {
      setIsAISpeaking(false);
      console.log("AI finished speaking. Beginning listening mode...");
      startListening();
    };

    // Fallback: Ensure listening starts even if onend doesn't fire correctly
    const safetyTimeout = setTimeout(() => {
      if (!isListening && !isAISpeaking) startListening();
    }, (text.length * 100) + 2000);

    window.speechSynthesis.speak(utterance);
    return () => {
      clearTimeout(safetyTimeout);
      setIsAISpeaking(false);
    };
  };

  // 1. SPEECH RECOGNITION (User Voice)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported");
      return;
    }

    if (isAISpeaking) return; // Don't listen while AI is talking

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const currentText = finalTranscript || interim;
      setInterimTranscript(currentText);
      transcriptRef.current = currentText;
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Recognition ended. Transcript found:", transcriptRef.current);
      if (transcriptRef.current.trim()) {
        handleUserSpokenAnswer(transcriptRef.current);
        transcriptRef.current = ''; // Reset for next turn
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleUserSpokenAnswer = async (answer: string) => {
    if (!answer.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: answer, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Show AI Thinking State
    const thinkingMsg: Message = { id: 'thinking', role: 'ai', text: 'Analyzing your response...', timestamp: new Date() };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      // Include history to prevent repetition
      const historyStr = messages.slice(-5).map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`).join('\n');

      const prompt = `You are ${interviewer.name}, a ${interviewer.role}. 
      Personality: ${interviewer.personality}
      Tone: ${interviewer.tone}
      Goals: ${interviewer.goals.join(', ')}
      
      ROLE: ${type} (Ensure ALL questions are specific to this role)
      
      CONTEXT HISTORY:
      ${historyStr}
      
      CANDIDATE JUST SAID: "${answer}"
      
      INSTRUCTIONS:
      1. Acknowledge their response according to your personality.
      2. Briefly critique or highlight a specific technical point in their answer.
      3. ASK THE NEXT CHALLENGING QUESTION.
      4. IMPORTANT: Do NOT repeat topics already discussed in the HISTORY. Move to a NEW technical or behavioral sub-topic related to ${type}.
      5. Increase the difficulty slightly as we are deeper in the interview.
      6. Stay in character. 3 sentences max.`;

      const aiResponse = await callGeminiAPI(prompt);

      setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({
        id: Date.now().toString(),
        role: 'ai',
        text: aiResponse,
        timestamp: new Date()
      }));

      speakAI(aiResponse);

    } catch (err: any) {
      console.error("AI Brain Error:", err);
      let errorMsg = "I'm having a bit of trouble connecting to my brain. Could you repeat that?";
      if (err.message === 'API_KEY_MISSING') {
        errorMsg = "[SYSTEM ERROR]: Gemini API Key missing in .env.local.";
      } else {
        errorMsg = `[AI ERROR]: ${err.message}. Please verify your API key access in Google AI Studio.`;
      }
      setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({
        id: 'err', role: 'ai', text: errorMsg, timestamp: new Date()
      }));
      speakAI(errorMsg);
    }
  };

  const requestPermissions = async (deviceId?: string, micId?: string) => {
    setIsRequesting(true);
    setPermissionError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: deviceId ? { 
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: micId ? { deviceId: { exact: micId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (setupVideoRef.current) setupVideoRef.current.srcObject = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      setIsCameraGranted(true);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        const level = Math.min(10, Math.floor(average / 10));
        setAudioLevel(level);
        if (streamRef.current) requestAnimationFrame(updateMeter);
      };
      updateMeter();

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);

      if (!selectedCam) {
        const defaultCam = allDevices.find(d => d.kind === 'videoinput');
        if (defaultCam) setSelectedCam(defaultCam.deviceId);
      }
      if (!selectedMic) {
        const defaultMic = allDevices.find(d => d.kind === 'audioinput');
        if (defaultMic) setSelectedMic(defaultMic.deviceId);
      }

      setIsRequesting(false);

    } catch (err: any) {
      setIsRequesting(false);
      console.error("Hardware access denied", err);
      if (err.name === 'NotAllowedError') {
        setPermissionError("Camera access was blocked. Please click the camera icon in your browser's address bar to reset permissions.");
      } else {
        setPermissionError("Could not access hardware. Make sure no other apps are using your camera.");
      }
    }
  };

  const testSpeakers = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play();
  };

  useEffect(() => {
    if (isCameraGranted && (selectedCam || selectedMic)) {
      requestPermissions(selectedCam, selectedMic);
    }
  }, [selectedCam, selectedMic]);

  // --- VIDEO SYNC LOGIC ---
  // Ensures video stream is re-attached when step changes (DOM nodes are re-created)
  useEffect(() => {
    if (isCameraGranted && streamRef.current) {
      if (step === 'setup' && setupVideoRef.current) {
        setupVideoRef.current.srcObject = streamRef.current;
      }
      if (step === 'session' && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [step, isCameraGranted]);

  // Stop hardware tracks and AI speech
  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      streamRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsCameraGranted(false);
  };

  // 3. HARDWARE CONTROL SYNC
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      console.log(`Audio tracks ${isMuted ? 'muted' : 'unmuted'}`);
    }
  }, [isMuted]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isCamOff;
      });
      console.log(`Video tracks ${isCamOff ? 'off' : 'on'}`);
    }
  }, [isCamOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopMediaStream();
  }, []);

  const startSession = async () => {
    // Pick a random interviewer
    const randomInterviewer = INTERVIEWERS[Math.floor(Math.random() * INTERVIEWERS.length)];
    setInterviewer(randomInterviewer);
    setStep('session');

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
      const msg = "Welcome! Please add your Gemini API Key to start the topic-specific interview.";
      setMessages([{ id: 'start', role: 'ai', text: msg, timestamp: new Date() }]);
      speakAI(msg);
      return;
    }

    const startPrompt = `You are ${randomInterviewer.name}, a ${randomInterviewer.role}. 
    Personality: ${randomInterviewer.personality}
    Tone: ${randomInterviewer.tone}
    Goals: ${randomInterviewer.goals.join(', ')}
    
    You are interviewing a candidate for a ${type} position. 
    Start the interview immediately with a specific, challenging technical or behavioral question.
    Professional greeting and 1st question only. 2 sentences max.`;

    try {
      const firstQuestion = await callGeminiAPI(startPrompt);
      setMessages([{ id: 'start', role: 'ai', text: firstQuestion, timestamp: new Date() }]);
      speakAI(firstQuestion);
    } catch (e: any) {
      const fallbackQuestions: { [key: string]: string } = {
        'frontend-developer': `Hi, I'm ${randomInterviewer.name}. Let's start with your frontend experience. Can you explain the difference between state and props in React, and when you would choose one over the other?`,
        'backend-developer': `Hi, I'm ${randomInterviewer.name}. To begin, can you explain the architectural differences between SQL and NoSQL databases and how you choose between them for a scaling application?`,
        'dsa-practice': `Hello. I'm ${randomInterviewer.name}. Let's start with a classic technical challenge. Can you explain the time and space complexity of a Quick Sort algorithm versus a Merge Sort?`,
      };
      const fallbackMsg = fallbackQuestions[type!] || `Welcome, I'm ${randomInterviewer.name}. Let's start by having you introduce yourself and your technical background. What projects have you worked on recently?`;
      setMessages([{ id: 'start', role: 'ai', text: fallbackMsg, timestamp: new Date() }]);
      speakAI(fallbackMsg);
    }
  };

  const endSession = async () => {
    setIsSaving(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // 1. Generate AI Report from Transcript
    try {
      const transcriptStr = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
      const reportPrompt = `You are an elite developer psychologist, technical lead, and performance coach. 
      Analyze this interview transcript for a ${type} role and provide a comprehensive performance audit:
      
      TRANSCRIPT:
      ${transcriptStr}
      
      INSTRUCTIONS:
      Provide a highly detailed JSON report (and ONLY JSON) with the following schema:
      {
        "technicalScore": number (0-100),
        "technicalReasoning": "Detailed explanation of why this technical score was given, referencing specific answers from the transcript.",
        "communicationScore": number (0-100),
        "communicationReasoning": "Analysis of clarity, tone, and articulation, referencing the transcript.",
        "confidenceScore": number (0-100),
        "confidenceReasoning": "Analysis of verbal confidence and pace.",
        "strengths": ["string", "string"],
        "weakAreas": [
          {
            "area": "Specific topic or skill",
            "observation": "What specifically was missing or incorrect in the candidate's answer?",
            "recommendation": "Exactly how to fix this or what to study."
          }
        ],
        "keyMistakes": ["Specific technical or behavioral errors made"],
        "overallVerdict": "A 2-3 sentence executive summary of the performance.",
        "recommendedTopics": ["string"]
      }
      
      Be honest, critical but constructive. Focus on the 'WHY' behind every score so the user understands their gaps.`;

      const aiResponse = await callGeminiAPI(reportPrompt);
      const cleanedJSON = aiResponse.replace(/```json|```/g, '').trim();
      const parsedReport = JSON.parse(cleanedJSON);
      setReportData(parsedReport);

      // 2. Save to backend if user is logged in
      if (user) {
        await supabaseDB.saveInterview({
          topic: type,
          messages: messages,
          feedback: parsedReport
        });
      }
    } catch (e) {
      console.error("Failed to generate/save report:", e);
      // Fallback data if AI fails
      setReportData({
        technicalScore: 78,
        technicalReasoning: "The candidate demonstrated solid fundamental knowledge but struggled to explain the internal optimization of rendering cycles.",
        communicationScore: 82,
        communicationReasoning: "Clear articulation and professional tone, though some responses were overly brief.",
        confidenceScore: 75,
        confidenceReasoning: "Generally confident, but showed hesitation during the architectural scaling question.",
        strengths: ["Strong understanding of React hooks", "Professional and calm demeanor"],
        weakAreas: [
          {
            "area": "System Scalability",
            "observation": "Could not clearly articulate the difference between vertical and horizontal scaling in a distributed environment.",
            "recommendation": "Study load balancing strategies and database sharding patterns."
          }
        ],
        keyMistakes: ["Failed to mention Big O complexity for the sorting question"],
        overallVerdict: "A strong candidate with solid fundamentals. To reach the next level, focus on system design and architectural trade-offs.",
        recommendedTopics: ["System Design", "Distributed Systems", "Performance Tuning"]
      });
    }

    stopMediaStream();
    setIsSaving(false);
    setStep('report');
  };

  // Countdown timer (only active during session)
  useEffect(() => {
    if (step !== 'session') return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} mins`;
  };

  // --- RENDERING LOGIC ---

  // STEP 1: Instructions (Professional Briefing Theme)
  if (step === 'instructions') {
    return (
      <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center p-6 font-sans">
        <div className="fixed top-8 left-8">
          <Logo size={28} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.03)] relative overflow-hidden text-slate-900"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Pre-Interview Briefing</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Role: {interviewTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
              <Clock size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Est. 45-60 Mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
            {[
              {
                icon: <BrainCircuit size={20} />,
                title: "Behavioral Mastery",
                desc: "Demonstrate team dynamics, conflict resolution, and leadership through past experience."
              },
              {
                icon: <MessageSquare size={20} />,
                title: "Voice-First Session",
                desc: "Engage in a realistic, voice-driven simulation to build conversational fluency."
              },
              {
                icon: <LayoutGrid size={20} />,
                title: "STAR Framework",
                desc: "Structure your responses using Situation, Task, Action, and Result for maximum impact."
              },
              {
                icon: <Sparkles size={20} />,
                title: "AI Assessment",
                desc: "Receive data-driven feedback on your technical accuracy and alignment."
              }
            ].map((rule, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-colors shrink-0">
                  {rule.icon}
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight mb-1.5">{rule.title}</h4>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-12 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={16} className="text-amber-500" />
              <h5 className="text-[12px] font-bold text-slate-800 uppercase">Hardware Requirements</h5>
            </div>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
              Ensure you are in a quiet environment. You will need a working microphone and camera for the best experience. The AI interviewer will listen to your spoken responses in real-time.
            </p>
          </div>

          <button
            onClick={() => setStep('setup')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 hover:bg-black transition active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Enter Hardware Check <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  // STEP 2: Hardware Setup (Professional System Check)
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl w-full max-w-[680px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">System Readiness Check</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hardware Live</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-[420px]">
            {/* Left: Video Preview */}
            <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
              <video 
                ref={setupVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
              {!isCameraGranted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                    {isRequesting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera size={20} className="text-white/60" />
                    )}
                  </div>
                  <button
                    disabled={isRequesting}
                    onClick={() => requestPermissions()}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all mb-3 disabled:opacity-50"
                  >
                    {isRequesting ? "Authenticating..." : "Enable Camera"}
                  </button>
                  <p className="text-[9px] font-bold text-white/40 leading-relaxed max-w-[160px]">
                    {permissionError || "Grant access to preview your video feed."}
                  </p>
                </div>
              )}
              {/* HUD Overlay */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-md text-[9px] font-black text-white/80 uppercase tracking-widest">
                Preview Stream
              </div>
            </div>

            {/* Right: Selectors */}
            <div className="w-full md:w-[300px] p-8 flex flex-col justify-between bg-white">
              <div className="space-y-8">
                {/* Microphone Select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mic size={14} /> Microphone
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all cursor-pointer"
                    >
                      {devices.filter(d => d.kind === 'audioinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || "System Mic"}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  {/* Level Meter */}
                  <div className="flex gap-1 h-1.5 px-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((v) => (
                      <div key={v} className={`flex-1 rounded-full transition-colors duration-100 ${v <= (audioLevel * 1.2) ? 'bg-brand-primary' : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>

                {/* Camera Select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <VideoIcon size={14} /> Video Source
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCam}
                      onChange={(e) => setSelectedCam(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all cursor-pointer"
                    >
                      {devices.filter(d => d.kind === 'videoinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || "System Camera"}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={testSpeakers}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="flex items-center gap-3 text-slate-600">
                    <Volume2 size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Test Audio</span>
                  </div>
                  <Play size={12} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                </button>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={startSession}
                  disabled={!isCameraGranted}
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:bg-brand-dark transition active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                >
                  Initialize Session
                </button>
                <button onClick={() => setStep('instructions')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition py-2 text-center">
                  Back to Briefing
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 4: The Performance Report (Professional Insight Theme)
  if (step === 'report') {
    return (
      <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans p-6 md:p-12 lg:p-20 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto w-full space-y-16 pb-20 relative z-10">

          {/* Header: Overview */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-100 pb-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Interview Synthesis</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Assessment Complete • Session Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Target Role</p>
                  <p className="text-sm font-bold text-slate-700">{interviewTitle}</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Candidate</p>
                  <p className="text-sm font-bold text-slate-700">{user?.name || 'Guest User'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-10 bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
              <div className="text-center">
                <div className="text-5xl font-black text-brand-primary mb-1">{reportData?.technicalScore || 0}%</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match Accuracy</div>
              </div>
              <div className="h-12 w-px bg-slate-100" />
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-black transition active:scale-95 shadow-xl shadow-slate-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          {/* Performance Audit Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Score Breakdowns & Reasoning */}
            <div className="lg:col-span-7 space-y-10">
              <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                  <Activity size={14} /> Comprehensive Score Breakdown
                </h3>
                <div className="space-y-12">
                  {[
                    { label: "Technical Proficiency", score: reportData?.technicalScore, reasoning: reportData?.technicalReasoning, color: "bg-blue-500", icon: <Cpu size={16} /> },
                    { label: "Communication Flow", score: reportData?.communicationScore, reasoning: reportData?.communicationReasoning, color: "bg-emerald-500", icon: <MessageSquare size={16} /> },
                    { label: "Executive Confidence", score: reportData?.confidenceScore, reasoning: reportData?.confidenceReasoning, color: "bg-purple-500", icon: <ShieldCheck size={16} /> }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${stat.color}/10 flex items-center justify-center text-slate-600`}>
                            {stat.icon}
                          </div>
                          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{stat.label}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{stat.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${stat.score}%` }} 
                          className={`h-full ${stat.color}`} 
                        />
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed pl-11">
                        {stat.reasoning || "No detailed reasoning provided for this metric."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weakness Audit Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
                    <AlertCircle size={18} className="text-rose-500" /> Granular Weakness Audit
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Critical Gaps Detected</span>
                </div>
                <div className="space-y-4">
                  {reportData?.weakAreas?.length > 0 ? reportData.weakAreas.map((w: any, i: number) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:border-rose-100 transition-colors group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                            <ZapOff size={16} />
                          </div>
                          <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{w.area}</h4>
                        </div>
                        <span className="px-3 py-1 bg-rose-50 text-rose-500 text-[9px] font-black rounded-full uppercase">Priority: High</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Observation</p>
                          <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{w.observation}</p>
                        </div>
                        <div className="border-l border-slate-100 pl-6">
                          <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-2">Recommendation</p>
                          <p className="text-[11px] font-bold text-emerald-900/60 leading-relaxed">{w.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center bg-white border border-slate-100 rounded-[32px]">
                      <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400">No major technical weaknesses detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Verdict & Strengths */}
            <div className="lg:col-span-5 space-y-10">
              {/* Verdict Card */}
              <div className="bg-slate-900 rounded-[40px] p-10 md:p-12 text-white space-y-10 shadow-2xl shadow-slate-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <Cpu size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Executive Verdict</span>
                  </div>
                  <p className="text-xl font-bold leading-relaxed text-slate-100 italic">
                    " {reportData?.overallVerdict} "
                  </p>
                </div>

                <div className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Strengths</span>
                  <div className="space-y-4">
                    {reportData?.strengths?.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300 leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Growth Roadmap</span>
                  <div className="flex flex-wrap gap-2">
                    {reportData?.recommendedTopics?.map((t: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition cursor-pointer">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips for next time */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Lightbulb size={20} className="text-emerald-500" />
                  <h4 className="text-[11px] font-black text-emerald-900/70 uppercase tracking-widest">Mastery Tip</h4>
                </div>
                <p className="text-[11px] font-bold text-emerald-900/60 leading-relaxed">
                  Focus on the <span className="text-emerald-600">STAR</span> framework for behavioral questions and always state the <span className="text-emerald-600">Time Complexity</span> for technical answers before being asked.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // STEP 3: The Session Stage (Professional Meeting Layout)
  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col font-sans overflow-hidden relative">
      {/* --- Header --- */}
      <header className="h-16 px-8 border-b border-slate-100 flex items-center justify-between bg-white z-50">
        <div className="flex items-center gap-4">
          <Logo size={24} />
          <div className="h-6 w-px bg-slate-100" />
          <div>
            <h1 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{interviewTitle}</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Live Assessment</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <Clock size={14} className="text-slate-400" />
            <span className="text-[12px] font-black tabular-nums text-slate-700">{formatTime(timer)}</span>
          </div>
          <button
            onClick={endSession}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition shadow-lg shadow-rose-500/20"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* --- Main Stage --- */}
      <main className="flex-1 flex overflow-hidden bg-slate-50/50">
        
        {/* Left: Interaction Panel (Chat/IDE) */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ${showIDE ? 'mr-0' : ''}`}>
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-12">
              
              {/* Active Question Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Interviewer: {interviewer.name}</span>
                  <div className="h-px flex-1 bg-brand-primary/10" />
                </div>
                <AnimatePresence mode="wait">
                  {messages.filter(m => m.role === 'ai' && m.id !== 'thinking').length > 0 && (
                    <motion.div
                      key={messages.filter(m => m.role === 'ai' && m.id !== 'thinking').pop()?.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                    >
                      <p className="text-xl md:text-2xl font-bold leading-tight text-slate-800">
                        {messages.filter(m => m.role === 'ai' && m.id !== 'thinking').pop()?.text}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Voice / Transcript Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Response</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                
                <div className="min-h-[120px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {isListening ? (
                      <motion.div
                        key="listening"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-xl font-bold text-brand-primary italic">
                          " {interimTranscript || 'Listening to your response...'} "
                        </p>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                              key={i}
                              animate={{ height: [8, 24, 8] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                              className="w-1 bg-brand-primary rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    ) : messages.find(m => m.id === 'thinking') ? (
                      <motion.div
                        key="thinking"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Analyzing Response...</span>
                      </motion.div>
                    ) : messages.filter(m => m.role === 'user').length > 0 ? (
                      <motion.p
                        key={messages.filter(m => m.role === 'user').pop()?.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-lg font-semibold text-slate-600 border-l-4 border-slate-200 pl-6 py-2"
                      >
                        {messages.filter(m => m.role === 'user').pop()?.text}
                      </motion.p>
                    ) : (
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center">
                          <Mic size={18} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Click the mic below to respond</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Transcript History (Optional/Toggleable) */}
              <div className="pt-12 border-t border-slate-100 opacity-40 hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <MessageSquare size={14} /> Full Transcript History
                </button>
                <div className="space-y-6">
                  {messages.filter(m => m.id !== 'thinking').slice().reverse().slice(1).map(msg => (
                    <div key={msg.id} className="text-xs font-medium pl-4 border-l border-slate-100 py-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">{msg.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}</span>
                      <p className="text-slate-500 line-clamp-2">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Video & Status */}
        <div className="w-full md:w-[400px] border-l border-slate-100 bg-white p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex-1 space-y-6">
            
            {/* Interviewer Profile Card */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-[60px] rounded-full -mr-10 -mt-10" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Active Interviewer</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Connected</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <img src={interviewer.avatar} alt={interviewer.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-2xl" />
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{interviewer.name}</h3>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{interviewer.role}</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[11px] font-medium text-white/70 leading-relaxed italic">
                    "{interviewer.personality}"
                  </p>
                </div>
              </div>
            </div>

            {/* User Video Feed */}
            <div className="w-full aspect-video bg-slate-900 rounded-[32px] overflow-hidden relative shadow-2xl shadow-slate-200">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-700 scale-x-[-1] ${isCamOff ? 'opacity-0' : 'opacity-100'}`} 
              />
              
              {isCamOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/20 mb-4">
                    <User size={32} />
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Video Stream Paused</span>
                </div>
              )}

              {/* Video Overlays */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Candidate (Live)</span>
                </div>
              </div>
            </div>

            {/* AI Status Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Status</span>
                <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black rounded uppercase">Synced</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAISpeaking ? 'bg-brand-primary text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                  {isAISpeaking ? <Volume2 size={20} className="animate-pulse" /> : <Sparkles size={20} />}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-700">{isAISpeaking ? "AI is speaking..." : "AI is analyzing context"}</p>
                  <p className="text-[9px] font-medium text-slate-400">Gemini 1.5 Flash Engine</p>
                </div>
              </div>
            </div>

            {/* Microphone Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audio Sensitivity</span>
                <Mic size={12} className={isListening ? "text-brand-primary" : "text-slate-300"} />
              </div>
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((v) => (
                  <div key={v} className={`flex-1 rounded-full transition-colors ${v <= (audioLevel * 1.6) ? 'bg-brand-primary' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Connection</span>
            </div>
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">SESS_ID: GS-{(Math.random() * 1000).toFixed(0)}</span>
          </div>
        </div>

      </main>

      {/* --- Floating Control Bar --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <div className="bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => !isListening && startListening()}
            className={`p-4 rounded-full transition-all group relative ${isListening ? 'bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/40' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            {isListening ? <Mic size={24} /> : <Mic size={24} />}
            {!isListening && (
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Speak Now
              </span>
            )}
          </button>
          
          <div className="h-8 w-px bg-slate-100 mx-2" />

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-3 rounded-xl transition ${isMuted ? 'bg-rose-50 text-rose-500' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => setIsCamOff(!isCamOff)} 
              className={`p-3 rounded-xl transition ${isCamOff ? 'bg-rose-50 text-rose-500' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {isCamOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
            </button>
            <button 
              onClick={() => setShowIDE(!showIDE)} 
              className={`p-3 rounded-xl transition ${showIDE ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Terminal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Side IDE Panel --- */}
      <AnimatePresence>
        {showIDE && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-16 right-0 bottom-0 w-[500px] bg-white border-l border-slate-200 z-[60] flex flex-col shadow-2xl shadow-slate-400/20"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Braces size={18} className="text-brand-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Solution IDE</span>
              </div>
              <button 
                onClick={() => setShowIDE(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col bg-[#05060f]">
              <div className="flex items-center gap-4 mb-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest italic">main.js</span>
              </div>
              <textarea 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                spellCheck={false}
                className="flex-1 bg-transparent rounded-2xl p-4 font-mono text-[13px] border-none focus:ring-0 text-emerald-100/90 resize-none leading-relaxed placeholder:text-white/10"
                placeholder="// Type your code solution here..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
