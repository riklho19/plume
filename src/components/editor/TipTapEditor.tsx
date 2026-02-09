import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import { UI } from '../../lib/constants';
import { EditorToolbar } from './EditorToolbar';
import { AuthorHighlight } from '../../extensions/AuthorHighlight';
import * as versionsApi from '../../lib/api/versions';
import { countWords } from '../../lib/wordCount';
import '../../styles/editor.css';

interface TipTapEditorProps {
  projectId: string;
  chapterId: string;
  sceneId: string;
}

// Author text colors: blue, green, red, violet
const AUTHOR_COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed'];

function userIdHash(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function TipTapEditor({ projectId, chapterId, sceneId }: TipTapEditorProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );
  const chapter = project?.chapters.find((ch) => ch.id === chapterId);
  const scene = chapter?.scenes.find((sc) => sc.id === sceneId);

  const user = useAuthStore((s) => s.user);

  const { save, flush } = useAutoSave(projectId, chapterId, sceneId);

  // Owner writes in black (no highlight), collaborators get a distinct color
  const isOwner = project?.ownerId === user?.id;
  const authorColor = !isOwner
    ? AUTHOR_COLORS[userIdHash(user?.id || '') % AUTHOR_COLORS.length]
    : null;

  const initializedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExt,
      Placeholder.configure({
        placeholder: UI.editorPlaceholder,
      }),
      AuthorHighlight.configure({
        authorColor,
      }),
    ],
    content: scene?.content || '',
    onUpdate: ({ editor }) => {
      save(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'px-4 sm:px-8 py-4 max-w-editor mx-auto w-full focus:outline-none',
      },
    },
  }, [sceneId, authorColor]);

  // Manage author highlight marks
  useEffect(() => {
    if (!editor) return;

    if (authorColor) {
      const ensureMark = () => {
        if (!editor.isActive('authorHighlight')) {
          editor.commands.setMark('authorHighlight', { color: authorColor });
        }
      };
      ensureMark();
      editor.on('selectionUpdate', ensureMark);
      return () => { editor.off('selectionUpdate', ensureMark); };
    } else {
      const removeMark = () => {
        if (editor.isActive('authorHighlight')) {
          editor.commands.unsetMark('authorHighlight');
        }
      };
      removeMark();
      editor.on('selectionUpdate', removeMark);
      return () => { editor.off('selectionUpdate', removeMark); };
    }
  }, [editor, authorColor]);

  // Update editor content when scene changes
  useEffect(() => {
    if (!editor || !scene?.content || initializedRef.current) return;
    const docContent = editor.getHTML();
    if (docContent === '<p></p>' || docContent === '') {
      editor.commands.setContent(scene.content, { emitUpdate: false });
    }
    initializedRef.current = true;
  }, [editor, scene?.content]);

  useEffect(() => {
    initializedRef.current = false;
  }, [sceneId]);

  // Create initial version snapshot when scene is first loaded with content
  useEffect(() => {
    if (!scene?.content || !scene.content.trim() || scene.content === '<p></p>') return;
    versionsApi.fetchVersions(sceneId).then((versions) => {
      if (versions.length === 0) {
        const wc = countWords(scene.content);
        versionsApi.createVersion(sceneId, projectId, scene.content, wc, UI.versionInitial).catch(() => {});
      }
    }).catch(() => {});
  }, [sceneId, projectId]);

  // Ctrl+S to force save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        flush(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flush]);

  useEffect(() => {
    return () => { flush(); };
  }, [flush]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
