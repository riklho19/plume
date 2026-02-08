import { supabase } from '../supabase';
import type { DbScene } from '../../types/database';

export async function fetchScenes(projectId: string): Promise<DbScene[]> {
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });
  if (error) throw error;
  return data as DbScene[];
}

export async function createScene(projectId: string, chapterId: string, title: string, order: number): Promise<DbScene> {
  const { data, error } = await supabase
    .from('scenes')
    .insert({ project_id: projectId, chapter_id: chapterId, title, order, content: '', word_count: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as DbScene;
}

export async function updateScene(id: string, updates: { title?: string; content?: string; word_count?: number; order?: number; chapter_id?: string }): Promise<void> {
  const { error } = await supabase
    .from('scenes')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteScene(id: string): Promise<void> {
  const { error } = await supabase
    .from('scenes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function reorderScenes(sceneIds: string[]): Promise<void> {
  const updates = sceneIds.map((id, index) =>
    supabase.from('scenes').update({ order: index }).eq('id', id)
  );
  await Promise.all(updates);
}
