import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, Building2, Zap, BookOpen, Sparkles, TerminalSquare, Award, Globe, Layers, Trophy, Code, Flame, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
export default function Landing() {

  return (
    <div className="w-full flex flex-col items-center bg-white">
      {/* 
        ==============================
        HERO SECTION
        ==============================
      */}
      <div className="max-w-7xl w-full mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        {/* Left: Text Content */}
        <div className="w-full lg:w-[55%] flex flex-col items-start text-left z-10">
          {/* Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Accelerate your <br className="hidden lg:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">software engineering</span> career
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed font-medium mb-10"
          >
            Join a world-class environment of interactive curriculum, real-time code execution, and personalized AI mentoring designed to get you interview-ready.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to="/challenges" className="px-8 py-4 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30 flex items-center justify-center group">
              For Developers
            </Link>
            <Link to="/auth" state={{ role: 'company' }} className="px-8 py-4 rounded-full bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-900 font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 flex items-center justify-center group shadow-sm">
              For Companies
            </Link>
          </motion.div>
        </div>

        {/* Right: Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="w-full lg:w-[45%] flex justify-center lg:justify-end mt-12 lg:mt-0"
        >
          <div className="relative w-full max-w-lg lg:max-w-full aspect-square lg:aspect-auto lg:h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            <img 
              src="/hero-image.png" 
              alt="Coding Platform" 
              className="relative w-full h-full object-cover rounded-3xl shadow-2xl border border-slate-200/60"
            />
          </div>
        </motion.div>
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

          <div className="space-y-36">
            
            {/* Feature 1: Practice Coding */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <TerminalSquare className="text-indigo-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Practice Coding</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Join a community of developers practicing their logic and algorithmic skills. Use our blazing-fast compiler supporting multiple languages to solve hundreds of meticulously crafted challenges.
                </p>
                <Link to="/challenges" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors group/link">
                  Explore Challenges 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Code Editor */}
                <div className="w-full max-w-md bg-[#0f172a] border border-slate-850 rounded-2xl overflow-hidden shadow-2xl relative font-mono text-[13px] text-slate-300">
                  {/* Traffic lights header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0b0f19] border-b border-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80" />
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80" />
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-slate-500 text-xs font-semibold">solution.js</span>
                    <div className="w-10" />
                  </div>
                  {/* Editor lines */}
                  <div className="p-6 space-y-1 bg-[#090d16] text-[13px] leading-relaxed">
                    <div className="flex"><span className="text-slate-600 w-6 select-none">1</span><span className="text-pink-500 font-semibold">function</span>&nbsp;<span className="text-indigo-400 font-bold">findMax</span>(arr) {'{'}</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">2</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">let</span>&nbsp;max = arr[<span className="text-amber-400">0</span>];</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">3</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">for</span>&nbsp;(<span className="text-pink-500 font-semibold">let</span>&nbsp;i = <span className="text-amber-400">1</span>; i &lt; arr.length; i++) {'{'}</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">4</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500 font-semibold">if</span>&nbsp;(arr[i] &gt; max) max = arr[i];</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">5</span>&nbsp;&nbsp;{'}'}</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">6</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">return</span>&nbsp;max;</div>
                    <div className="flex"><span className="text-slate-600 w-6 select-none">7</span>{'}'}</div>
                  </div>
                  {/* Floating success label */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute bottom-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md font-sans font-bold text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Compilation Success (+10 XP)
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature 2: Prepare for Interviews */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <BookOpen className="text-purple-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prepare for Interviews</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Follow structured curriculum tracks ranging from foundational Data Structures to advanced Dynamic Programming. Simulate real-world technical assessments and boost your confidence.
                </p>
                <Link to="/curriculum" className="inline-flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors group/link">
                  View Preparation Kits 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: 3D floating cards stack */}
                <div className="h-72 w-full max-w-sm relative flex items-center justify-center">
                  
                  {/* Card 1: System Design */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="absolute w-64 bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-2xl -rotate-6 -translate-x-8 -translate-y-6 z-10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">System Design</span>
                      <span className="text-xs font-bold text-indigo-400">80% Done</span>
                    </div>
                    <h4 className="font-extrabold text-sm mb-3">Microservices & Caching</h4>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[80%]" />
                    </div>
                  </motion.div>

                  {/* Card 2: Dynamic Programming */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="absolute w-64 bg-[#1e1b4b] border border-indigo-950 text-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(99,102,241,0.2)] rotate-3 translate-x-8 translate-y-6 z-20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Algorithms</span>
                      <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase">Resume</span>
                    </div>
                    <h4 className="font-extrabold text-sm mb-3">Dynamic Programming</h4>
                    <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full w-[45%]" />
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            </div>

            {/* Feature 3: AI-Powered Mentorship */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles className="text-amber-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI-Powered Mentorship</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Stuck on a tricky bug? Our integrated AI Tutor doesn't just give you the answer—it analyzes your code visually and hints at your logic flaws, teaching you precisely how to fix it.
                </p>
                <Link to="/curriculum" className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-800 transition-colors group/link">
                  Meet your AI Tutor 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: AI Chat Simulator */}
                <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative flex flex-col gap-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                  
                  {/* User message */}
                  <div className="self-end bg-slate-800 text-slate-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-xs font-semibold leading-relaxed shadow-sm">
                    My binary search is stuck in an infinite loop. What did I miss?
                  </div>

                  {/* AI Response */}
                  <div className="self-start bg-slate-900 border border-slate-850 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3.5 max-w-[90%] text-xs leading-relaxed shadow-md flex flex-col gap-2 relative">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-500/20">AI Tutor</span>
                    </div>
                    <p className="text-slate-300 font-medium">
                      Check your pointer update! You need <code className="text-amber-400 bg-amber-400/5 px-1 rounded font-mono">low = mid + 1</code> instead of <code className="text-slate-500 font-mono">low = mid</code>. Otherwise, when pointers are adjacent, your midpoint will never advance.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 4: Get Certified */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Award className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get Certified</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Prove your skills to employers. Take standardized, timed skill assessments across various technologies (React, Python, Node) and earn verified certificates to build your professional portfolio.
                </p>
                <Link to="/profile?tab=certifications" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-800 transition-colors group/link">
                  Get Certified Now 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Glowing Metallic Certificate badge */}
                <motion.div 
                  whileHover={{ rotateY: 10, rotateX: -5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center w-72 shadow-2xl relative overflow-hidden flex flex-col items-center group cursor-pointer"
                >
                  {/* Subtle inner radial gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                  
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Award size={32} className="text-emerald-400" />
                  </div>
                  <h4 className="font-extrabold text-slate-100 text-lg">React Proficiency</h4>
                  <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-1">Verified Expert</p>
                  
                  <div className="border-t border-slate-800 w-full my-5" />
                  
                  <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500">
                    <span>ID: GLINT-983A</span>
                    <span>ISSUED: JUNE 2026</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Feature 5: Compete & Climb */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-pink-55 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Globe className="text-pink-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compete & Climb</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Participate in weekly coding challenges and hackathons. Climb the global leaderboard, earn unique Glintos, and track your coding streak against developers worldwide.
                </p>
                <Link to="/leaderboard" className="inline-flex items-center gap-2 text-pink-600 font-bold hover:text-pink-800 transition-colors group/link">
                  View Leaderboard 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Leaderboard progression */}
                <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Leaderboard entries */}
                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-3 rounded-2xl text-[13px]">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-500 w-4">1</span>
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-[10px]">AD</div>
                      <span className="font-bold text-slate-200">Alex_Dev</span>
                    </div>
                    <span className="font-black text-pink-400 text-xs">2,450 XP</span>
                  </div>

                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center justify-between bg-slate-900 border-2 border-pink-500/30 p-3 rounded-2xl text-[13px] shadow-lg shadow-pink-500/5 relative z-10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-pink-400 w-4">2</span>
                      <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center font-bold text-white text-[10px]">YO</div>
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        You
                        <span className="bg-pink-500/10 text-pink-400 text-[9px] px-1.5 py-0.5 rounded font-black">ACTIVE</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-100 text-xs">2,100 XP</span>
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">+150</span>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-3 rounded-2xl text-[13px]">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-500 w-4">3</span>
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-[10px]">SC</div>
                      <span className="font-bold text-slate-200">SarahCodes</span>
                    </div>
                    <span className="font-black text-pink-400 text-xs">1,980 XP</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 6: Timed Contests */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Contest Card */}
                <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weekly Coding Contest</span>
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Active
                    </span>
                  </div>

                  {/* Countdown Digital Clock */}
                  <div className="text-center bg-slate-900/50 border border-slate-900 p-4 rounded-2xl my-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Remaining</span>
                    <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                      01h : 24m : 08s
                    </div>
                  </div>

                  {/* Contest Leaderboard Peek */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-900 pb-1">
                      <span>Rank</span>
                      <span>Points</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">1</span>
                        <span>DevPro_99</span>
                      </div>
                      <span>380 pts</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">2</span>
                        <span>CodeMaster</span>
                      </div>
                      <span>350 pts</span>
                    </div>
                  </div>

                  {/* Enter Contest Button */}
                  <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/10 active:scale-[0.98]">
                    Enter Arena
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Trophy className="text-amber-500" size={20} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Timed Contests</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Participate in virtual hackathons and competitive coding contests. Code against other developers under time constraints, solve specialized problem sets, and win unique platform achievements.
                </p>
                <Link to="/contests" className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-800 transition-colors group/link">
                  Explore Contests 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </div>

            {/* Feature 7: Structured Learning Paths */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Layers className="text-sky-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Structured Learning Paths</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Whether you are a beginner looking to understand basic recursion, or a senior developer preparing for System Design interviews, jump into curated curriculum maps tailored specifically to your skill level.
                </p>
                <Link to="/curriculum" className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-800 transition-colors group/link">
                  View Skill Levels 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Skill tree connections */}
                <div className="w-full max-w-xs relative flex flex-col items-center py-4">
                  {/* Vertical Progress Connector */}
                  <div className="w-1 bg-slate-200 absolute top-0 bottom-0 left-1/2 -ml-0.5 z-0" />
                  <div className="w-1 bg-sky-500 absolute top-0 bottom-1/2 left-1/2 -ml-0.5 z-0 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                  
                  {/* Node 1: Done */}
                  <div className="bg-white border border-slate-200 shadow-sm px-4 py-3 rounded-2xl mb-8 relative z-10 font-bold text-slate-400 flex items-center gap-2.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] border border-emerald-500/20">✓</span>
                    <span>Level 1: Basic Arrays</span>
                  </div>

                  {/* Node 2: Active */}
                  <motion.div 
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="bg-white border-2 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.15)] px-4 py-3.5 rounded-2xl mb-8 relative z-10 font-bold text-slate-800 flex items-center gap-2.5 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-[10px] border border-sky-500/20 animate-pulse">2</span>
                    <span>Level 2: Dynamic Programming</span>
                  </motion.div>

                  {/* Node 3: Locked */}
                  <div className="bg-white/50 border border-slate-200/60 px-4 py-3 rounded-2xl relative z-10 font-bold text-slate-400 flex items-center gap-2.5 text-xs opacity-60">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-200">🔒</span>
                    <span>Level 3: Advanced Graphs</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 8: Coding Challenges */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Challenges Explorer Card */}
                <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 font-sans">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Algorithm Challenges</span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] px-2 py-0.5 rounded font-black">DSA Track</span>
                  </div>

                  {/* Challenge Row 1: Two Sum */}
                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-3 rounded-2xl text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[9px] border border-emerald-500/25">✓</span>
                      <span className="font-bold text-slate-200">Two Sum</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase">Solved (+50 XP)</span>
                  </div>

                  {/* Challenge Row 2: Reverse Integer */}
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center justify-between bg-slate-900 border border-indigo-500/30 p-3 rounded-2xl text-[13px] shadow-lg shadow-indigo-500/5 relative z-10 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[9px] font-bold border border-indigo-500/20 animate-pulse">▶</span>
                      <span className="font-bold text-slate-100">Reverse Integer</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Medium</span>
                  </motion.div>

                  {/* Challenge Row 3: Median of Arrays */}
                  <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-[13px] opacity-50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px]">🔒</span>
                      <span className="font-bold text-slate-400">Merge K Sorted Lists</span>
                    </div>
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded">Hard</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Code className="text-indigo-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Challenges</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Tackle a catalog of coding puzzles mapped across multiple levels of difficulty. Test your solutions against robust automated test suites, solve edge cases, and learn optimized logic.
                </p>
                <Link to="/challenges" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors group/link">
                  Solve Challenges 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </div>

            {/* Feature 9: Badges System */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                {/* Visual Widget: Achievement Grid */}
                <div className="grid grid-cols-3 gap-4 p-5 bg-[#0f172a]/95 border border-slate-800/80 rounded-3xl w-72 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge 1: Streak */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                  >
                    <Flame size={20} className="text-orange-400 fill-orange-400/10" />
                    <span className="text-[9px] font-black text-slate-300 leading-tight">7d Streak</span>
                  </motion.div>

                  {/* Badge 2: Speed */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                  >
                    <Zap size={20} className="text-indigo-400 fill-indigo-400/10 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-300 leading-tight">Swift Solver</span>
                  </motion.div>

                  {/* Badge 3: Master */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
                  >
                    <Trophy size={20} className="text-amber-400 fill-amber-400/10" />
                    <span className="text-[9px] font-black text-slate-300 leading-tight">Master</span>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Award className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Developer Badges</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Collect custom achievements as you hit coding milestones. Unlock special tags for solving problems fast, maintaining daily streaks, or mastering individual programming tracks.
                </p>
                <Link to="/profile" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-800 transition-colors group/link">
                  View Achievements 
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
