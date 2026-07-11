import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Sparkles, Globe, MessageCircle, Mail, Search, Bell, MessageSquare, Menu, ChevronDown, ChevronRight, LogOut, User, X, Tv, Camera } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { AIChat } from '../components/AIChat';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function GlobalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showSolutionsMenu, setShowSolutionsMenu] = useState(false);
  
  const isAppPage = !['/', '/products', '/solutions', '/resources', '/pricing', '/about', '/careers', '/privacy', '/terms'].includes(location.pathname);
  const isInterviewRoom = location.pathname.includes('/mock-interview/');
  const isAdminPage = location.pathname.includes('/admin');
  const isGuest = sessionStorage.getItem('isGuest') === 'true';

  useEffect(() => {
    if (!loading && !user && isAppPage && !isGuest) {
      navigate('/auth', { state: { from: location.pathname + location.search + location.hash } });
    }
  }, [user, loading, isAppPage, isGuest, location.pathname, location.search, location.hash, navigate]);

  return (
    <div className={`min-h-screen flex flex-col relative ${isInterviewRoom ? 'bg-black' : 'bg-white'} selection:bg-brand-primary/10`}>
      {/* HackerRank Style Dark Header */}
      {!isInterviewRoom && !isAdminPage && (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          
          {/* Left: Logo + Desktop Menu */}
          <div className="flex items-center gap-10 h-full">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <Logo size={28} variant="light" />
            </Link>

            {/* Desktop Menu - App Pages */}
            {/* Desktop Menu - App Pages / Landing Page */}
            {isAppPage ? (
              <div className="hidden lg:flex items-center gap-1 text-[14.5px] font-bold text-slate-400 h-full">
                <Link to="/dashboard" className={`px-4 py-2 rounded-full flex items-center hover:text-white transition-all relative ${location.pathname === '/dashboard' ? 'text-white' : ''}`}>
                  {location.pathname === '/dashboard' && <motion.div layoutId="navbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                  Home
                </Link>
                <Link to="/curriculum" className={`px-4 py-2 rounded-full flex items-center hover:text-white transition-all relative ${location.pathname === '/curriculum' ? 'text-white' : ''}`}>
                  {location.pathname === '/curriculum' && <motion.div layoutId="navbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                  Learn
                </Link>
                <Link to="/challenges" className={`px-4 py-2 rounded-full flex items-center hover:text-white transition-all relative ${location.pathname === '/challenges' ? 'text-white' : ''}`}>
                  {location.pathname === '/challenges' && <motion.div layoutId="navbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                  Practice
                </Link>
                <Link to="/contests" className={`px-4 py-2 rounded-full flex items-center hover:text-white transition-all relative ${location.pathname === '/contests' ? 'text-white' : ''}`}>
                  {location.pathname === '/contests' && <motion.div layoutId="navbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                  Contests
                </Link>
                <Link to="/leaderboard" className={`px-4 py-2 rounded-full flex items-center hover:text-white transition-all relative ${location.pathname === '/leaderboard' ? 'text-white' : ''}`}>
                  {location.pathname === '/leaderboard' && <motion.div layoutId="navbg" className="absolute inset-0 bg-white/10 rounded-full" style={{ zIndex: -1 }} />}
                  Leaderboard
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 text-[15px] font-bold text-slate-400 h-full">
                <Link to="/products" className="px-5 h-full flex items-center hover:text-white transition-all">
                  Products
                </Link>
                <Link to="/solutions" className="px-5 h-full flex items-center hover:text-white transition-all">
                  Solutions
                </Link>
                <Link to="/resources" className="px-5 h-full flex items-center hover:text-white transition-all">
                  Resources
                </Link>
                <Link to="/pricing" className="px-5 h-full flex items-center hover:text-white transition-all">
                  Pricing
                </Link>
              </div>
            )}
          </div>

          {/* Right: Tools / Auth */}
          <div className="flex items-center gap-2 sm:gap-6 h-full">
            {(user || (isGuest && isAppPage)) ? (
              <>
                {/* HackerRank Style Search */}
                {isAppPage && (
                  <div className="hidden md:flex items-center bg-[#1e293b] rounded border border-slate-800 px-4 py-2 group focus-within:border-brand-primary focus-within:bg-[#0f172a] transition-all w-80">
                    <Search size={15} className="text-slate-500 group-focus-within:text-brand-primary" />
                    <input 
                      type="text" 
                      placeholder="Search skills, people or topics..." 
                      className="bg-transparent border-none text-[13px] ml-3 w-full focus:outline-none placeholder:text-slate-500 font-medium text-slate-200"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1 h-full">
                  {/* Messages */}
                  <button className="p-2 text-slate-400 hover:text-white transition-all relative">
                    <MessageSquare size={20} />
                  </button>

                  {/* Notifications */}
                  <button className="p-2 text-slate-400 hover:text-white transition-all relative">
                    <Bell size={20} />
                  </button>

                  <div className="h-4 w-[1px] bg-slate-800 mx-2"></div>
                </div>

                {/* HackerRank Style Profile Menu - Now on HOVER */}
                <div 
                  className="relative ml-2 h-full flex items-center group"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold border border-slate-700 text-xs">
                      {user?.name ? getInitials(user.name) : <User size={16} />}
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180 text-brand-primary' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
                        className="absolute right-0 top-[60px] z-[100] bg-[#1e2330] border border-slate-800 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[240px] overflow-hidden"
                      >
                        <div className="p-4">
                          {/* User Profile Card */}
                          {user ? (
                            <div className="mb-4 pb-3 border-b border-slate-800/80">
                              <p className="text-white font-bold text-sm truncate">{user.name}</p>
                              <p className="text-slate-400 text-xs truncate mt-0.5">{user.email}</p>
                            </div>
                          ) : (
                            <div className="mb-4 pb-3 border-b border-slate-800/80">
                              <p className="text-white font-bold text-sm truncate">Guest Session</p>
                              <Link to="/auth" className="text-brand-primary hover:text-brand-light text-xs font-bold mt-1 inline-block">Create an account &rarr;</Link>
                            </div>
                          )}
                          
                          {/* Hackos / Glintos Badge - Now clickable */}
                          <Link 
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="block bg-[#4a90e2] text-white py-2 px-4 rounded text-center font-bold text-[14px] mb-4 hover:bg-[#357abd] transition-colors shadow-lg shadow-blue-500/20"
                          >
                            Glintos: {user?.xp || 1482}
                          </Link>

                          <div className="flex flex-col text-[14px]">
                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50 flex items-center justify-between group/item">
                              Profile <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                            </Link>
                            
                            <div className="py-2.5 flex items-center justify-between border-b border-slate-800/50">
                              <span className="text-slate-100 flex items-center gap-2">
                                Dark Mode <span className="bg-[#4a90e2] text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Beta</span>
                              </span>
                              <div className="w-8 h-4 bg-emerald-500 rounded-full relative shadow-inner">
                                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                              </div>
                            </div>

                            <Link to="/leaderboard" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Leaderboard</Link>
                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Settings</Link>
                            <Link to="/curriculum" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Plans</Link>
                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Bookmarks</Link>
                            <Link to="/leaderboard" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Network</Link>
                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Submissions</Link>
                            <Link to="/company" onClick={() => setShowUserMenu(false)} className="py-2.5 text-slate-100 hover:text-brand-primary transition border-b border-slate-800/50">Administration</Link>
                            <button
                              onClick={() => { logout(); setShowUserMenu(false); }}
                              className="py-3 text-left text-slate-100 hover:text-rose-400 transition font-bold"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6 h-full">
                <Link to="/auth" state={{ from: location.pathname + location.search + location.hash }} className="text-[15px] font-bold text-slate-300 hover:text-white transition-all tracking-wide">
                  Login
                </Link>
                <Link to="/auth" state={{ from: location.pathname + location.search + location.hash }} className="px-8 py-2.5 bg-brand-primary text-white text-[15px] font-bold rounded-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20 active:scale-95">
                  Create Account
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button onClick={() => setShowMobileMenu(v => !v)} className="lg:hidden p-2 text-slate-400 hover:text-white transition h-full">
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      )}

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {showMobileMenu && isAppPage && !isInterviewRoom && (
          <motion.div
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            className="fixed top-[68px] left-0 right-0 z-40 bg-slate-950 border-b border-white/5 lg:hidden"
          >
            {[['Home','/dashboard'],['Learn','/curriculum'],['Practice','/challenges'],['Contests','/contests'],['Leaderboard','/leaderboard']].map(([label,path]) => (
              <Link
                key={path}
                to={path}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-6 py-4 text-sm font-bold border-b border-white/5 transition ${
                  location.pathname === path ? 'text-brand-primary bg-brand-primary/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 ${(isInterviewRoom || isAdminPage) ? '' : 'pt-[68px]'}`}>
        <Outlet />
      </main>

      {/* Fat Footer - Only shown on Landing Page */}
      {!isAppPage && (
        <footer className="pt-16 pb-8 mt-20 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
              <div className="col-span-2 lg:col-span-2 pr-8">
                <div className="flex items-center gap-2 mb-4">
                  <Logo size={24} variant="light" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  The ultimate developer skills platform to practice coding, prepare for interviews, and get certified effortlessly.
                </p>
                <div className="flex gap-4 text-slate-500">
                  <Tv size={20} className="cursor-pointer hover:text-[#FF0000] transition hover:-translate-y-1" />
                  <Camera size={20} className="cursor-pointer hover:text-[#E1306C] transition hover:-translate-y-1" />
                  <Globe size={20} className="cursor-pointer hover:text-brand-primary transition hover:-translate-y-1" />
                  <Mail size={20} className="cursor-pointer hover:text-white transition hover:-translate-y-1" />
                </div>
              </div>
              
              <div>
                <Link to="/products" className="hover:text-brand-light transition">
                  <h4 className="font-bold text-white mb-6">Product</h4>
                </Link>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><Link to="/curriculum" className="hover:text-brand-light transition">Learning Tracks</Link></li>
                  <li><Link to="/challenges" className="hover:text-brand-light transition">Practice IDE</Link></li>
                  <li><Link to="/profile?tab=certifications" className="hover:text-brand-light transition">Certifications</Link></li>
                  <li><Link to="/leaderboard" className="hover:text-brand-light transition">Leaderboard Rankings</Link></li>
                </ul>
              </div>

              <div>
                <Link to="/resources" className="hover:text-brand-light transition">
                  <h4 className="font-bold text-white mb-6">Resources</h4>
                </Link>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><Link to="/resources" className="hover:text-brand-light transition">Developer Blog</Link></li>
                  <li><Link to="/resources" className="hover:text-brand-light transition">Documentation</Link></li>
                  <li><Link to="/resources" className="hover:text-brand-light transition">Community Forum</Link></li>
                  <li><Link to="/resources" className="hover:text-brand-light transition">Help Center</Link></li>
                </ul>
              </div>

              <div>
                <Link to="/solutions" className="hover:text-brand-light transition">
                  <h4 className="font-bold text-white mb-6">Company</h4>
                </Link>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><Link to="/about" className="hover:text-brand-light transition">About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-brand-light transition">Careers</Link></li>
                  <li><Link to="/privacy" className="hover:text-brand-light transition">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-brand-light transition">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-900/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>© 2026 Glintspark. All rights reserved.</p>
              <div className="flex items-center gap-1.5 font-medium">
                Made with <Sparkles size={14} className="text-brand-primary" /> by the Glintspark Team
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Global Floating AI Chat */}
      {(user || (isGuest && isAppPage)) && <AIChat />}
    </div>
  );
}
