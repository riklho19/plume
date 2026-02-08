-- Accept invitation RPC function
-- Anyone with the link can accept (no email check)
-- Already deployed to Supabase

CREATE OR REPLACE FUNCTION accept_invitation(p_invitation_id UUID)
RETURNS UUID AS $$
DECLARE
  v_invitation invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation FROM invitations WHERE id = p_invitation_id;

  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invitation introuvable';
  END IF;

  -- Create collaborator record for the current user
  INSERT INTO collaborators (project_id, user_id, role)
  VALUES (v_invitation.project_id, auth.uid(), v_invitation.role)
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- Delete the invitation (single-use)
  DELETE FROM invitations WHERE id = p_invitation_id;

  RETURN v_invitation.project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
