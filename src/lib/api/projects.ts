import { supabase } from '../supabase';
import type { DbProject } from '../../types/database';
import type { Genre } from '../../types/models';

export async function fetchOwnProjects(): Promise<DbProject[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as DbProject[];
}

export async function fetchSharedProjects(): Promise<DbProject[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data: collabs } = await supabase
    .from('collaborators')
    .select('project_id')
    .eq('user_id', session.user.id);
  if (!collabs || collabs.length === 0) return [];

  const projectIds = collabs.map((c) => c.project_id);
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds)
    .neq('owner_id', session.user.id)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as DbProject[];
}

export async function createProject(title: string, summary: string, genre: Genre): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ title, summary, genre })
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function updateProject(id: string, updates: { title?: string; summary?: string; genre?: Genre; is_public?: boolean; preferred_font?: string | null }): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
