import { useState, useEffect, useCallback } from 'react';
import { X, Clock, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { UI } from '../../lib/constants';
import { formatWordCount } from '../../lib/wordCount';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import * as versionsApi from '../../lib/api/versions';
import type { DbSceneVersion } from '../../types/database';

interface VersionHistoryPanelProps {
  projectId: string;
}

export function VersionHistoryPanel({ projectId }: VersionHistoryPanelProps) {
  const sceneId = useEditorStore((s) => s.sceneId);
  const chapterId = useEditorStore((s) => s.chapterId);
  const toggleVersionPanel = useEditorStore((s) => s.toggleVersionPanel);
  const updateSceneContent = useProjectStore((s) => s.updateSceneContent);

  const [versions, setVersions] = useState<DbSceneVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState<DbSceneVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<DbSceneVersion | null>(null);

  const loadVersions = useCallback(async () => {
    if (!sceneId) return;
    setLoading(true);
    try {
      const data = await versionsApi.fetchVersions(sceneId);
      setVersions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [sceneId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleRestore = (version: DbSceneVersion) => {
    if (!chapterId || !sceneId) return;
    updateSceneContent(projectId, chapterId, sceneId, version.content);
    setConfirmRestore(null);
    setPreviewing(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-plume-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {UI.versionHistory}
          </span>
        </div>
        <IconButton label="Fermer" size="sm" onClick={toggleVersionPanel}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!sceneId ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">
            Sélectionnez une scène pour voir l'historique.
          </p>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 px-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">{UI.noVersions}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{UI.noVersionsHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {versions.map((v) => (
              <div
                key={v.id}
                className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group"
                onClick={() => setPreviewing(v)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(v.created_at)}
                  </span>
                  <IconButton
                    label={UI.versionRestore}
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmRestore(v);
                    }}
                  >
                    <RotateCcw size={12} />
                  </IconButton>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {formatWordCount(v.word_count)} {UI.words}
                  </span>
                  {v.label && (
                    <span className="text-xs bg-plume-100 dark:bg-plume-900/30 text-plume-700 dark:text-plume-300 px-1.5 py-0.5 rounded">
                      {v.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview panel */}
      {previewing && (
        <div className="border-t border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {UI.versionPreview}
            </span>
            <div className="flex gap-1">
              <Button size="sm" onClick={() => setConfirmRestore(previewing)}>
                {UI.versionRestore}
              </Button>
              <IconButton label="Fermer" size="sm" onClick={() => setPreviewing(null)}>
                <X size={12} />
              </IconButton>
            </div>
          </div>
          <div
            className="p-3 prose prose-sm dark:prose-invert max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: previewing.content }}
          />
        </div>
      )}

      {/* Restore confirmation */}
      <Dialog
        open={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        title={UI.versionRestore}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {UI.versionRestoreConfirm}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmRestore(null)}>
            {UI.cancel}
          </Button>
          <Button onClick={() => confirmRestore && handleRestore(confirmRestore)}>
            {UI.versionRestore}
          </Button>
        </div>
      </Dialog>
    </aside>
  );
}
