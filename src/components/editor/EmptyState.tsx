import { PenLine } from 'lucide-react';
import { UI } from '../../lib/constants';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
        <PenLine size={28} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {UI.emptyStateTitle}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {UI.emptyStateDescription}
      </p>
    </div>
  );
}
