import { UI } from '../../lib/constants';
import { formatWordCount } from '../../lib/wordCount';
import { useProjectStore } from '../../store/useProjectStore';

interface WordCountPanelProps {
  projectId: string;
  chapterId: string;
  sceneId: string;
}

export function WordCountPanel({ projectId, chapterId, sceneId }: WordCountPanelProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );
  const chapter = project?.chapters.find((ch) => ch.id === chapterId);
  const scene = chapter?.scenes.find((sc) => sc.id === sceneId);

  const sceneWords = scene?.wordCount ?? 0;
  const chapterWords = chapter?.scenes.reduce((sum, sc) => sum + sc.wordCount, 0) ?? 0;
  const totalWords = project?.chapters.reduce(
    (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0), 0
  ) ?? 0;

  return (
    <div className="flex items-center gap-6 px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <span>
        <span className="font-medium text-gray-500 dark:text-gray-400">{UI.scene}:</span>{' '}
        {formatWordCount(sceneWords)} {UI.words}
      </span>
      <span>
        <span className="font-medium text-gray-500 dark:text-gray-400">{UI.chapter}:</span>{' '}
        {formatWordCount(chapterWords)} {UI.words}
      </span>
      <span>
        <span className="font-medium text-gray-500 dark:text-gray-400">{UI.total}:</span>{' '}
        {formatWordCount(totalWords)} {UI.words}
      </span>
    </div>
  );
}
