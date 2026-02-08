import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UI } from '../../lib/constants';
import { Avatar } from '../ui/Avatar';

export function UserMenu() {
  const { profile, signOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!profile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Avatar name={profile.display_name} url={profile.avatar_url} size="sm" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
          {profile.display_name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {profile.display_name}
            </p>
          </div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <LogOut size={14} />
            {UI.authSignOut}
          </button>
        </div>
      )}
    </div>
  );
}
