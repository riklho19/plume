import { useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCollaborationStore } from '../../store/useCollaborationStore';
import { getCollaboration, destroyCollaboration } from '../../lib/collaboration';
import { useAutoSave } from '../../hooks/useAutoSave';
import { UI } from '../../lib/constants';
import { EditorToolbar } from './EditorToolbar';
import { AuthorHighlight } from '../../extensions/AuthorHighlight';
import { YjsCollaboration } from '../../extensions/YjsCollaboration';
import * as versionsApi from '../../lib/api/versions';
import { countWords } from '../../lib/wordCount';
import '../../styles/editor.css';
import '../../styles/collaboration.css';

interface TipTapEditorProps {
  projectId: string;
  chapterId: string;
  sceneId: string;
}

const AUTHOR_COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed'];

const COLLAB_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#7c2d12', '#0891b2', '#4f46e5', '#be185d', '#65a30d',
];

function userIdHash(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getUserColor(userId: string): string {
  return COLLAB_COLORS[userIdHash(userId) % COLLAB_COLORS.length];
}

export function TipTapEditor({ projectId, chapterId, sceneId }: TipTapEditorProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId) || s.sharedProjects.find((p) => p.id === projectId)
  );
  const chapter = project?.chapters.find((ch) => ch.id === chapterId);
  const scene = chapter?.scenes.find((sc) => sc.id === sceneId);

  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const setConnected = useCollaborationStore((s) => s.setConnected);
  const setUsers = useCollaborationStore((s) => s.setUsers);

  const { save, flush } = useAutoSave(projectId, chapterId, sceneId);

  const userName = profile?.display_name || 'Anonyme';
  const userColor = getUserColor(user?.id || 'default');

  const isOwner = project?.ownerId === user?.id;
  const authorColor = !isOwner
    ? AUTHOR_COLORS[userIdHash(user?.id || '') % AUTHOR_COLORS.length]
    : null;

  const initializedRef = useRef(false);

  // Create collaboration synchronously (cached per sceneId)
  const collab = useMemo(() => {
    return getCollaboration(sceneId, userName, userColor);
  }, [sceneId, userName, userColor]);

  // Manage provider events
  useEffect(() => {
    const p = collab.provider;

    const handleStatus = ({ status }: { status: string }) => {
      setConnected(status === 'connected');
    };
    p.on('status', handleStatus);

    // Check if already connected (event may have fired before handler attached)
    if ((p as unknown as { wsconnected: boolean }).wsconnected) {
      setConnected(true);
    }

    const handleAwareness = () => {
      const states = p.awareness.getStates();
      const users: { name: string; color: string; clientId: number }[] = [];
      states.forEach((state, clientId) => {
        if (state.user && clientId !== collab.doc.clientID) {
          users.push({ ...state.user, clientId });
        }
      });
      setUsers(users);
    };
    p.awareness.on('change', handleAwareness);

    return () => {
      p.off('status', handleStatus);
      p.awareness.off('change', handleAwareness);
      destroyCollaboration(sceneId);
      setConnected(false);
      setUsers([]);
    };
  }, [collab, sceneId, setConnected, setUsers]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        undoRedo: false,
      }),
      UnderlineExt,
      Placeholder.configure({
        placeholder: UI.editorPlaceholder,
      }),
      AuthorHighlight.configure({
        authorColor,
      }),
      YjsCollaboration.configure({
        document: collab.doc,
        provider: collab.provider,
        user: { name: userName, color: userColor },
      }),
    ],
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

  // Seed Yjs doc with DB content if empty (first user to open)
  useEffect(() => {
    if (!editor || !scene?.content || initializedRef.current) return;
    const timer = setTimeout(() => {
      const docContent = editor.getHTML();
      if (docContent === '<p></p>' || docContent === '') {
        editor.commands.setContent(scene.content, { emitUpdate: false });
      }
      initializedRef.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [editor, scene?.content]);

  useEffect(() => {
    initializedRef.current = false;
  }, [sceneId]);

  // Create initial version snapshot
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
