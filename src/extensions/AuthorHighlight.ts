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

    return [
      new Plugin({
        key: new PluginKey('authorHighlightInput'),
        appendTransaction(transactions, _oldState, newState) {
          // Only run when there are actual changes with user steps
          const hasUserInput = transactions.some(
            (tr) => tr.docChanged && !tr.getMeta('remote') && !tr.getMeta('y-sync$')
          );
          if (!hasUserInput) return null;

          const { tr } = newState;
          let modified = false;

          for (const transaction of transactions) {
            for (const step of transaction.steps) {
              const stepMap = step.getMap();
              stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
                if (newEnd > newStart) {
                  const mark = markType.create({ color: authorColor });
                  tr.addMark(newStart, newEnd, mark);
                  modified = true;
                }
              });
            }
          }

          return modified ? tr : null;
        },
      }),
    ];
  },
});
