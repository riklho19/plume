import { formatWordCount } from '../../lib/wordCount';

interface WordCountBadgeProps {
  count: number;
}

export function WordCountBadge({ count }: WordCountBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tabular-nums">
      {formatWordCount(count)}
    </span>
  );
}
