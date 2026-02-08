export type Role = 'owner' | 'editor' | 'reader';

export interface DbProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_font: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  genre: string;
  is_public: boolean;
  share_token: string;
  preferred_font: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbChapter {
  id: string;
  project_id: string;
  title: string;
  "order": number;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbScene {
  id: string;
  chapter_id: string;
  project_id: string;
  title: string;
  content: string;
  "order": number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: Role;
  created_at: string;
  profile?: DbProfile;
}

export interface DbInvitation {
  id: string;
  project_id: string;
  invited_email: string;
  role: Role;
  invited_by: string;
  created_at: string;
}

export interface DbSceneVersion {
  id: string;
  scene_id: string;
  project_id: string;
  content: string;
  word_count: number;
  created_by: string;
  label: string | null;
  created_at: string;
}

export interface DbCharacter {
  id: string;
  project_id: string;
  name: string;
  role: string;
  description: string;
  notes: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbSceneCharacter {
  scene_id: string;
  character_id: string;
}

export interface DbYjsDocument {
  scene_id: string;
  project_id: string;
  data: string; // base64 encoded
  updated_at: string;
}
