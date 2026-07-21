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

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Intercept developers who haven't completed onboarding
  const isCompany = localStorage.getItem('mock_role') === 'company';
  const isAdmin = localStorage.getItem('mock_role') === 'admin';
  
  const userEmail = user?.email || sessionStorage.getItem('mock_email') || '';
  const usersData = JSON.parse(localStorage.getItem('mock_users_data') || '{}');
  const hasOnboarded = usersData[userEmail]?.onboarded === true;
  
  const isOnboardingRoute = window.location.pathname === '/onboarding';
  
  const searchParams = new URLSearchParams(window.location.search);
  const isEditing = searchParams.get('edit') === 'true';
  
  if (!isCompany && !isAdmin && !hasOnboarded && !isOnboardingRoute) {
    return <Navigate to="/onboarding" />;
  }
  
  if (!isCompany && !isAdmin && hasOnboarded && isOnboardingRoute && !isEditing) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};
