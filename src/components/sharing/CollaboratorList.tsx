import { Trash2, Mail } from 'lucide-react';
import { UI } from '../../lib/constants';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import type { DbCollaborator, DbInvitation } from '../../types/database';

interface CollaboratorListProps {
  collaborators: DbCollaborator[];
  invitations: DbInvitation[];
  onRemoveCollaborator: (id: string) => void;
  onRemoveInvitation: (id: string) => void;
  isOwner: boolean;
}

const roleLabels: Record<string, string> = {
  owner: UI.roleOwner,
  editor: UI.roleEditor,
  reader: UI.roleReader,
};

export function CollaboratorList({
  collaborators,
  invitations,
  onRemoveCollaborator,
  onRemoveInvitation,
  isOwner,
}: CollaboratorListProps) {
  return (
    <div className="space-y-2">
      {collaborators.map((c) => (
        <div key={c.id} className="flex items-center gap-3 py-2">
          <Avatar
            name={c.profile?.display_name || 'Utilisateur'}
            url={c.profile?.avatar_url}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {c.profile?.display_name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500">{roleLabels[c.role]}</p>
          </div>
          {isOwner && c.role !== 'owner' && (
            <IconButton
              label={UI.removeCollaborator}
              size="sm"
              onClick={() => onRemoveCollaborator(c.id)}
            >
              <Trash2 size={14} />
            </IconButton>
          )}
        </div>
      ))}

      {invitations.map((inv) => (
        <div key={inv.id} className="flex items-center gap-3 py-2 opacity-60">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Mail size={12} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {inv.invited_email}
            </p>
            <p className="text-xs text-gray-400">{roleLabels[inv.role]} (en attente)</p>
          </div>
          {isOwner && (
            <IconButton
              label={UI.removeCollaborator}
              size="sm"
              onClick={() => onRemoveInvitation(inv.id)}
            >
              <Trash2 size={14} />
            </IconButton>
          )}
        </div>
      ))}
    </div>
  );
}
