import { useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { EditorArea } from '../editor/EditorArea';
import { IconButton } from '../ui/IconButton';
import { ShareDialog } from '../sharing/ShareDialog';
import { CharacterPanel } from '../characters/CharacterPanel';
import { VersionHistoryPanel } from '../versions/VersionHistoryPanel';

export function AppLayout() {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, projectId, isShareDialogOpen, setShareDialogOpen, isCharacterPanelOpen, isVersionPanelOpen } = useEditorStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Auto-close sidebar on mobile when scene is selected
  const sceneId = useEditorStore((s) => s.sceneId);
  useEffect(() => {
    if (!isDesktop && sceneId) {
      setSidebarOpen(false);
    }
  }, [sceneId, isDesktop, setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Desktop sidebar */}
      {isDesktop && (
        <aside className="w-sidebar flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          <Sidebar />
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      {!isDesktop && isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-gray-900 shadow-2xl">
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {!isDesktop && (
          <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <IconButton label="Menu" onClick={toggleSidebar}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </div>
        )}

        <EditorArea />
      </div>

      {/* Right side panels */}
      {isCharacterPanelOpen && projectId && (
        <CharacterPanel projectId={projectId} />
      )}
      {isVersionPanelOpen && projectId && (
        <VersionHistoryPanel projectId={projectId} />
      )}

      {/* Share dialog */}
      {projectId && (
        <ShareDialog
          open={isShareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          projectId={projectId}
        />
      )}
    </div>
  );
}
