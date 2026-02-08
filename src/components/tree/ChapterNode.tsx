import { useState } from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Chapter } from '../../types/models';
import { useProjectStore } from '../../store/useProjectStore';
import { useEditorStore } from '../../store/useEditorStore';
import { UI } from '../../lib/constants';
import { SceneNode } from './SceneNode';
import { WordCountBadge } from '../stats/WordCountBadge';

interface ChapterNodeProps {
  chapter: Chapter;
  projectId: string;
  index: number;
}

export function ChapterNode({ chapter, projectId }: ChapterNodeProps) {
  const { updateChapter, addScene, deleteChapter } = useProjectStore();
  const selectScene = useEditorStore((s) => s.selectScene);
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);

  const chapterWordCount = chapter.scenes.reduce((sum, sc) => sum + sc.wordCount, 0);
  const sceneIds = chapter.scenes.map((s) => s.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chapter.id,
    data: { type: 'chapter', chapter },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const toggleCollapse = () => {
    updateChapter(projectId, chapter.id, { isCollapsed: !chapter.isCollapsed });
  };

  const handleAddScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapter.isCollapsed) {
      updateChapter(projectId, chapter.id, { isCollapsed: false });
    }
    const sceneId = await addScene(projectId, chapter.id);
    selectScene(projectId, chapter.id, sceneId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(UI.deleteChapterConfirm)) {
      deleteChapter(projectId, chapter.id);
    }
  };

  const commitRename = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== chapter.title) {
      updateChapter(projectId, chapter.id, { title: trimmed });
    } else {
      setEditTitle(chapter.title);
    }
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="flex items-center gap-1 px-2 py-2 text-sm font-medium cursor-pointer select-none
          text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50
          transition-colors duration-100"
        onClick={toggleCollapse}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-400 p-0.5"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>

        <span className="flex-shrink-0 text-gray-400">
          {chapter.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>

        {editing ? (
          <input
            className="flex-1 bg-white dark:bg-gray-800 border border-plume-400 rounded px-1.5 py-0.5 text-sm focus:outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setEditTitle(chapter.title); setEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="flex-1 truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditTitle(chapter.title);
              setEditing(true);
            }}
          >
            {chapter.title}
          </span>
        )}

        <WordCountBadge count={chapterWordCount} />

        {hovering && (
          <div className="flex items-center gap-0.5">
            <button
              className="p-0.5 text-gray-300 hover:text-plume-500 dark:text-gray-600 dark:hover:text-plume-400"
              onClick={handleAddScene}
              title={UI.newScene}
            >
              <Plus size={14} />
            </button>
            <button
              className="p-0.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
              onClick={handleDelete}
              title={UI.deleteChapter}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {!chapter.isCollapsed && (
        <SortableContext items={sceneIds} strategy={verticalListSortingStrategy}>
          <div>
            {chapter.scenes.map((scene) => (
              <SceneNode
                key={scene.id}
                scene={scene}
                projectId={projectId}
                chapterId={chapter.id}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
