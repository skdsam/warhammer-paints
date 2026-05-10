import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CreatorChannel {
  id: string;   // UC... channel ID OR @handle — both supported
  name: string;
}

interface FeedState {
  channels: CreatorChannel[];
  addChannel: (channel: CreatorChannel) => void;
  removeChannel: (id: string) => void;
  updateChannel: (id: string, updates: Partial<CreatorChannel>) => void;
}

const DEFAULT_CHANNELS: CreatorChannel[] = [
  { id: 'UC2cnhP7H4576-s3o2651sog', name: 'Squidmar Miniatures' },
  { id: 'UCBR8-60-B28hp2BmDPdntcQ', name: 'Midwinter Minis' },
  { id: 'UCsmD5774MOQhjYBkXqu3Jdw', name: 'Miniac' },
  { id: 'UC1f9gAXbEbcWT_fE8zFBYqA', name: 'Vince Venturella' },
];

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      channels: DEFAULT_CHANNELS,
      addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
      removeChannel: (id) => set((state) => ({ channels: state.channels.filter(c => c.id !== id) })),
      updateChannel: (id, updates) => set((state) => ({
        channels: state.channels.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
    }),
    { name: 'paint-vault-feeds-v4' }
  )
);
