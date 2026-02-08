export interface Scene {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
  order: number;
  isCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Genre =
  | 'roman'
  | 'science-fiction'
  | 'fantaisie'
  | 'thriller'
  | 'romance'
  | 'historique'
  | 'policier'
  | 'horreur'
  | 'jeunesse'
  | 'poesie'
  | 'nouvelle'
  | 'autre';

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  genre: Genre;
  isPublic: boolean;
  shareToken: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  preferredFont: string | null;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  description: string;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SceneVersion {
  id: string;
  sceneId: string;
  projectId: string;
  content: string;
  wordCount: number;
  createdBy: string;
  label: string | null;
  createdAt: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'reader';

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  createdAt: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Invitation {
  id: string;
  projectId: string;
  invitedEmail: string;
  role: CollaboratorRole;
  invitedBy: string;
  createdAt: string;
}
