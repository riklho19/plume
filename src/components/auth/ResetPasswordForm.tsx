import { useState, type FormEvent } from 'react';
import { Feather } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UI } from '../../lib/constants';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { toastSuccess } from '../ui/Toast';

export function ResetPasswordForm() {
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError(UI.authNewPasswordMismatch);
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) {
      setError(error);
    } else {
      toastSuccess(UI.authNewPasswordSuccess);
    }
    setLoading(false);
  };

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
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {UI.authResetPassword}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={UI.authNewPassword}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <Input
                label={UI.authNewPasswordConfirm}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? UI.authLoading : UI.authNewPasswordSave}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
