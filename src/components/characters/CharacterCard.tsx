import { Pencil, Trash2 } from 'lucide-react';
import type { Character } from '../../types/models';
import { IconButton } from '../ui/IconButton';
import { UI } from '../../lib/constants';

interface CharacterCardProps {
  character: Character;
  onEdit: () => void;
  onDelete: () => void;
}

export function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-plume-300 dark:hover:border-plume-700 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: character.color }}
        >
          {character.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {character.name}
            </h3>
            <div className="flex items-center gap-1">
              <IconButton label={UI.editCharacter} size="sm" onClick={onEdit}>
                <Pencil size={14} />
              </IconButton>
              <IconButton label={UI.deleteCharacter} size="sm" onClick={onDelete}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          </div>
          {character.role && (
            <p className="text-xs text-plume-600 dark:text-plume-400 mt-0.5">
              {character.role}
            </p>
          )}
          {character.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {character.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
