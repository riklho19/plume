import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-plume-500/50 focus:border-plume-500
          transition-colors text-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
