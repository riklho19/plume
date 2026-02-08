import { fetchChapters } from './chapters';
import { fetchScenes } from './scenes';
import type { DbProject } from '../../types/database';
import type { Project, Chapter, Scene } from '../../types/models';

export function dbProjectToProject(dbProject: DbProject, chapters: Chapter[]): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    summary: dbProject.summary,
    genre: dbProject.genre as Project['genre'],
    isPublic: dbProject.is_public,
    shareToken: dbProject.share_token,
    chapters,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
  };
}

export async function hydrateProject(dbProject: DbProject): Promise<Project> {
  const dbChapters = await fetchChapters(dbProject.id);
  const dbScenes = await fetchScenes(dbProject.id);

  const chapters: Chapter[] = dbChapters.map((ch) => {
    const chapterScenes: Scene[] = dbScenes
      .filter((sc) => sc.chapter_id === ch.id)
      .sort((a, b) => a.order - b.order)
      .map((sc) => ({
        id: sc.id,
        title: sc.title,
        content: sc.content,
        order: sc.order,
        wordCount: sc.word_count,
        createdAt: sc.created_at,
        updatedAt: sc.updated_at,
      }));

    return {
      id: ch.id,
      title: ch.title,
      scenes: chapterScenes,
      order: ch.order,
      isCollapsed: ch.is_collapsed,
      createdAt: ch.created_at,
      updatedAt: ch.updated_at,
    };
  });

  return dbProjectToProject(dbProject, chapters);
}

export async function hydrateProjects(dbProjects: DbProject[]): Promise<Project[]> {
  return Promise.all(dbProjects.map(hydrateProject));
}
