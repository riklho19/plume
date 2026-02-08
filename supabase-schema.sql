-- Plume Phase 2 - Database Schema
-- Run this in Supabase SQL Editor

-- Helper function for access control
CREATE OR REPLACE FUNCTION has_project_access(p_project_id UUID, min_role TEXT DEFAULT 'reader')
RETURNS BOOLEAN AS $$
BEGIN
  -- Owner always has access
  IF EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND owner_id = auth.uid()) THEN
    RETURN TRUE;
  END IF;

  -- Check collaborator role
  IF min_role = 'reader' THEN
    RETURN EXISTS (
      SELECT 1 FROM collaborators
      WHERE project_id = p_project_id AND user_id = auth.uid()
    );
  ELSIF min_role = 'editor' THEN
    RETURN EXISTS (
      SELECT 1 FROM collaborators
      WHERE project_id = p_project_id AND user_id = auth.uid() AND role IN ('editor', 'owner')
    );
  ELSIF min_role = 'owner' THEN
    RETURN EXISTS (
      SELECT 1 FROM projects WHERE id = p_project_id AND owner_id = auth.uid()
    );
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  preferred_font TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL DEFAULT 'Sans titre',
  summary TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT 'roman',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  preferred_font TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collaborators
CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'reader')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'reader')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, invited_email)
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Chapitre sans titre',
  "order" INT NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scenes
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Scène sans titre',
  content TEXT NOT NULL DEFAULT '',
  "order" INT NOT NULL DEFAULT 0,
  word_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scene Versions
CREATE TABLE scene_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  word_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Characters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scene ↔ Character link
CREATE TABLE scene_characters (
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (scene_id, character_id)
);

-- Yjs document snapshots
CREATE TABLE yjs_documents (
  scene_id UUID PRIMARY KEY REFERENCES scenes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data BYTEA,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_chapters_project ON chapters(project_id);
CREATE INDEX idx_scenes_chapter ON scenes(chapter_id);
CREATE INDEX idx_scenes_project ON scenes(project_id);
CREATE INDEX idx_collaborators_project ON collaborators(project_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_invitations_project ON invitations(project_id);
CREATE INDEX idx_invitations_email ON invitations(invited_email);
CREATE INDEX idx_scene_versions_scene ON scene_versions(scene_id);
CREATE INDEX idx_characters_project ON characters(project_id);
CREATE INDEX idx_scene_characters_scene ON scene_characters(scene_id);
CREATE INDEX idx_scene_characters_character ON scene_characters(character_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE yjs_documents ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Projects
CREATE POLICY "Owner can do anything" ON projects FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Collaborators can view" ON projects FOR SELECT USING (
  is_public OR has_project_access(id, 'reader')
);

-- Collaborators
CREATE POLICY "Owner manages collaborators" ON collaborators FOR ALL USING (
  has_project_access(project_id, 'owner')
);
CREATE POLICY "Collaborators can view" ON collaborators FOR SELECT USING (
  has_project_access(project_id, 'reader')
);

-- Invitations
CREATE POLICY "Owner manages invitations" ON invitations FOR ALL USING (
  has_project_access(project_id, 'owner')
);

-- Chapters
CREATE POLICY "Access via project" ON chapters FOR ALL USING (
  has_project_access(project_id, 'reader')
);

-- Scenes
CREATE POLICY "Access via project" ON scenes FOR ALL USING (
  has_project_access(project_id, 'reader')
);

-- Scene Versions
CREATE POLICY "Access via project" ON scene_versions FOR ALL USING (
  has_project_access(project_id, 'reader')
);

-- Characters
CREATE POLICY "Access via project" ON characters FOR ALL USING (
  has_project_access(project_id, 'reader')
);

-- Scene Characters
CREATE POLICY "Access via scene's project" ON scene_characters FOR ALL USING (
  EXISTS (SELECT 1 FROM scenes WHERE scenes.id = scene_id AND has_project_access(scenes.project_id, 'reader'))
);

-- Yjs Documents
CREATE POLICY "Access via project" ON yjs_documents FOR ALL USING (
  has_project_access(project_id, 'reader')
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-accept invitations when user signs up
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collaborators (project_id, user_id, role)
  SELECT i.project_id, NEW.id, i.role
  FROM invitations i
  WHERE i.invited_email = NEW.email
  ON CONFLICT (project_id, user_id) DO NOTHING;

  DELETE FROM invitations WHERE invited_email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_accept_invitations
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_acceptance();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_yjs_documents_updated_at BEFORE UPDATE ON yjs_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
