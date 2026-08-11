import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';

export default function ContestLandingPage() {
  const { id } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, status: 'Starts in' });

  useEffect(() => {
    async function fetchContest() {
      const contests = await firebaseDB.getContests();
      const found = contests.find(c => c.id === id || c.id.toString() === id);
      if (found) {
        setContest(found);
      }
    }
    fetchContest();
  }, [id]);

  useEffect(() => {
    if (!contest || !contest.date) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(contest.date).getTime();
      let target = start;
      let statusStr = 'Starts in';

      if (now > start) {
         if (contest.duration && contest.duration !== 999999) {
           const end = start + (contest.duration * 60000);
           if (now > end) {
             statusStr = 'Ended';
             target = end; // Past, will show 0s
           } else {
             statusStr = 'Ends in';
             target = end;
           }
         } else {
           statusStr = 'Started';
           target = start;
         }
      }

      const difference = target - now;
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          status: statusStr
        };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, status: statusStr };
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  if (!contest) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  // Format date correctly
  let formattedDateRange = '';
  if (contest.date) {
    const startD = new Date(contest.date);
    let startStr = startD.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    
    if (contest.duration && contest.duration !== 999999) {
      const endMs = startD.getTime() + (contest.duration * 60000);
      const endD = new Date(endMs);
      let endStr = endD.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
      formattedDateRange = `${startStr} to ${endStr}`;
    } else {
      formattedDateRange = `Starts ${startStr}`;
    }
  }

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Logo (placeholder for Glintspark logo) */}
          <div className="flex items-center">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-white" />
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">Glintspark</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[14px] font-bold text-slate-600">
          <a href="#about" className="hover:text-brand-primary transition-colors">About</a>
          <a href="#prizes" className="hover:text-brand-primary transition-colors">Prizes</a>
          <a href="#rules" className="hover:text-brand-primary transition-colors">Rules</a>
          <a href="#scoring" className="hover:text-brand-primary transition-colors">Scoring</a>
          <button className="px-5 py-2 bg-[#0e141e] hover:bg-[#1e2736] text-white rounded-[3px] transition-colors ml-2">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-slate-800 py-32 flex flex-col items-center justify-center text-center border-b-[8px] border-slate-200">
        {/* Background Image Placeholder overlay */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 capitalize">
            {contest.title || `Glintspark ${id}`}
          </h1>
          <p className="text-[15px] font-bold text-white mb-8">
            {formattedDateRange}
          </p>
          <button className="px-8 py-2.5 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[15px] font-bold rounded-[3px] transition-colors shadow-lg">
            Sign Up
          </button>
        </div>

        {/* Countdown Timer Widget overlapping bottom */}
        <div className="absolute bottom-0 translate-y-1/2 flex flex-col items-center z-20">
          <span className="text-[14px] text-slate-600 mb-2 font-bold z-30 drop-shadow-md">{timeLeft.status}</span>
          <div className="flex gap-2">
            <div className="bg-white border border-slate-200 shadow-md rounded-sm w-16 h-16 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{timeLeft.days}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">day{timeLeft.days !== 1 && 's'}</span>
            </div>
            <div className="bg-white border border-slate-200 shadow-md rounded-sm w-16 h-16 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{timeLeft.hours}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">hrs</span>
            </div>
            <div className="bg-white border border-slate-200 shadow-md rounded-sm w-16 h-16 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{timeLeft.minutes}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">mins</span>
            </div>
            <div className="bg-white border border-slate-200 shadow-md rounded-sm w-16 h-16 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{timeLeft.seconds}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for overlapping timer */}
      <div className="h-16"></div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#f3f4f6]">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-24">
          
          {/* About Section */}
          <section id="about" className="text-center scroll-mt-24">
            <h2 className="text-[32px] font-light text-slate-500 mb-8">About</h2>
            <div className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed">
              {contest.description || "Please provide a short description of your contest here! This will also be used as metadata."}
            </div>
          </section>

          {/* Prizes Section */}
          <section id="prizes" className="text-center scroll-mt-24">
            <h2 className="text-[32px] font-light text-slate-500 mb-8">Prizes</h2>
            <div className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed text-left inline-block">
              {contest.prizes ? (
                contest.prizes
              ) : (
                <ul className="list-disc text-left pl-6">
                  <li>Prizes are optional. You may add any prizes that you would like to offer here.</li>
                </ul>
              )}
            </div>
          </section>

          {/* Rules Section */}
          <section id="rules" className="text-center scroll-mt-24">
            <h2 className="text-[32px] font-light text-slate-500 mb-8">Rules</h2>
            <div className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed text-left inline-block">
              {contest.rules ? (
                contest.rules
              ) : (
                <ul className="list-disc text-left pl-6 space-y-2 max-w-3xl">
                  <li>The creator of this contest is solely responsible for setting and communicating the eligibility requirements associated with prizes awarded to participants, as well as for procurement and distribution of all prizes. The contest creator holds Glintspark harmless from and against any and all claims, losses, damages, costs, awards, settlements, orders, or fines.</li>
                  <li>Code directly from our platform, which supports over 30 languages. Learn more <a href="#" className="text-brand-primary hover:underline">here</a>.</li>
                  <li>Please provide any rules for your contest here.</li>
                </ul>
              )}
            </div>
          </section>

          {/* Scoring Section */}
          <section id="scoring" className="text-center scroll-mt-24">
            <h2 className="text-[32px] font-light text-slate-500 mb-8">Scoring</h2>
            <div className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed text-left inline-block">
              {contest.scoring ? (
                contest.scoring
              ) : (
                <ul className="list-disc text-left pl-6 space-y-2 max-w-3xl">
                  <li>Each challenge has a pre-determined score.</li>
                  <li>A participant's score depends on the number of test cases a participant's code submission successfully passes.</li>
                  <li>If a participant submits more than one solution per challenge, then the participant's score will reflect the highest score achieved. In a game challenge, the participant's score will reflect the last code submission.</li>
                  <li>Participants are ranked by score. If two or more participants achieve the same score, then the tie is broken by the total time taken to submit the last solution resulting in a higher score.</li>
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white py-24 text-center border-t border-slate-200">
        <h2 className="text-[28px] font-light text-slate-700 mb-6 capitalize">
          Sign up for {contest.title || `Glintspark ${id}`} now.
        </h2>
        <button className="px-8 py-2.5 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[15px] font-bold rounded-[3px] transition-colors mb-6 shadow-md">
          Sign Up
        </button>
        <div className="text-[13px] text-slate-500">
          Not a genuine coding contest? <a href="#" className="font-bold underline text-slate-600">Report here</a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2c323f] text-slate-400 py-12 text-[12px]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wider text-[11px]">COMPANY</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wider text-[11px]">DEVELOPERS</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Scoring</a></li>
              <li><a href="#" className="hover:text-white transition">Environment</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">For Schools</a></li>
              <li><a href="#" className="hover:text-white transition">Sign up</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wider text-[11px]">COMPANIES</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Solutions</a></li>
              <li><a href="#" className="hover:text-white transition">Customers</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Try for Free</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wider text-[11px]">RESOURCES</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">API</a></li>
              <li><a href="#" className="hover:text-white transition">Partners</a></li>
              <li><a href="#" className="hover:text-white transition">Events</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2ec866] to-[#28b55b] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded bg-white" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">Glintspark</span>
             </div>
             <p className="mb-2">+91 8880811222</p>
             <p className="mb-4">© 2026 Glintspark</p>
             <div className="flex gap-2">
               <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center text-white cursor-pointer hover:bg-slate-500">f</div>
               <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center text-white cursor-pointer hover:bg-slate-500">t</div>
               <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center text-white cursor-pointer hover:bg-slate-500">in</div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
