import { useProjectStore } from '../../store/useProjectStore';

interface SceneHeaderProps {
  projectId: string;
  chapterId: string;
  sceneId: string;
}

export function SceneHeader({ projectId, chapterId, sceneId }: SceneHeaderProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );
  const updateSceneTitle = useProjectStore((s) => s.updateSceneTitle);

  const chapter = project?.chapters.find((ch) => ch.id === chapterId);
  const scene = chapter?.scenes.find((sc) => sc.id === sceneId);

  if (!chapter || !scene) return null;

  return (
    <div className="px-4 sm:px-8 pt-6 pb-2 max-w-editor mx-auto w-full">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
        {chapter.title}
      </p>
      <input
        type="text"
        value={scene.title}
        onChange={(e) => updateSceneTitle(projectId, chapterId, sceneId, e.target.value)}
        className="
          w-full bg-transparent text-xl font-bold text-gray-900 dark:text-gray-100
          placeholder:text-gray-300 dark:placeholder:text-gray-600
          focus:outline-none border-none p-0
        "
        placeholder="Titre de la scène..."
      />
    </div>
  );
}
