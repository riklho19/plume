import { create } from 'zustand';

interface CollabUser {
  name: string;
  color: string;
  clientId: number;
}

interface CollaborationState {
  connected: boolean;
  users: CollabUser[];

  setConnected: (connected: boolean) => void;
  setUsers: (users: CollabUser[]) => void;
}

export const useCollaborationStore = create<CollaborationState>()((set) => ({
  connected: false,
  users: [],

  setConnected: (connected) => set({ connected }),
  setUsers: (users) => set({ users }),
}));
