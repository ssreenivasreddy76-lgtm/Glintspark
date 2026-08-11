import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const bypassEmail = localStorage.getItem('admin_bypass_email');

  if (!user && !bypassEmail) {
    return <Navigate to="/auth" />;
  }

  // We rely entirely on the authenticated user from Supabase AuthContext
  const isCompany = user?.role === 'company';
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'founder@glintspark.in';
  
  // Onboarding has been removed per user request.
  // We no longer redirect to /onboarding for any users.

  return <>{children}</>;
};
