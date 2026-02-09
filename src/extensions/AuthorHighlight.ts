import { Mark, mergeAttributes } from '@tiptap/core';

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

});
