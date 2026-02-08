import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthPage } from './AuthPage';
import { ResetPasswordForm } from './ResetPasswordForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, initialized, initialize, passwordRecovery } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPasswordForm />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
}
