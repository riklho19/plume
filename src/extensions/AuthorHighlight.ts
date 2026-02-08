import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface AuthorHighlightOptions {
  authorColor: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    authorHighlight: {
      setAuthorHighlight: (color: string) => ReturnType;
      unsetAuthorHighlight: () => ReturnType;
      mergeAuthors: () => ReturnType;
    };
  }
}

export const AuthorHighlight = Mark.create<AuthorHighlightOptions>({
  name: 'authorHighlight',

  addOptions() {
    return { authorColor: null };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-author-color'),
        renderHTML: (attrs) => {
          if (!attrs.color) return {};
          return {
            'data-author-color': attrs.color,
            style: `color: ${attrs.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-author-color]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setAuthorHighlight:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),

      unsetAuthorHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),

      mergeAuthors:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.doc.descendants((node, pos) => {
              if (node.isText) {
                const mark = node.marks.find((m) => m.type.name === 'authorHighlight');
                if (mark) {
                  tr.removeMark(pos, pos + node.nodeSize, mark.type);
                }
              }
            });
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const authorColor = this.options.authorColor;
    if (!authorColor) return [];

    const markType = this.type;
    const authorMark = markType.create({ color: authorColor });

    return [
      new Plugin({
        key: new PluginKey('authorHighlightInput'),
        appendTransaction(_transactions, _oldState, newState) {
          // Ensure author highlight mark is always active for new input
          // This works like bold/italic: stored marks determine what marks
          // the next typed character will have
          const stored = newState.storedMarks || newState.selection.$from.marks();
          const has = stored.some((m) => m.type === markType);
          if (has) return null;
          return newState.tr.setStoredMarks([...stored, authorMark]);
        },
      }),
    ];
  },
});
