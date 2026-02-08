import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { UI } from '../../lib/constants';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSwitch: () => void;
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const signUp = useAuthStore((s) => s.signUp);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {UI.authConfirmEmail}
        </p>
        <button onClick={onSwitch} className="text-plume-600 hover:underline font-medium text-sm">
          {UI.authBackToLogin}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={UI.authDisplayName}
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Votre nom de plume..."
        required
      />
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
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? UI.authLoading : UI.authCreateAccount}
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {UI.authHasAccount}{' '}
        <button type="button" onClick={onSwitch} className="text-plume-600 hover:underline font-medium">
          {UI.authSignIn}
        </button>
      </p>
    </form>
  );
}
