import { Extension } from '@tiptap/core';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror';
import { keymap } from '@tiptap/pm/keymap';
import { undo, redo } from 'y-prosemirror';
import type * as Y from 'yjs';
import type { WebsocketProvider } from 'y-partykit/provider';

export interface YjsCollaborationOptions {
  document: Y.Doc;
  provider: WebsocketProvider;
  user: { name: string; color: string };
}

export const YjsCollaboration = Extension.create<YjsCollaborationOptions>({
  name: 'yjsCollaboration',

  addProseMirrorPlugins() {
    const fragment = this.options.document.getXmlFragment('default');
    return [
      ySyncPlugin(fragment),
      yCursorPlugin(this.options.provider.awareness),
      yUndoPlugin(),
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
      }),
    ];
  },
});
