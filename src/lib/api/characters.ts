import { supabase } from '../supabase';
import type { DbCharacter, DbSceneCharacter } from '../../types/database';

export async function fetchCharacters(projectId: string): Promise<DbCharacter[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data as DbCharacter[];
}

export async function createCharacter(projectId: string, character: {
  name: string;
  role: string;
  description: string;
  notes: string;
  color: string;
}): Promise<DbCharacter> {
  const { data, error } = await supabase
    .from('characters')
    .insert({ project_id: projectId, ...character })
    .select()
    .single();
  if (error) throw error;
  return data as DbCharacter;
}

export async function updateCharacter(id: string, updates: Partial<{
  name: string;
  role: string;
  description: string;
  notes: string;
  color: string;
}>): Promise<void> {
  const { error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function fetchSceneCharacters(sceneId: string): Promise<DbSceneCharacter[]> {
  const { data, error } = await supabase
    .from('scene_characters')
    .select('*')
    .eq('scene_id', sceneId);
  if (error) throw error;
  return data as DbSceneCharacter[];
}

export async function linkCharacterToScene(sceneId: string, characterId: string): Promise<void> {
  const { error } = await supabase
    .from('scene_characters')
    .insert({ scene_id: sceneId, character_id: characterId });
  if (error) throw error;
}

export async function unlinkCharacterFromScene(sceneId: string, characterId: string): Promise<void> {
  const { error } = await supabase
    .from('scene_characters')
    .delete()
    .eq('scene_id', sceneId)
    .eq('character_id', characterId);
  if (error) throw error;
}
