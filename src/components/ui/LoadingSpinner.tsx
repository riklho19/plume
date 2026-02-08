interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`
        ${sizes[size]} border-2 border-gray-200 dark:border-gray-700
        border-t-plume-600 rounded-full animate-spin ${className}
      `}
    />
  );
}
