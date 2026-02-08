import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Users } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { UI } from '../../lib/constants';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UserMenu } from '../auth/UserMenu';
import { Dialog } from '../ui/Dialog';
import { CharacterCard } from './CharacterCard';
import { CharacterDialog } from './CharacterDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Character } from '../../types/models';

export function CharacterListPage() {
  const projectId = useEditorStore((s) => s.projectId);
  const setView = useEditorStore((s) => s.setView);
  const { characters, loading, loadCharacters, createCharacter, updateCharacter, deleteCharacter } = useCharacterStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [deleting, setDeleting] = useState<Character | null>(null);

  useEffect(() => {
    if (projectId) loadCharacters(projectId);
  }, [projectId, loadCharacters]);

  const handleSave = async (data: { name: string; role: string; description: string; notes: string; color: string }) => {
    if (!projectId) return;
    if (editing) {
      await updateCharacter(editing.id, data);
    } else {
      await createCharacter(projectId, data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setView('editor')}>
              <ArrowLeft size={16} />
              {UI.back}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {UI.characters}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {characters.length === 0 ? UI.noCharactersHint : `${characters.length} personnage${characters.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus size={16} />
            {UI.newCharacter}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-plume-100 dark:bg-plume-900/30 flex items-center justify-center mb-4">
              <Users size={28} className="text-plume-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {UI.noCharacters}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {UI.noCharactersHint}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onEdit={() => { setEditing(char); setDialogOpen(true); }}
                onDelete={() => setDeleting(char)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <CharacterDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSave={handleSave}
        character={editing}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={UI.deleteCharacter}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {UI.deleteCharacterConfirm}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {UI.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleting) deleteCharacter(deleting.id);
              setDeleting(null);
            }}
          >
            {UI.delete}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
