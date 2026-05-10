import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CreatorChannel {
  id: string; // The YouTube channel ID
  name: string;
}

interface FeedState {
  channels: CreatorChannel[];
  addChannel: (channel: CreatorChannel) => void;
  removeChannel: (id: string) => void;
}

const DEFAULT_CHANNELS: CreatorChannel[] = [
  { id: 'UCuqrG-w5d3d4u2_Qv8w45sg', name: 'Duncan Rhodes Painting Academy' },
  { id: 'UC2cnhP7H4576-s3o2651sog', name: 'Squidmar Miniatures' },
  { id: 'UC4Pq5sR4c85N-d0T2GkKq7w', name: 'Ninjon' },
  { id: 'UCBR8-60-B28hp2BmDPdntcQ', name: 'Midwinter Minis' },
  { id: 'UCsmD5774MOQhjYBkXqu3Jdw', name: 'Miniac' },
  { id: 'UC1f9gAXbEbcWT_fE8zFBYqA', name: 'Vince Venturella' },
  { id: 'UC4v10S4_c6p3VpG-d9vS7-A', name: 'Artis Opus' }
];

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      channels: DEFAULT_CHANNELS,
      addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
      removeChannel: (id) => set((state) => ({ channels: state.channels.filter(c => c.id !== id) })),
    }),
    { name: 'paint-vault-feeds-v2' }
  )
);
