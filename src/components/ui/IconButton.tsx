import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  size?: 'sm' | 'md';
  active?: boolean;
}

export function IconButton({
  children,
  label,
  size = 'md',
  active = false,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClass = size === 'sm' ? 'p-1' : 'p-1.5';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-md
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-plume-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active
          ? 'bg-plume-100 text-plume-700 dark:bg-plume-900/40 dark:text-plume-300'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
        }
        ${sizeClass} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
