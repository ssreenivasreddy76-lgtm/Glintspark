import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

export default function MasterLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email?.toLowerCase() === 'admin@glintspark.in') {
      navigate('/admin/master', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const checkEmail = email.trim().toLowerCase();
      const checkPass = password.trim();

      // Using strict Supabase DB Auth for admin panels

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message || "Invalid credentials or unauthorized access.");
      }
      
      const loggedInEmail = signInData?.user?.email?.toLowerCase();
      if (loggedInEmail === 'admin@glintspark.in') {
        navigate('/admin/master', { replace: true });
      } else {
        // If someone else logs in here, still send them somewhere safe
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your admin email first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setError("Password reset link sent to your email!"); // Using setError temporarily as a success msg container since MasterLogin lacks a successMsg state
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#f59e0b] animate-pulse" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-[#f59e0b]/20 blur-xl rounded-full" />
        </div>
        <div className="text-2xl tracking-tight flex items-baseline">
          <span className="font-bold text-slate-900">Glint</span>
          <span className="font-bold text-[#f59e0b]">Spark</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-2xl sm:px-10 border border-slate-100"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <ShieldAlert className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-black text-slate-900 mb-8 tracking-tight">
            Master Admin Portal
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="email" 
                placeholder="admin@glintspark.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-indigo-600 hover:-translate-y-0.5 disabled:bg-slate-500 disabled:hover:translate-y-0 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-bold text-slate-400 tracking-widest uppercase">
            Authorized Personnel Only
          </div>
        </motion.div>
      </div>
    </div>
  );
}
