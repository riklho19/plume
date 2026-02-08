import { useState } from 'react';
import { Feather } from 'lucide-react';
import { UI } from '../../lib/constants';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ThemeToggle } from '../ui/ThemeToggle';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div />
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-plume-600 flex items-center justify-center mx-auto mb-4">
              <Feather size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {UI.appName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {UI.tagline}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {mode === 'login' ? UI.authSignIn : UI.authSignUp}
            </h2>
            {mode === 'login' ? (
              <LoginForm onSwitch={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitch={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
