import { ArrowLeft, Feather, Share2, Users } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { UI } from '../../lib/constants';
import { formatWordCount } from '../../lib/wordCount';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { ChapterTree } from '../tree/ChapterTree';

export function Sidebar() {
  const { projectId, goHome, setView, setShareDialogOpen } = useEditorStore();
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );

  if (!project) return null;

  const totalWords = project.chapters.reduce(
    (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0),
    0
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800">
        <IconButton label={UI.back} onClick={goHome} size="sm">
          <ArrowLeft size={16} />
        </IconButton>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Feather size={14} className="text-plume-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {project.title}
          </span>
        </div>
        <IconButton label={UI.share} onClick={() => setShareDialogOpen(true)} size="sm">
          <Share2 size={14} />
        </IconButton>
      </div>

      {/* Navigation buttons */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setView('characters')}
        >
          <Users size={14} />
          {UI.characters}
        </Button>
      </div>

      {/* Tree */}
      <ChapterTree project={project} />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
        <span>{formatWordCount(totalWords)} {UI.words}</span>
        <ThemeToggle />
      </div>
    </div>
  );
}
