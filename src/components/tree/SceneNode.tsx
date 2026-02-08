import { useState } from 'react';
import { FileText, GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Scene } from '../../types/models';
import { WordCountBadge } from '../stats/WordCountBadge';
import { useEditorStore } from '../../store/useEditorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { UI } from '../../lib/constants';

interface SceneNodeProps {
  scene: Scene;
  projectId: string;
  chapterId: string;
}

export function SceneNode({ scene, projectId, chapterId }: SceneNodeProps) {
  const { sceneId, selectScene } = useEditorStore();
  const deleteScene = useProjectStore((s) => s.deleteScene);
  const isActive = sceneId === scene.id;
  const [hovering, setHovering] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: scene.id,
    data: { type: 'scene', chapterId, scene },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-1 pl-7 pr-2 py-1.5 text-sm cursor-pointer select-none
        transition-colors duration-100 group
        ${isActive
          ? 'bg-plume-50 dark:bg-plume-900/20 text-plume-700 dark:text-plume-300 border-l-2 border-plume-500 ml-0'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-l-2 border-transparent'
        }
      `}
      onClick={() => selectScene(projectId, chapterId, scene.id)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-400 p-0.5"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={12} />
      </button>
      <FileText size={13} className="flex-shrink-0 opacity-50" />
      <span className="flex-1 truncate text-xs">{scene.title}</span>
      <WordCountBadge count={scene.wordCount} />
      {hovering && (
        <button
          className="flex-shrink-0 p-0.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(UI.deleteSceneConfirm)) {
              deleteScene(projectId, chapterId, scene.id);
            }
          }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
