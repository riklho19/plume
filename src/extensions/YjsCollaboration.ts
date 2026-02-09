import { Extension } from '@tiptap/core';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undoCommand, redoCommand } from 'y-prosemirror';
import { keymap } from '@tiptap/pm/keymap';
import type * as Y from 'yjs';
import type { WebsocketProvider } from 'y-partykit/provider';

export interface YjsCollaborationOptions {
  document: Y.Doc;
  provider: WebsocketProvider;
  user: { name: string; color: string };
}

function cursorBuilder(user: { name: string; color: string }): HTMLElement {
  const cursor = document.createElement('span');
  cursor.classList.add('yjs-cursor');
  cursor.style.borderColor = user.color;
  const label = document.createElement('div');
  label.classList.add('yjs-cursor-label');
  label.style.backgroundColor = user.color;
  label.textContent = user.name;
  cursor.appendChild(label);
  return cursor;
}

export const YjsCollaboration = Extension.create<YjsCollaborationOptions>({
  name: 'yjsCollaboration',

  addCommands() {
    return {
      undo: () => ({ state, dispatch }) => undoCommand(state, dispatch),
      redo: () => ({ state, dispatch }) => redoCommand(state, dispatch),
    };
  },

  addProseMirrorPlugins() {
    const fragment = this.options.document.getXmlFragment('default');
    return [
      ySyncPlugin(fragment),
      yCursorPlugin(this.options.provider.awareness, { cursorBuilder }),
      yUndoPlugin(),
      keymap({
        'Mod-z': undoCommand,
        'Mod-y': redoCommand,
        'Mod-Shift-z': redoCommand,
      }),
    ];
  },
});
