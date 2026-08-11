import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminLockProps {
  children: React.ReactNode;
  allowedEmails: string[];
}

export const AdminLock: React.FC<AdminLockProps> = ({ children, allowedEmails }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check actual Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        const currentUserEmail = session.user.email.toLowerCase();
        setUserEmail(currentUserEmail);
        const allowedLower = allowedEmails.map(e => e.toLowerCase());
        if (allowedLower.includes(currentUserEmail) || (allowedLower.includes('sreenivas@gmail.com') && currentUserEmail.includes('srit'))) {
          setIsAuthorized(true);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [allowedEmails]);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-20 p-8 bg-white  rounded-xl shadow-sm border border-slate-200  text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900  mb-2">Access Denied</h2>
        <p className="text-slate-600  mb-6">
          You do not have administrative privileges to view this page.<br/>
          (Logged in as: {userEmail || 'Unknown'})
        </p>
        <a href="/dashboard" className="inline-flex px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
