import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, Building2, Zap, BookOpen, Sparkles, TerminalSquare, Award, Globe, Layers, Trophy, Code, Flame, ArrowRight, Mic, Video, Phone } from 'lucide-react';
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
              For Institutes
            </Link>
          </motion.div>
        </div>

        {/* Right: Hero Graphic (Code Editor Mockup) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="w-full lg:w-[45%] flex justify-center lg:justify-end mt-12 lg:mt-0"
        >
          <div className="relative w-full max-w-lg lg:max-w-full lg:h-[450px] flex items-center justify-center">
            {/* Glowing background behind IDE */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-[3rem] blur-3xl" />
            
            {/* Mock IDE Window */}
            <div className="relative w-full max-w-[500px] h-[350px] bg-[#0F111A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10">
              {/* IDE Header */}
              <div className="h-10 bg-[#161925] border-b border-slate-800 flex items-center px-4 gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="ml-4 px-3 py-1 bg-[#0F111A] text-slate-400 text-[11px] rounded-t-md border-t border-x border-slate-800 font-mono mt-2">
                  main.go
                </div>
              </div>
              
              {/* IDE Body */}
              <div className="flex-1 font-mono text-[13px] leading-relaxed overflow-hidden relative flex">
                {/* Line Numbers */}
                <div className="w-10 h-full bg-[#161925] border-r border-slate-800 text-right pr-2 pt-4 text-slate-600 select-none shrink-0">
                  1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9
                </div>
                
                {/* Code Content */}
                <div className="p-4 pl-4 overflow-hidden whitespace-nowrap">
                  <span className="text-purple-400 font-bold">package</span> <span className="text-emerald-400">main</span><br/><br/>
                  <span className="text-purple-400 font-bold">import</span> <span className="text-amber-300">"fmt"</span><br/><br/>
                  <span className="text-purple-400 font-bold">func</span> <span className="text-blue-400 font-bold">main</span><span className="text-slate-300">() {'{'}</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500 italic">// Master your coding skills</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-300">fmt.</span><span className="text-blue-400 font-bold">Println</span><span className="text-slate-300">(</span><span className="text-amber-300">"Welcome to GlintSpark!"</span><span className="text-slate-300">)</span><br/>
                  <span className="text-slate-300">{'}'}</span>
                </div>
                
                {/* Floating Success Element */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md shadow-lg shadow-emerald-500/10 text-xs font-bold font-sans"
                >
                  <Sparkles size={14} /> All Tests Passed
                </motion.div>
              </div>
            </div>
            
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
            
            {/* Feature 1: Mock Interview */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles className="text-amber-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mock Interview</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Experience the thrill of real technical interviews without the risk. Face off against our advanced AI interviewer to master System Design, DSA, and behavioral questions, receiving instant, actionable feedback to crush your dream job interview.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md lg:scale-110 bg-[#0f172a] border border-slate-800 rounded-3xl p-3 shadow-2xl relative overflow-hidden flex flex-col font-sans">
                  {/* Main Video Area (AI Interviewer) */}
                  <div className="w-full h-56 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-800/50">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 pointer-events-none" />
                    
                    {/* AI Avatar / Waveform */}
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
                        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-20" />
                        <Sparkles className="text-amber-400 w-8 h-8" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [6, Math.random() * 20 + 10, 6] }}
                            transition={{ repeat: Infinity, duration: 0.8 + Math.random(), ease: "easeInOut" }}
                            className="w-1.5 bg-amber-400/80 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* User PiP */}
                    <div className="absolute bottom-3 right-3 w-24 h-32 bg-slate-800 rounded-xl border-2 border-slate-700 overflow-hidden shadow-lg flex flex-col items-center justify-center relative">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mb-1">
                        <span className="text-slate-400 font-bold text-[10px]">YOU</span>
                      </div>
                    </div>

                    {/* Interview Status overlay */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300">System Design</span>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-5 py-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                      <Mic className="text-slate-300" size={20} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                      <Video className="text-slate-300" size={20} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)] transition">
                      <Phone className="text-white rotate-[135deg]" size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 2: Challenges */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Code className="text-indigo-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Challenges</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Push your coding limits with a massive library of algorithmic puzzles. From fundamental logic to mind-bending edge cases, test your code against battle-hardened test suites and level up your problem-solving arsenal.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md lg:scale-110 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 font-sans">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Algorithm Challenges</span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-1 rounded font-black">DSA Track</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-4 rounded-2xl text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/25">✓</span>
                      <span className="font-bold text-slate-200">Two Sum</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-400 uppercase">Solved (+50 XP)</span>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center justify-between bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/5 relative z-10 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20 animate-pulse">▶</span>
                      <span className="font-bold text-slate-100">Reverse Integer</span>
                    </div>
                    <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">Medium</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature 3: Learn */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Layers className="text-sky-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learn</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Stop guessing what to learn next. Follow expertly crafted, interactive roadmaps that guide you step-by-step from absolute beginner to senior-level architect. Your hyper-focused journey to mastery starts here.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-sm lg:scale-110 relative flex flex-col items-center py-6">
                  <div className="w-1.5 bg-slate-200 absolute top-0 bottom-0 left-1/2 -ml-[3px] z-0" />
                  <div className="w-1.5 bg-sky-500 absolute top-0 bottom-1/2 left-1/2 -ml-[3px] z-0 shadow-[0_0_12px_rgba(14,165,233,0.5)]" />
                  <div className="bg-white border border-slate-200 shadow-sm px-5 py-4 rounded-2xl mb-10 relative z-10 font-bold text-slate-400 flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-500/20">✓</span>
                    <span>Level 1: Basic Arrays</span>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="bg-white border-2 border-sky-400 shadow-[0_0_24px_rgba(14,165,233,0.15)] px-5 py-4 rounded-2xl mb-10 relative z-10 font-bold text-slate-800 flex items-center gap-3 text-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs border border-sky-500/20 animate-pulse">2</span>
                    <span>Level 2: Dynamic Programming</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature 4: Practise */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <TerminalSquare className="text-indigo-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Practise</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Write code, execute instantly, and iterate fast. Drop into our lightning-fast, multi-language coding playground. Join thousands of elite developers sharpening their logic and building unbreakable coding habits daily.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-lg lg:scale-110 bg-[#0f172a] border border-slate-850 rounded-2xl overflow-hidden shadow-2xl relative font-mono text-sm text-slate-300">
                  <div className="flex items-center justify-between px-5 py-4 bg-[#0b0f19] border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/80" />
                      <span className="w-4 h-4 rounded-full bg-amber-500/80" />
                      <span className="w-4 h-4 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-slate-500 text-sm font-semibold">solution.js</span>
                    <div className="w-12" />
                  </div>
                  <div className="p-8 space-y-1.5 bg-[#090d16] text-sm leading-relaxed">
                    <div className="flex"><span className="text-slate-600 w-8 select-none">1</span><span className="text-pink-500 font-semibold">function</span>&nbsp;<span className="text-indigo-400 font-bold">findMax</span>(arr) {'{'}</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">2</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">let</span>&nbsp;max = arr[<span className="text-amber-400">0</span>];</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">3</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">for</span>&nbsp;(<span className="text-pink-500 font-semibold">let</span>&nbsp;i = <span className="text-amber-400">1</span>; i &lt; arr.length; i++) {'{'}</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">4</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500 font-semibold">if</span>&nbsp;(arr[i] &gt; max) max = arr[i];</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">5</span>&nbsp;&nbsp;{'}'}</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">6</span>&nbsp;&nbsp;<span className="text-pink-500 font-semibold">return</span>&nbsp;max;</div>
                    <div className="flex"><span className="text-slate-600 w-8 select-none">7</span>{'}'}</div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute bottom-6 right-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md font-sans font-bold text-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Compilation Success (+10 XP)
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature 5: Certification */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Award className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Certification</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Don't just claim you're an expert—prove it. Dominate high-stakes, timed assessments in React, Python, Node, and more to unlock verified, industry-recognized certificates that make your portfolio impossible to ignore.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <motion.div 
                  whileHover={{ rotateY: 10, rotateX: -5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center w-80 lg:scale-110 shadow-2xl relative overflow-hidden flex flex-col items-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Award size={40} className="text-emerald-400" />
                  </div>
                  <h4 className="font-extrabold text-slate-100 text-xl">React Proficiency</h4>
                  <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mt-1.5">Verified Expert</p>
                  <div className="border-t border-slate-800 w-full my-6" />
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
                    <span>ID: GLINT-983A</span>
                    <span>ISSUED: JUNE 2026</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Feature 6: Quizzes */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <BookOpen className="text-purple-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quizzes</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Fire up your brain with lightning-fast, gamified quizzes. Expose your knowledge gaps and master the deep theory behind languages and frameworks so you can write code with absolute authority.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="h-80 w-full max-w-md lg:scale-110 relative flex items-center justify-center">
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="absolute w-72 bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl -rotate-6 -translate-x-10 -translate-y-8 z-10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">System Design</span>
                      <span className="text-sm font-bold text-indigo-400">80% Done</span>
                    </div>
                    <h4 className="font-extrabold text-base mb-4">Microservices & Caching</h4>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[80%]" />
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="absolute w-72 bg-[#1e1b4b] border border-indigo-950 text-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(99,102,241,0.2)] rotate-3 translate-x-10 translate-y-8 z-20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Algorithms</span>
                      <span className="text-[11px] font-black bg-indigo-500 text-white px-2.5 py-1 rounded-full uppercase">Resume</span>
                    </div>
                    <h4 className="font-extrabold text-base mb-4">Dynamic Programming</h4>
                    <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full w-[45%]" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Feature 7: Contests */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Flame className="text-rose-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contests</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Step into the arena. Battle developers worldwide in adrenaline-pumping weekend contests and specialized problem sets. Prove your algorithmic dominance under pressure.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md lg:scale-110 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Weekly Coding Contest</span>
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Active
                    </span>
                  </div>
                  <div className="text-center bg-slate-900/50 border border-slate-900 p-5 rounded-2xl my-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Time Remaining</span>
                    <div className="font-mono text-3xl font-black text-rose-400 tracking-wider">
                      01h : 24m : 08s
                    </div>
                  </div>
                  <button className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-rose-500/20 active:scale-[0.98]">
                    Enter Arena
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Feature 8: Leaderboard */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Globe className="text-pink-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leaderboard</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Dominate the global leaderboard. Earn XP for every challenge solved, track your daily coding streak, and outrank peers globally to cement your status as a top-tier engineer.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md lg:scale-110 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-4 rounded-2xl text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-slate-500 w-5">1</span>
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">AD</div>
                      <span className="font-bold text-slate-200">Alex_Dev</span>
                    </div>
                    <span className="font-black text-pink-400 text-sm">2,450 XP</span>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center justify-between bg-slate-900 border-2 border-pink-500/30 p-4 rounded-2xl text-sm shadow-lg shadow-pink-500/5 relative z-10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-pink-400 w-5">2</span>
                      <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center font-bold text-white text-xs">YO</div>
                      <span className="font-bold text-slate-100 flex items-center gap-2">
                        You
                        <span className="bg-pink-500/10 text-pink-400 text-[10px] px-2 py-0.5 rounded font-black">ACTIVE</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-100 text-sm">2,100 XP</span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+150</span>
                    </div>
                  </motion.div>
                  <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/40 p-4 rounded-2xl text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-slate-500 w-5">3</span>
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">SC</div>
                      <span className="font-bold text-slate-200">SarahCodes</span>
                    </div>
                    <span className="font-black text-pink-400 text-sm">1,980 XP</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 9: Badges */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Award className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Badges</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Collect custom achievements as you hit coding milestones. Unlock special tags for solving problems fast, maintaining daily streaks, and mastering individual programming tracks.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="flex-1 w-full flex items-center justify-center p-4"
              >
                <div className="grid grid-cols-3 gap-5 p-6 bg-[#0f172a]/95 border border-slate-800/80 rounded-3xl w-80 lg:scale-110 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-sm"
                  >
                    <Flame size={24} className="text-orange-400 fill-orange-400/10" />
                    <span className="text-[10px] font-black text-slate-300 leading-tight">7d Streak</span>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-sm"
                  >
                    <Zap size={24} className="text-indigo-400 fill-indigo-400/10 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 leading-tight">Swift Solver</span>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-sm"
                  >
                    <Trophy size={24} className="text-amber-400 fill-amber-400/10" />
                    <span className="text-[10px] font-black text-slate-300 leading-tight">Master</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
