import { useEditorStore } from '../../store/useEditorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { EmptyState } from './EmptyState';
import { SceneHeader } from './SceneHeader';
import { TipTapEditor } from './TipTapEditor';
import { WordCountPanel } from '../stats/WordCountPanel';

export function EditorArea() {
  const { projectId, chapterId, sceneId } = useEditorStore();
  const project = useProjectStore((s) =>
    projectId
      ? s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
      : undefined
  );

  if (!projectId || !chapterId || !sceneId || !project) {
    return <EmptyState />;
  }

  const chapter = project.chapters.find((ch) => ch.id === chapterId);
  const scene = chapter?.scenes.find((sc) => sc.id === sceneId);

  if (!chapter || !scene) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-950">
      <SceneHeader projectId={projectId} chapterId={chapterId} sceneId={sceneId} />
      <TipTapEditor
        key={sceneId}
        projectId={projectId}
        chapterId={chapterId}
        sceneId={sceneId}
      />
      <WordCountPanel projectId={projectId} chapterId={chapterId} sceneId={sceneId} />
    </div>
  );
}
