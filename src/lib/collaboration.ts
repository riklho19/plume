import * as Y from 'yjs';
import YPartyKitProvider from 'y-partykit/provider';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999';

const docs = new Map<string, { doc: Y.Doc; provider: YPartyKitProvider }>();

export function getCollaboration(sceneId: string, userName: string, userColor: string) {
  const existing = docs.get(sceneId);
  if (existing) return existing;

  const doc = new Y.Doc();
  const provider = new YPartyKitProvider(PARTYKIT_HOST, `scene-${sceneId}`, doc, {
    connect: true,
  });

  provider.awareness.setLocalStateField('user', {
    name: userName,
    color: userColor,
  });

  const entry = { doc, provider };
  docs.set(sceneId, entry);
  return entry;
}

export function destroyCollaboration(sceneId: string) {
  const entry = docs.get(sceneId);
  if (entry) {
    entry.provider.disconnect();
    entry.provider.destroy();
    entry.doc.destroy();
    docs.delete(sceneId);
  }
}

export function destroyAllCollaborations() {
  for (const [id] of docs) {
    destroyCollaboration(id);
  }
}
