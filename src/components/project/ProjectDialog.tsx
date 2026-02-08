import { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/useProjectStore';
import { UI, GENRES } from '../../lib/constants';
import type { Genre, Project } from '../../types/models';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

const genreOptions = Object.entries(GENRES).map(([value, label]) => ({ value, label }));

export function ProjectDialog({ open, onClose, project }: ProjectDialogProps) {
  const { createProject, updateProject } = useProjectStore();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [genre, setGenre] = useState<Genre>('roman');

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSummary(project.summary);
      setGenre(project.genre);
    } else {
      setTitle('');
      setSummary('');
      setGenre('roman');
    }
  }, [project, open]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;

    if (isEditing && project) {
      updateProject(project.id, { title: title.trim(), summary: summary.trim(), genre });
      onClose();
    } else {
      setSaving(true);
      try {
        await createProject(title.trim(), summary.trim(), genre);
        onClose();
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? UI.editProject : UI.newProject}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={UI.projectTitle}
          placeholder={UI.projectTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <Textarea
          label={UI.projectSummary}
          placeholder={UI.projectSummaryPlaceholder}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
        />
        <Select
          label={UI.projectGenre}
          options={genreOptions}
          value={genre}
          onChange={(e) => setGenre(e.target.value as Genre)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {UI.cancel}
          </Button>
          <Button type="submit" disabled={!title.trim() || saving}>
            {saving ? '...' : isEditing ? UI.save : UI.create}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
