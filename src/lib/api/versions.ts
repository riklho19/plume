import { supabase } from '../supabase';
import type { DbSceneVersion } from '../../types/database';

export async function fetchVersions(sceneId: string): Promise<DbSceneVersion[]> {
  const { data, error } = await supabase
    .from('scene_versions')
    .select('*')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as DbSceneVersion[];
}

export async function createVersion(
  sceneId: string,
  projectId: string,
  content: string,
  wordCount: number,
  label?: string
): Promise<DbSceneVersion> {
  const { data, error } = await supabase
    .from('scene_versions')
    .insert({
      scene_id: sceneId,
      project_id: projectId,
      content,
      word_count: wordCount,
      label: label || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbSceneVersion;
}

export async function deleteVersion(id: string): Promise<void> {
  const { error } = await supabase
    .from('scene_versions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
