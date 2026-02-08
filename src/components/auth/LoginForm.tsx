import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { UI } from '../../lib/constants';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onSwitch: () => void;
}

export function LoginForm({ onSwitch }: LoginFormProps) {
  const signIn = useAuthStore((s) => s.signIn);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setLoading(false);
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (forgotMode) {
    return (
      <form onSubmit={handleReset} className="space-y-4">
        {resetSent ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            {UI.authResetSent}
          </p>
        ) : (
          <>
            <Input
              label={UI.authEmail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? UI.authLoading : UI.authResetPassword}
            </Button>
          </>
        )}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
            className="text-plume-600 hover:underline font-medium"
          >
            {UI.authBackToLogin}
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        label={UI.authEmail}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@exemple.com"
        required
      />
      <Input
        label={UI.authPassword}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        minLength={6}
      />
      <div className="text-right">
        <button
          type="button"
          onClick={() => { setForgotMode(true); setError(''); }}
          className="text-xs text-plume-600 hover:underline"
        >
          {UI.authForgotPassword}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? UI.authLoading : UI.authSignIn}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {UI.authNoAccount}{' '}
        <button type="button" onClick={onSwitch} className="text-plume-600 hover:underline font-medium">
          {UI.authSignUp}
        </button>
      </p>
    </form>
  );
}
