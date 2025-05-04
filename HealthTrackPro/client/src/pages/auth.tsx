import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthForm from '@/components/auth/AuthForm';
import { isAuthenticated } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

export default function AuthPage() {
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AuthForm />
    </div>
  );
}
