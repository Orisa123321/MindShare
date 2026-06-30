const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
};

const gradients = [
  'from-primary-400 to-primary-600',
  'from-secondary-400 to-secondary-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-pink-600',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ username, size = 'md', className = '' }: AvatarProps) {
  const initials = username
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const gradient = gradients[hashString(username) % gradients.length];
  const s = sizeMap[size];

  return (
    <div
      className={`${s.container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg ${className}`}
    >
      <span className={`${s.text} font-bold text-white leading-none`}>{initials}</span>
    </div>
  );
}
