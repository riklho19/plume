import { UI } from '../../lib/constants';
import { formatWordCount } from '../../lib/wordCount';
import { Button } from '../ui/Button';

interface VersionPreviewProps {
  content: string;
  wordCount: number;
  onRestore: () => void;
  onClose: () => void;
}

export function VersionPreview({ content, wordCount, onRestore, onClose }: VersionPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs text-gray-500">
          {formatWordCount(wordCount)} {UI.words}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {UI.cancel}
          </Button>
          <Button size="sm" onClick={onRestore}>
            {UI.versionRestore}
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
