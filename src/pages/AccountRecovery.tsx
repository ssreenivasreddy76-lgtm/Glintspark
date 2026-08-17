import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabaseService';

export default function AccountRecovery() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('recover-account', {
        body: { action: 'send-otp', email: email.trim().toLowerCase() }
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to send recovery code.');
      }

      setStep(2);
      setSuccess("We've sent a 6-digit recovery code to your backup email.");
    } catch (err: any) {
      setError(err.message || 'Could not find an account linked to this backup email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('recover-account', {
        body: { action: 'verify-otp', email: email.trim().toLowerCase(), otp: otp.trim() }
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Invalid recovery code.');
      }

      setSuccess("Account successfully recovered! Redirecting you to login...");
      
      // The Edge Function swapped their primary email and returned a magic link.
      if (data?.link) {
        // The magic link points to the Supabase server. We must KEEP the Supabase host,
        // but we need to update the `redirect_to` parameter to point back to our current window
        // (so it correctly goes back to port 5173 instead of port 3000).
        try {
          const magicUrl = new URL(data.link);
          magicUrl.searchParams.set('redirect_to', window.location.origin + '/dashboard');
          window.location.href = magicUrl.toString();
        } catch (e) {
          window.location.href = data.link;
        }
      } else {
        setTimeout(() => navigate('/auth'), 3000);
      }
      
    } catch (err: any) {
      setError(err.message || 'Invalid recovery code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50 selection:bg-brand-primary/10">
      <div className="absolute top-8 left-8 z-50">
        <Link to="/auth" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <Logo size={40} variant="dark" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-slate-900">
            Account Recovery
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">
            Lost access to your college email? Use your verified backup email to recover your account.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
          <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl border border-slate-100 relative z-10 sm:px-10">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-bold text-rose-700">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3"
                >
                  <Shield className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-bold text-emerald-700">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {step === 1 ? (
              <motion.form 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Backup Email Address
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                      placeholder="e.g. personal@gmail.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Recovery Code'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="otp" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    6-Digit Recovery Code
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg tracking-[0.5em] font-bold focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                      placeholder="000000"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Enter the code sent to <strong>{email}</strong>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Recover Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(''); setError(null); setSuccess(null); }}
                    className="w-full flex justify-center py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
                  >
                    Use a different email
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
