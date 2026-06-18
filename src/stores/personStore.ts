import { create } from 'zustand';
import type { Person } from '@/data/types';
import { personRepo } from '@/data/repositories';

interface PersonStore {
  persons: Person[];
  me: Person | null;
  loading: boolean;
  loadPersons: () => Promise<void>;
  createPerson: (name: string, initials: string, avatarColor: string, isMe?: boolean) => Promise<Person>;
}

export const usePersonStore = create<PersonStore>((set, get) => ({
  persons: [],
  me: null,
  loading: false,

  loadPersons: async () => {
    set({ loading: true });
    const persons = await personRepo.getAll();
    const me = await personRepo.getMe();
    set({ persons, me, loading: false });
  },

  createPerson: async (name, initials, avatarColor, isMe = false) => {
    const person = await personRepo.create({ name, initials, avatarColor, isMe });
    await get().loadPersons();
    return person;
  },
}));
