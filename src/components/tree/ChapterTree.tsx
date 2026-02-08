import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import type { Project } from '../../types/models';
import { useProjectStore } from '../../store/useProjectStore';
import { useEditorStore } from '../../store/useEditorStore';
import { UI } from '../../lib/constants';
import { ChapterNode } from './ChapterNode';

interface ChapterTreeProps {
  project: Project;
}

export function ChapterTree({ project }: ChapterTreeProps) {
  const { addChapter, reorderChapters, reorderScenes, moveSceneToChapter } = useProjectStore();
  const selectScene = useEditorStore((s) => s.selectScene);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const chapterIds = project.chapters.map((ch) => ch.id);
  const allSceneIds = project.chapters.flatMap((ch) => ch.scenes.map((sc) => sc.id));

  const findChapterForScene = (sceneId: string) => {
    for (const ch of project.chapters) {
      if (ch.scenes.some((sc) => sc.id === sceneId)) return ch;
    }
    return null;
  };

  const isChapter = (id: string) => project.chapters.some((ch) => ch.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Chapter reordering
    if (isChapter(activeIdStr) && isChapter(overIdStr)) {
      const oldIndex = chapterIds.indexOf(activeIdStr);
      const newIndex = chapterIds.indexOf(overIdStr);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...chapterIds];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, activeIdStr);
        reorderChapters(project.id, newOrder);
      }
      return;
    }

    // Scene reordering
    if (!isChapter(activeIdStr)) {
      const fromChapter = findChapterForScene(activeIdStr);
      if (!fromChapter) return;

      // Determine target chapter
      let toChapter = findChapterForScene(overIdStr);
      if (!toChapter && isChapter(overIdStr)) {
        toChapter = project.chapters.find((ch) => ch.id === overIdStr) || null;
      }
      if (!toChapter) return;

      if (fromChapter.id === toChapter.id) {
        // Same chapter reorder
        const sceneIds = fromChapter.scenes.map((sc) => sc.id);
        const oldIndex = sceneIds.indexOf(activeIdStr);
        const newIndex = sceneIds.indexOf(overIdStr);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...sceneIds];
          newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, activeIdStr);
          reorderScenes(project.id, fromChapter.id, newOrder);
        }
      } else {
        // Cross-chapter move
        const targetSceneIds = toChapter.scenes.map((sc) => sc.id);
        const newIndex = targetSceneIds.indexOf(overIdStr);
        moveSceneToChapter(
          project.id,
          fromChapter.id,
          toChapter.id,
          activeIdStr,
          newIndex === -1 ? toChapter.scenes.length : newIndex
        );
      }
    }
  };

  const handleAddChapter = async () => {
    const chapterId = await addChapter(project.id);
    const state = useProjectStore.getState();
    const proj = state.projects.find((p) => p.id === project.id)
      || state.sharedProjects.find((p) => p.id === project.id);
    const sceneId = proj?.chapters.find((ch) => ch.id === chapterId)
      ?.scenes[0]?.id;
    if (sceneId) {
      selectScene(project.id, chapterId, sceneId);
    }
  };

  const activeDragItem = activeId
    ? isChapter(activeId)
      ? project.chapters.find((ch) => ch.id === activeId)
      : project.chapters.flatMap((ch) => ch.scenes).find((sc) => sc.id === activeId)
    : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={[...chapterIds, ...allSceneIds]} strategy={verticalListSortingStrategy}>
          <div className="py-1">
            {project.chapters.map((chapter, index) => (
              <ChapterNode
                key={chapter.id}
                chapter={chapter}
                projectId={project.id}
                index={index}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDragItem ? (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md px-3 py-2 text-sm font-medium border border-plume-300 dark:border-plume-600">
              {'scenes' in activeDragItem ? activeDragItem.title : activeDragItem.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="px-2 py-2">
        <button
          onClick={handleAddChapter}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-plume-600 dark:hover:text-plume-400
            rounded-lg transition-colors"
        >
          <Plus size={14} />
          {UI.newChapter}
        </button>
      </div>
    </div>
  );
}
