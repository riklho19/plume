import { useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { useCharacterStore } from '../../store/useCharacterStore';
import { UI } from '../../lib/constants';

interface CharacterLinkDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sceneId: string;
}

export function CharacterLinkDialog({ open, onClose, projectId, sceneId }: CharacterLinkDialogProps) {
  const { characters, sceneLinks, loadCharacters, loadSceneLinks, linkToScene, unlinkFromScene } = useCharacterStore();

  useEffect(() => {
    if (open) {
      loadCharacters(projectId);
      loadSceneLinks(sceneId);
    }
  }, [open, projectId, sceneId, loadCharacters, loadSceneLinks]);

  const linkedIds = sceneLinks[sceneId] || [];

  const toggle = (characterId: string) => {
    if (linkedIds.includes(characterId)) {
      unlinkFromScene(sceneId, characterId);
    } else {
      linkToScene(sceneId, characterId);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={UI.linkCharacters}>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {characters.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">{UI.noCharacters}</p>
        ) : (
          characters.map((c) => {
            const linked = linkedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${linked
                    ? 'bg-plume-50 dark:bg-plume-900/20 border border-plume-200 dark:border-plume-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {c.name}
                  </p>
                  {c.role && (
                    <p className="text-xs text-gray-500 truncate">{c.role}</p>
                  )}
                </div>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  linked ? 'bg-plume-600 border-plume-600' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {linked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </Dialog>
  );
}
