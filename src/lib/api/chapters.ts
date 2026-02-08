import { supabase } from '../supabase';
import type { DbChapter } from '../../types/database';

export async function fetchChapters(projectId: string): Promise<DbChapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });
  if (error) throw error;
  return data as DbChapter[];
}

export async function createChapter(projectId: string, title: string, order: number): Promise<DbChapter> {
  const { data, error } = await supabase
    .from('chapters')
    .insert({ project_id: projectId, title, order })
    .select()
    .single();
  if (error) throw error;
  return data as DbChapter;
}

export async function updateChapter(id: string, updates: { title?: string; is_collapsed?: boolean; order?: number }): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteChapter(id: string): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function reorderChapters(chapterIds: string[]): Promise<void> {
  const updates = chapterIds.map((id, index) =>
    supabase.from('chapters').update({ order: index }).eq('id', id)
  );
  await Promise.all(updates);
}
