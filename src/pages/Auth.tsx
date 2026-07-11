import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Terminal, Mail, Lock, ArrowRight, User, Globe, 
  Command, Sparkles, AlertCircle, CheckCircle2, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'developer' | 'company'>(() => {
    return location.state?.role === 'company' ? 'company' : 'developer';
  });
  const from = (location.state?.from && location.state.from !== '/') ? location.state.from : '/dashboard';

  useEffect(() => {
    if (user) {
      sessionStorage.removeItem('isGuest');
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // State bindings for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (userRole === 'company' && !email.trim().toLowerCase().endsWith('@glintspark.team')) {
        throw new Error("Company Access Denied");
      }

      if (isLogin) {
        // 1. Validate if email exists in our registered users database
        const { data: userCheck, error: checkErr } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.trim());

        if (checkErr) {
          console.warn("DB email check failed, falling back to standard login:", checkErr);
        } else if (!userCheck || userCheck.length === 0) {
          throw new Error("This email address is not registered. Please check the spelling or create an account.");
        }

        // 2. Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            throw new Error("Incorrect password. Please verify your credentials and try again.");
          }
          throw signInError;
        }
        // Navigation is handled by useEffect
      } else {
        // Sign Up Flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name || 'User',
              first_name: name ? name.split(' ')[0] : 'User',
            },
          },
        });
        if (signUpError) {
          if (signUpError.message === 'User already registered') {
            throw new Error("This email address is already registered. Please log in to your account or use another email.");
          }
          throw signUpError;
        }

        // Client-side fallback check: Insert profile directly into public.users if the postgres trigger isn't active
        if (data.user) {
          const { error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();
            
          if (checkError) {
            // Profile doesn't exist yet, insert manually
            await supabase.from('users').insert({
              id: data.user.id,
              email: email,
              name: name || 'User',
              first_name: name ? name.split(' ')[0] : 'User',
              unlocked_lesson_ids: ['c1'],
              xp: 0,
              streak: 0,
            });
          }
        }

        if (data.session) {
          // Navigation is handled by useEffect
        } else {
          setSuccessMsg('Registration successful! Please check your email for the verification link.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    try {
      sessionStorage.removeItem('isGuest');
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + from,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || `An error occurred with ${provider} login.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-white font-sans">
      
      {/* Left Hemisphere - Branding & Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden group bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105 opacity-80" />
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col w-full h-full p-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Logo size={40} variant="light" />
          </motion.div>

          <div className="mt-auto">
            <div className="max-w-xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl tracking-tight"
              >
                {userRole === 'developer' ? (
                  <>The standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">mastering code</span></>
                ) : (
                  <>Hire the top <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">tech talent</span></>
                )}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-200 text-xl leading-relaxed mb-8 drop-shadow-md font-medium"
              >
                {userRole === 'developer' 
                  ? 'Join thousands of developers leveling up their logic, crushing interviews, and pushing to production fearlessly.'
                  : 'The ultimate enterprise toolset to evaluate candidates, track performance, and build high-functioning engineering teams.'}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-4"
            >
               © 2026 Glintspark. {userRole === 'developer' ? 'Developer' : 'Enterprise'} Portal.
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Hemisphere - Authentication Flow */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px] relative z-10">
          
          {/* Role Switcher */}
          <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl mb-12 shadow-inner border border-slate-200/60 relative">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200/50 z-0"
              initial={false}
              animate={{ x: userRole === 'developer' ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ left: '0.375rem' }}
            />
            <button 
              onClick={() => setUserRole('developer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-extrabold rounded-xl transition-colors relative z-10 ${
                userRole === 'developer' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} className={userRole === 'developer' ? 'text-indigo-600' : ''} /> Developer
            </button>
            <button 
              onClick={() => setUserRole('company')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-extrabold rounded-xl transition-colors relative z-10 ${
                userRole === 'company' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe size={16} className={userRole === 'company' ? 'text-fuchsia-600' : ''} /> Company
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${isLogin}-${userRole}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                {isLogin ? (userRole === 'developer' ? 'Welcome back' : 'Enterprise Login') : (userRole === 'developer' ? 'Create an account' : 'Partner with us')}
              </h1>
              <p className="text-slate-500 text-lg mb-8 font-medium">
                {isLogin 
                  ? 'Access your unified developer workspace.' 
                  : (userRole === 'developer' ? 'Start your journey to software mastery today.' : 'Build your custom hiring pipeline in seconds.')}
              </p>

              {/* Feedback messages */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium flex items-center gap-3">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Elements */}
              <form className="space-y-4" onSubmit={handleAuth}>
                
                {!isLogin && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder={userRole === 'developer' ? "Full Name" : "Company Name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder={userRole === 'developer' ? "Email address" : "Work email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-indigo-600 hover:-translate-y-0.5 disabled:bg-slate-500 disabled:hover:translate-y-0 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      isLogin ? (userRole === 'developer' ? 'Sign In' : 'Enterprise Log In') : (userRole === 'developer' ? 'Create Account' : 'Get Started')
                    )}
                  </button>
                </div>
              </form>

              {/* Separator */}
              <div className="mt-8 flex items-center justify-between opacity-80">
                <span className="border-b border-slate-200 w-full"></span>
                <span className="text-[10px] text-center text-slate-400 uppercase font-black px-4 tracking-widest whitespace-nowrap">Or continue with</span>
                <span className="border-b border-slate-200 w-full"></span>
              </div>

              {/* OAuth Providers */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 disabled:bg-slate-100 disabled:hover:translate-y-0 rounded-xl text-sm font-bold text-slate-700 transition-all duration-300 shadow-sm"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Google
                </button>
                <button 
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 py-3 bg-[#1e2327] hover:bg-[#15181a] hover:-translate-y-0.5 disabled:bg-slate-500 disabled:hover:translate-y-0 text-white shadow-md hover:shadow-xl rounded-xl text-sm font-bold transition-all duration-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              {/* Guest Access - Only visible on localhost for testing */}
              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('isGuest', 'true');
                      navigate(userRole === 'company' ? '/admin' : from);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 text-sm font-bold transition-all duration-300"
                  >
                    Continue as Guest (Local Dev Only)
                  </button>
                </div>
              )}

              {/* Footer Links */}
              <div className="mt-8 text-center text-sm text-slate-500 font-semibold">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-indigo-600 hover:text-indigo-700 font-black hover:underline underline-offset-4 transition-all"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </div>
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
