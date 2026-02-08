interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-plume-600', 'bg-blue-600', 'bg-green-600', 'bg-amber-600',
    'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, url, size = 'md', className = '' }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]} ${hashColor(name)} rounded-full
        flex items-center justify-center text-white font-medium ${className}
      `}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
