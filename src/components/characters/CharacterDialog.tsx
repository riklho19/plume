import { useState, useEffect, type FormEvent } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { UI } from '../../lib/constants';
import type { Character } from '../../types/models';

interface CharacterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; role: string; description: string; notes: string; color: string }) => void;
  character?: Character | null;
}

const COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#4f46e5', '#be185d', '#65a30d', '#6366f1',
];

export function CharacterDialog({ open, onClose, onSave, character }: CharacterDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (character) {
      setName(character.name);
      setRole(character.role);
      setDescription(character.description);
      setNotes(character.notes);
      setColor(character.color);
    } else {
      setName('');
      setRole('');
      setDescription('');
      setNotes('');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  }, [character, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, role, description, notes, color });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={character ? UI.editCharacter : UI.newCharacter}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={UI.characterName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={UI.characterNamePlaceholder}
          required
        />
        <Input
          label={UI.characterRole}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder={UI.characterRolePlaceholder}
        />
        <Textarea
          label={UI.characterDescription}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={UI.characterDescriptionPlaceholder}
          rows={3}
        />
        <Textarea
          label={UI.characterNotes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={UI.characterNotesPlaceholder}
          rows={2}
        />

        {/* Color picker */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            {UI.characterColor}
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-plume-500 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {UI.cancel}
          </Button>
          <Button type="submit">
            {character ? UI.save : UI.create}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
