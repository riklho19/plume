import { useEffect, useRef } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { useEditorStore } from './store/useEditorStore';
import { useProjectStore } from './store/useProjectStore';
import { useAuthStore } from './store/useAuthStore';
import { AuthGuard } from './components/auth/AuthGuard';
import { ProjectListPage } from './components/project/ProjectListPage';
import { AppLayout } from './components/layout/AppLayout';
import { CharacterListPage } from './components/characters/CharacterListPage';
import { ToastContainer, toastSuccess, toastError } from './components/ui/Toast';
import { acceptInvitation } from './lib/api/collaborators';
import { UI } from './lib/constants';

function App() {
  const theme = useThemeStore((s) => s.theme);
  const projectId = useEditorStore((s) => s.projectId);
  const selectProject = useEditorStore((s) => s.selectProject);
  const goHome = useEditorStore((s) => s.goHome);
  const view = useEditorStore((s) => s.view);
  const projects = useProjectStore((s) => s.projects);
  const sharedProjects = useProjectStore((s) => s.sharedProjects);
  const loaded = useProjectStore((s) => s.loaded);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const user = useAuthStore((s) => s.user);
  const inviteHandled = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load projects when user is authenticated
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  // Handle ?invite= query param after auth + projects loaded
  useEffect(() => {
    if (!user || !loaded || inviteHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (!inviteId) return;

    inviteHandled.current = true;
    // Clean the URL
    window.history.replaceState({}, '', window.location.pathname);

    (async () => {
      try {
        const targetProjectId = await acceptInvitation(inviteId);
        await loadProjects();
        selectProject(targetProjectId);
        toastSuccess(UI.inviteAccepted);
      } catch {
        toastError(UI.inviteError);
      }
    })();
  }, [user, loaded, loadProjects, selectProject]);

  // If selected project doesn't exist in loaded projects, go home
  useEffect(() => {
    if (projectId && loaded) {
      const exists = projects.some((p) => p.id === projectId)
        || sharedProjects.some((p) => p.id === projectId);
      if (!exists) {
        goHome();
      }
    }
  }, [projectId, projects, sharedProjects, loaded, goHome]);

  return (
    <AuthGuard>
      {projectId && view === 'characters' ? (
        <CharacterListPage />
      ) : projectId ? (
        <AppLayout />
      ) : (
        <ProjectListPage />
      )}
      <ToastContainer />
    </AuthGuard>
  );
}

export default App;
