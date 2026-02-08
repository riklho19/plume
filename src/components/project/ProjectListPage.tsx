import { useState, useEffect } from 'react';
import { Plus, Feather } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useEditorStore } from '../../store/useEditorStore';
import { UI } from '../../lib/constants';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UserMenu } from '../auth/UserMenu';
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import { Dialog } from '../ui/Dialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Project } from '../../types/models';

export function ProjectListPage() {
  const projects = useProjectStore((s) => s.projects);
  const sharedProjects = useProjectStore((s) => s.sharedProjects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const selectProject = useEditorStore((s) => s.selectProject);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loading = useProjectStore((s) => s.loading);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // loadProjects is called in App.tsx when user authenticates

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-plume-600 flex items-center justify-center">
              <Feather size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {UI.appName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* My Projects */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {UI.myProjects}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {projects.length === 0 ? UI.noProjectsHint : `${projects.length} projet${projects.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <Button onClick={() => { setEditingProject(null); setDialogOpen(true); }}>
                <Plus size={16} />
                {UI.newProject}
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-plume-100 dark:bg-plume-900/30 flex items-center justify-center mb-4">
                  <Feather size={28} className="text-plume-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {UI.noProjects}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {UI.noProjectsHint}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => selectProject(project.id)}
                    onEdit={() => { setEditingProject(project); setDialogOpen(true); }}
                    onDelete={() => setDeletingProject(project)}
                  />
                ))}
              </div>
            )}

            {/* Shared With Me */}
            {sharedProjects.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {UI.sharedWithMe}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => selectProject(project.id)}
                      shared
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <ProjectDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingProject(null); }}
        project={editingProject}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title={UI.deleteProject}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {UI.deleteConfirm}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeletingProject(null)}>
            {UI.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deletingProject) deleteProject(deletingProject.id);
              setDeletingProject(null);
            }}
          >
            {UI.delete}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
