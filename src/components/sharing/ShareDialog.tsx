import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Globe, Lock } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { UI } from '../../lib/constants';
import { InviteForm } from './InviteForm';
import { CollaboratorList } from './CollaboratorList';
import { toastSuccess, toastError } from '../ui/Toast';
import * as collabApi from '../../lib/api/collaborators';
import * as projectsApi from '../../lib/api/projects';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { DbCollaborator, DbInvitation } from '../../types/database';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function ShareDialog({ open, onClose, projectId }: ShareDialogProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );
  const userId = useAuthStore((s) => s.user?.id);

  const [collaborators, setCollaborators] = useState<DbCollaborator[]>([]);
  const [invitations, setInvitations] = useState<DbInvitation[]>([]);
  const [isPublic, setIsPublic] = useState(project?.isPublic ?? false);
  const [copied, setCopied] = useState(false);

  const isOwner = !!(project && useProjectStore.getState().projects.find((p) => p.id === projectId));

  const loadData = useCallback(async () => {
    if (!open) return;
    const [collabResult, inviteResult] = await Promise.allSettled([
      collabApi.fetchCollaborators(projectId),
      collabApi.fetchInvitations(projectId),
    ]);
    if (collabResult.status === 'fulfilled') setCollaborators(collabResult.value);
    if (inviteResult.status === 'fulfilled') setInvitations(inviteResult.value);
  }, [open, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePublic = async () => {
    const newValue = !isPublic;
    setIsPublic(newValue);
    try {
      await projectsApi.updateProject(projectId, { is_public: newValue });
    } catch {
      setIsPublic(!newValue);
      toastError(UI.errorGeneric);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}?project=${projectId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toastSuccess(UI.shareLinkCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveCollaborator = async (id: string) => {
    try {
      await collabApi.removeCollaborator(id);
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toastError(UI.errorGeneric);
    }
  };

  const handleRemoveInvitation = async (id: string) => {
    try {
      await collabApi.deleteInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toastError(UI.errorGeneric);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onClose={onClose} title={UI.shareProject}>
      <div className="space-y-6">
        {/* Public toggle */}
        {isOwner && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe size={16} className="text-green-500" /> : <Lock size={16} className="text-gray-400" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {UI.sharePublicToggle}
                </p>
                <p className="text-xs text-gray-500">{UI.sharePublicDesc}</p>
              </div>
            </div>
            <button
              onClick={togglePublic}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${isPublic ? 'bg-plume-600' : 'bg-gray-300 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isPublic ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        )}

        {/* Share link */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {UI.shareLink}
          </p>
          <Button variant="secondary" size="sm" onClick={copyLink} className="w-full justify-center">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? UI.shareLinkCopied : UI.shareLink}
          </Button>
        </div>

        {/* Invite form */}
        {isOwner && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {UI.inviteCollaborator}
            </p>
            <InviteForm projectId={projectId} onInvited={loadData} />
          </div>
        )}

        {/* Collaborator list */}
        {(collaborators.length > 0 || invitations.length > 0) && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {UI.collaborators}
            </p>
            <CollaboratorList
              collaborators={collaborators}
              invitations={invitations}
              onRemoveCollaborator={handleRemoveCollaborator}
              onRemoveInvitation={handleRemoveInvitation}
              isOwner={isOwner}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
