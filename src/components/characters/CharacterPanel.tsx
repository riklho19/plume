import { useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { UI } from '../../lib/constants';
import { IconButton } from '../ui/IconButton';

interface CharacterPanelProps {
  projectId: string;
}

export function CharacterPanel({ projectId }: CharacterPanelProps) {
  const sceneId = useEditorStore((s) => s.sceneId);
  const toggleCharacterPanel = useEditorStore((s) => s.toggleCharacterPanel);
  const { characters, sceneLinks, loadCharacters, loadSceneLinks, linkToScene, unlinkFromScene } = useCharacterStore();

  useEffect(() => {
    loadCharacters(projectId);
  }, [projectId, loadCharacters]);

  useEffect(() => {
    if (sceneId) loadSceneLinks(sceneId);
  }, [sceneId, loadSceneLinks]);

  const linkedIds = sceneId ? (sceneLinks[sceneId] || []) : [];
  const linked = characters.filter((c) => linkedIds.includes(c.id));
  const unlinked = characters.filter((c) => !linkedIds.includes(c.id));

  return (
    <aside className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-plume-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {UI.characters}
          </span>
        </div>
        <IconButton label="Fermer" size="sm" onClick={toggleCharacterPanel}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {sceneId && (
          <>
            {/* Linked to scene */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {UI.linkedCharacters}
              </p>
              {linked.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Aucun</p>
              ) : (
                <div className="space-y-1">
                  {linked.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => unlinkFromScene(sceneId, c.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Available to link */}
            {unlinked.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {UI.linkCharacters}
                </p>
                <div className="space-y-1">
                  {unlinked.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => linkToScene(sceneId, c.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left opacity-60 hover:opacity-100"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!sceneId && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">
            Sélectionnez une scène pour lier des personnages.
          </p>
        )}
      </div>
    </aside>
  );
}
