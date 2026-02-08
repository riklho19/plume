import { supabase } from '../supabase';
import type { DbCollaborator, DbInvitation, Role } from '../../types/database';

export async function fetchCollaborators(projectId: string): Promise<DbCollaborator[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  const collabs = (data || []) as DbCollaborator[];

  // Fetch profiles separately (no direct FK between collaborators and profiles)
  const userIds = collabs.map((c) => c.user_id);
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);
    if (profiles) {
      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      for (const c of collabs) {
        const p = profileMap.get(c.user_id);
        if (p) c.profile = p as DbCollaborator['profile'];
      }
    }
  }
  return collabs;
}

export async function addCollaborator(projectId: string, userId: string, role: Role): Promise<void> {
  const { error } = await supabase
    .from('collaborators')
    .insert({ project_id: projectId, user_id: userId, role });
  if (error) throw error;
}

export async function removeCollaborator(id: string): Promise<void> {
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateCollaboratorRole(id: string, role: Role): Promise<void> {
  const { error } = await supabase
    .from('collaborators')
    .update({ role })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchInvitations(projectId: string): Promise<DbInvitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  return data as DbInvitation[];
}

export async function createInvitation(projectId: string, email: string, role: Role): Promise<string> {
  const { data, error } = await supabase
    .from('invitations')
    .insert({ project_id: projectId, invited_email: email, role })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function acceptInvitation(invitationId: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_invitation', {
    p_invitation_id: invitationId,
  });
  if (error) throw error;
  return data as string;
}

export async function deleteInvitation(id: string): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
