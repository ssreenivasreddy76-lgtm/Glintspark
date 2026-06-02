import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Terminal, Mail, Lock, ArrowRight, User, Globe, 
  Command, Sparkles, AlertCircle, CheckCircle2, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<'developer' | 'company'>('developer');
  const navigate = useNavigate();

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
      if (isLogin) {
        // Sign In Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        navigate('/dashboard');
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
        if (signUpError) throw signUpError;

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
          navigate('/dashboard');
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
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
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
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/20 via-transparent to-transparent z-0"></div>
        <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-purple-600/20 blur-[120px] rounded-full z-0"></div>

        <div className="relative z-10 flex items-center gap-2">
          <Logo size={32} variant="light" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            {userRole === 'developer' ? (
              <>The standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-purple-400">mastering code</span></>
            ) : (
              <>Hire the top <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">tech talent</span></>
            )}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {userRole === 'developer' 
              ? 'Join thousands of developers leveling up their logic, crushing interviews, and pushing to production fearlessly.'
              : 'The ultimate enterprise toolset to evaluate candidates, track performance, and build high-functioning engineering teams.'}
          </p>
          
          <div className="relative z-10 flex flex-col gap-4">
            {/* Aesthetic grid pattern or element can go here in the future */}
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-slate-500">
           © 2026 Glintspark. {userRole === 'developer' ? 'Developer' : 'Enterprise'} Portal.
        </div>
      </div>

      {/* Right Hemisphere - Authentication Flow */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-md">
          {/* Role Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-12 shadow-inner border border-slate-200">
            <button 
              onClick={() => setUserRole('developer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                userRole === 'developer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} /> Developer
            </button>
            <button 
              onClick={() => setUserRole('company')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                userRole === 'company' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe size={16} /> Company
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${isLogin}-${userRole}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                {isLogin ? (userRole === 'developer' ? 'Welcome back' : 'Enterprise Login') : (userRole === 'developer' ? 'Create an account' : 'Partner with us')}
              </h1>
              <p className="text-slate-500 mb-8">
                {isLogin 
                  ? 'Access your unified developer workspace.' 
                  : (userRole === 'developer' ? 'Start your journey to software mastery today.' : 'Build your custom hiring pipeline in seconds.')}
              </p>

              {/* Feedback messages */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Elements */}
              <form className="space-y-4" onSubmit={handleAuth}>
                
                {!isLogin && (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder={userRole === 'developer' ? "Full Name" : "Company Name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-slate-900 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder={userRole === 'developer' ? "Email address" : "Work email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-slate-900 placeholder:text-slate-400"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-slate-900 placeholder:text-slate-400"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      isLogin ? (userRole === 'developer' ? 'Sign In' : 'Enterprise Log In') : (userRole === 'developer' ? 'Create Account' : 'Get Started')
                    )}
                  </button>
                </div>
              </form>

              {/* Separator - Hidden for companies sometimes, but keep for now */}
              <div className="mt-8 flex items-center justify-between">
                <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
                <span className="text-xs text-center text-slate-500 uppercase font-semibold">Or continue with</span>
                <span className="border-b border-slate-200 w-1/5 lg:w-1/4"></span>
              </div>

              {/* OAuth Providers */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition shadow-sm"
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
                  className="flex items-center justify-center gap-2 py-2.5 bg-[#24292e] hover:bg-[#1b1f23] disabled:bg-slate-500 text-white shadow-sm rounded-xl text-sm font-semibold transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              {/* Guest Access */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate(userRole === 'company' ? '/admin' : '/dashboard')}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium transition-all"
                >
                  Continue as Guest (No login required)
                </button>
              </div>

              {/* Footer Links */}
              <div className="mt-6 text-center text-sm text-slate-500 font-medium">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-brand-primary hover:text-brand-dark font-bold hover:underline"
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
