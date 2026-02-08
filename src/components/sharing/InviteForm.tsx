import { useState, type FormEvent } from 'react';
import { Link2 } from 'lucide-react';
import { UI } from '../../lib/constants';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { createInvitation } from '../../lib/api/collaborators';
import { toastError, toastSuccess } from '../ui/Toast';
import type { Role } from '../../types/database';

interface InviteFormProps {
  projectId: string;
  onInvited: () => void;
}

export function InviteForm({ projectId, onInvited }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const invitationId = await createInvitation(projectId, email, role);
      const link = `${window.location.origin}?invite=${invitationId}`;
      await navigator.clipboard.writeText(link);
      toastSuccess(UI.inviteSent);
      setEmail('');
      onInvited();
    } catch {
      toastError(UI.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          label={UI.inviteEmail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="collaborateur@email.com"
          required
        />
      </div>
      <Select
        options={[
          { value: 'editor', label: UI.roleEditor },
          { value: 'reader', label: UI.roleReader },
        ]}
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="w-28"
      />
      <Button type="submit" disabled={loading} size="md">
        <Link2 size={14} />
      </Button>
    </form>
  );
}
