import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import type { Project } from '../../types/models';
import { GENRES, UI } from '../../lib/constants';
import { formatWordCount } from '../../lib/wordCount';
import { IconButton } from '../ui/IconButton';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  shared?: boolean;
}

export function ProjectCard({ project, onClick, onEdit, onDelete, shared }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalWords = project.chapters.reduce(
    (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0),
    0
  );
  const chapterCount = project.chapters.length;
  const sceneCount = project.chapters.reduce((s, ch) => s + ch.scenes.length, 0);

  const lastUpdated = new Date(project.updatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="
        group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800
        hover:border-plume-300 dark:hover:border-plume-700 hover:shadow-lg
        transition-all duration-200 cursor-pointer overflow-hidden
      "
      onClick={onClick}
    >
      {/* Genre accent bar */}
      <div className={`h-1 bg-gradient-to-r ${shared ? 'from-blue-500 to-blue-400' : 'from-plume-500 to-plume-400'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {project.title}
              </h3>
              {shared && (
                <Users size={14} className="text-blue-500 flex-shrink-0" />
              )}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-plume-50 text-plume-700 dark:bg-plume-900/30 dark:text-plume-300">
              {GENRES[project.genre]}
            </span>
          </div>

          {!shared && onEdit && onDelete && (
            <div className="relative">
              <IconButton
                label="Menu"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
              >
                <MoreVertical size={16} />
              </IconButton>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit();
                      }}
                    >
                      <Pencil size={14} />
                      {UI.editProject}
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <Trash2 size={14} />
                      {UI.deleteProject}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {project.summary && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {project.summary}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {chapterCount} {UI.chapters}, {sceneCount} {UI.scenes}
          </span>
          <span>{formatWordCount(totalWords)} {UI.words}</span>
        </div>

        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {lastUpdated}
        </div>
      </div>
    </div>
  );
}
