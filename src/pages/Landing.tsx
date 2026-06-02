import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, Building2, Zap, BookOpen, Sparkles, TerminalSquare, Award, Globe, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
export default function Landing() {

  return (
    <div className="w-full flex flex-col items-center bg-white">
      {/* 
        ==============================
        HERO SECTION
        ==============================
      */}
      <div className="max-w-7xl w-full mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        {/* Top Banner Tag */}

        {/* Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]"
        >
          Accelerate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">software engineering</span> career
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium"
        >
          Join a world-class environment of interactive curriculum, real-time code execution, and personalized AI mentoring designed to get you interview-ready.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/challenges" className="px-10 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3 group">
            <Terminal size={20} className="group-hover:text-brand-primary transition-colors" />
            For Developers
          </Link>
          <Link to="/auth" className="px-10 py-4 rounded-full bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-900 font-bold transition-all flex items-center justify-center gap-3 group">
            <Building2 size={20} className="group-hover:text-brand-primary transition-colors" />
            For Companies
          </Link>
        </motion.div>

        {/* Empty space after CTA to let the grid below breathe */}
        <div className="h-10"></div>
      </div>


      {/* 
        ==============================
        ALL FEATURES GRID
        ==============================
      */}
      <div className="w-full bg-slate-50 border-t border-slate-200 py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col pt-10">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">The developer skills platform</h2>
            <p className="mt-6 text-lg text-slate-600">Built for developers to master technical skills, prepare for high-stakes interviews, and validate their expertise across our entire suite of features.</p>
          </div>

          <div className="space-y-32">
            
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TerminalSquare className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Practice Coding</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Join a community of developers practicing their logic and algorithmic skills. Use our blazing-fast compiler supporting multiple languages to solve hundreds of meticulously crafted challenges.</p>
                <Link to="/challenges" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center gap-2">Explore Challenges</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white transform transition-transform group-hover:scale-105" />
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop" className="z-10 rounded-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-purple-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Prepare for Interviews</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Follow structured curriculum tracks ranging from foundational Data Structures to advanced Dynamic Programming. Simulate real-world technical assessments and boost your confidence.</p>
                <Link to="/curriculum" className="text-purple-600 font-semibold hover:text-purple-800 transition-colors flex items-center gap-2">View Preparation Kits</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-50 to-white transform transition-transform group-hover:scale-105" />
                <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000&auto=format&fit=crop" className="z-10 rounded-lg shadow-lg -rotate-3 group-hover:rotate-0 transition-transform" />
              </div>
            </div>

            {/* Feature 3 (The Bug Fix) */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-amber-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">AI-Powered Mentorship</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Stuck on a tricky bug? Our integrated AI Tutor doesn't just give you the answer—it analyzes your code visually and hints at your logic flaws, teaching you precisely how to fix it.</p>
                <Link to="/curriculum" className="text-amber-600 font-semibold hover:text-amber-800 transition-colors flex items-center gap-2">Meet your AI Tutor</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-white transform transition-transform group-hover:scale-105" />
                <div className="z-10 bg-slate-900 rounded-xl p-6 w-full max-w-sm shadow-xl text-left border border-slate-800">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="bg-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs">AI</span>
                     <span className="text-white font-medium">Glintspark Tutor</span>
                   </div>
                   <p className="text-slate-300 text-sm">I noticed your loop condition is `i &lt; arr.length`. During boundary cases, you might miss the final element. Try adjusting it to `&lt;=` !</p>
                </div>
              </div>
            </div>

            {/* Feature 4 (New) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Award className="text-emerald-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Get Certified</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Prove your skills to employers. Take standardized, timed skill assessments across various technologies (React, Python, Node) and earn verified certificates to build your professional portfolio.</p>
                <Link to="/auth" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors flex items-center gap-2">Get Certified Now</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-bl from-emerald-50 to-white transform transition-transform group-hover:scale-105" />
                <div className="z-10 bg-emerald-50 border border-emerald-200 rounded-xl p-6 w-full max-w-sm shadow-lg text-center flex flex-col items-center">
                  <Award size={48} className="text-emerald-500 mb-4" />
                  <h4 className="font-bold text-slate-900 text-xl">React Proficiency</h4>
                  <p className="text-emerald-700 font-medium mt-1">Verified Expert</p>
                  <p className="text-slate-500 text-sm mt-4">Issued: April 2026</p>
                </div>
              </div>
            </div>

            {/* Feature 5 (New) */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Globe className="text-pink-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Compete & Climb</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Participate in weekly coding challenges and hackathons. Climb the global leaderboard, earn unique Glintos, and track your coding streak against developers worldwide.</p>
                <Link to="/leaderboard" className="text-pink-600 font-semibold hover:text-pink-800 transition-colors flex items-center gap-2">View Leaderboard</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-50 to-white transform transition-transform group-hover:scale-105" />
                
                <div className="z-10 w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3"><span className="font-bold text-slate-400">1</span><div className="w-8 h-8 rounded-full bg-slate-200"></div><span className="font-bold text-slate-800">Alex_Dev</span></div>
                    <span className="font-bold text-pink-600">2,450</span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm scale-110 shadow-pink-100 border-pink-200 relative z-20">
                    <div className="flex items-center gap-3"><span className="font-bold text-pink-500">2</span><div className="w-8 h-8 rounded-full bg-pink-200"></div><span className="font-bold text-slate-800">You</span></div>
                    <span className="font-bold text-pink-600">2,100</span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3"><span className="font-bold text-slate-400">3</span><div className="w-8 h-8 rounded-full bg-slate-200"></div><span className="font-bold text-slate-800">SarahCodes</span></div>
                    <span className="font-bold text-pink-600">1,980</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Feature 6 (Level Learning Path) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Layers className="text-sky-600" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Structured Learning Paths</h3>
                <p className="text-slate-600 text-lg leading-relaxed">Whether you are a beginner looking to understand basic recursion, or a senior developer preparing for System Design interviews, jump into curated curriculum maps tailored specifically to your skill level.</p>
                <Link to="/curriculum" className="text-sky-600 font-semibold hover:text-sky-800 transition-colors flex items-center gap-2">View Skill Levels</Link>
              </div>
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-80 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-bl from-sky-50 to-white transform transition-transform group-hover:scale-105" />
                
                <div className="z-10 w-full max-w-xs relative flex flex-col items-center">
                  <div className="w-1 bg-sky-200 absolute top-0 bottom-0 left-1/2 -ml-0.5"></div>
                  <div className="bg-white border border-sky-300 shadow-md p-3 rounded-xl mb-6 relative z-10 font-bold text-sky-800 flex flex-col items-center">
                    <span className="text-xs text-slate-400">Level 3</span>
                    Advanced Graphs
                  </div>
                  <div className="bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] p-3 rounded-xl mb-6 relative z-10 font-bold text-white flex flex-col items-center scale-110">
                    <span className="text-xs text-sky-100">Level 2 (Active)</span>
                    Dynamic Programming
                  </div>
                  <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl relative z-10 font-bold text-slate-400 flex flex-col items-center opacity-70">
                    <span className="text-xs text-slate-400">Level 1 (Done)</span>
                    Basic Arrays
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
