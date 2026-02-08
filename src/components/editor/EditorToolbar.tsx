import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Clock,
  Share2,
  Type,
  Users,
  Merge,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { UI } from '../../lib/constants';
import { useEditorStore } from '../../store/useEditorStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useCollaborationStore } from '../../store/useCollaborationStore';
import { FontSelector } from '../settings/FontSelector';
import { applyEditorFont } from '../../lib/fonts';
import { toastSuccess } from '../ui/Toast';
import * as projectsApi from '../../lib/api/projects';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { toggleVersionPanel, toggleCharacterPanel, setShareDialogOpen, projectId } = useEditorStore();
  const isOwner = useProjectStore((s) => projectId ? s.projects.some((p) => p.id === projectId) : false);
  const { connected, users } = useCollaborationStore();
  const [currentFont, setCurrentFont] = useState<string | null>(null);

  const handleFontChange = (fontId: string) => {
    setCurrentFont(fontId);
    applyEditorFont(fontId);
    if (projectId) {
      projectsApi.updateProject(projectId, { preferred_font: fontId }).catch(() => {});
    }
  };

  if (!editor) return null;

  const tools = [
    {
      icon: <Bold size={16} />,
      label: UI.bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      icon: <Italic size={16} />,
      label: UI.italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      icon: <Underline size={16} />,
      label: UI.underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline'),
    },
    { type: 'separator' as const },
    {
      icon: <Heading1 size={16} />,
      label: UI.heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 size={16} />,
      label: UI.heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 size={16} />,
      label: UI.heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive('heading', { level: 3 }),
    },
    { type: 'separator' as const },
    {
      icon: <List size={16} />,
      label: UI.bulletList,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered size={16} />,
      label: UI.orderedList,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
    },
    {
      icon: <Quote size={16} />,
      label: UI.blockquote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote'),
    },
    { type: 'separator' as const },
    {
      icon: <Undo size={16} />,
      label: UI.undo,
      action: () => editor.chain().focus().undo().run(),
      active: false,
      disabled: !editor.can().undo(),
    },
    {
      icon: <Redo size={16} />,
      label: UI.redo,
      action: () => editor.chain().focus().redo().run(),
      active: false,
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 px-4 sm:px-8 py-2 border-b border-gray-100 dark:border-gray-800 max-w-editor mx-auto w-full flex-wrap">
      {tools.map((tool, i) => {
        if ('type' in tool && tool.type === 'separator') {
          return (
            <div
              key={`sep-${i}`}
              className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"
            />
          );
        }
        const t = tool as { icon: React.ReactNode; label: string; action: () => void; active: boolean; disabled?: boolean };
        return (
          <IconButton
            key={t.label}
            label={t.label}
            size="sm"
            active={t.active}
            disabled={t.disabled}
            onClick={t.action}
          >
            {t.icon}
          </IconButton>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Online users indicator */}
      {users.length > 0 && (
        <div className="flex items-center gap-1 mr-2">
          {users.slice(0, 3).map((u) => (
            <div
              key={u.clientId}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: u.color }}
              title={u.name}
            />
          ))}
          {users.length > 3 && (
            <span className="text-xs text-gray-400">+{users.length - 3}</span>
          )}
        </div>
      )}

      {/* Right-side actions */}
      <div className="flex items-center gap-0.5">
        {isOwner && (
          <IconButton
            label={UI.mergeAuthors}
            size="sm"
            onClick={() => {
              editor.chain().focus().mergeAuthors().run();
              toastSuccess(UI.mergeAuthorsDone);
            }}
          >
            <Merge size={16} />
          </IconButton>
        )}
        <FontSelector currentFontId={currentFont} onSelect={handleFontChange} />
        <IconButton label={UI.characters} size="sm" onClick={toggleCharacterPanel}>
          <Users size={16} />
        </IconButton>
        <IconButton label={UI.versionHistory} size="sm" onClick={toggleVersionPanel}>
          <Clock size={16} />
        </IconButton>
        <IconButton label={UI.share} size="sm" onClick={() => setShareDialogOpen(true)}>
          <Share2 size={16} />
        </IconButton>
      </div>
    </div>
  );
}
