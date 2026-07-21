import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLock() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  // Protect the route from non-authorized emails
  if (!user || user.email !== 'ssreenivasreddy76@gmail.com') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-center max-w-md mb-6">
          You do not have administrative privileges. Please return to the developer dashboard.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passcode === 'Founder@seenu') {
      navigate('/admin/master');
    } else if (passcode === 'college@admin') {
      navigate('/admin/college');
    } else {
      setError('Invalid Admin Passcode');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-indigo-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Terminal</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Enter your designated passcode to access the secure dashboards.
        </p>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter passcode..."
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Unlock Terminal <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 bg-transparent hover:bg-slate-800 text-slate-400 px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
