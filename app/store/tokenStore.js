import { create } from 'zustand';

const useTokenStore = create((set) => ({
  tokens: 0,
  setTokens: (tokens) => set({ tokens }),
}));

export default useTokenStore;
