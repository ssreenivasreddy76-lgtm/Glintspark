import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, LogOut, ShieldAlert } from 'lucide-react';

export default function CollegeAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic secondary guard
  if (!user || user.email !== 'ssreenivasreddy76@gmail.com') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-white">College Admin Console</h1>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Exit Console
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
          <Users className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Student Analytics Coming Soon</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            This dashboard will be built out to track student progress, success rates, and mock interview performances for college administrative review.
          </p>
        </div>
      </div>
    </div>
  );
}
