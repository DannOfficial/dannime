import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'dark',
      favorites: [],
      watchHistory: [],
      
      setUser: (user) => set({ 
        user,
        favorites: user?.favorites || [],
        watchHistory: user?.watchHistory || []
      }),
      
      updateUserXP: (xp, level, role) => set((state) => ({
        user: state.user ? { ...state.user, xp, level, role } : null
      })),
      
      logout: () => set({ user: null, favorites: [], watchHistory: [] }),
      
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      setFavorites: (favorites) => set({ favorites }),
      addFavorite: (animeSlug) => set((state) => ({ 
        favorites: [...state.favorites, animeSlug] 
      })),
      removeFavorite: (animeSlug) => set((state) => ({ 
        favorites: state.favorites.filter(slug => slug !== animeSlug) 
      })),
      
      setWatchHistory: (history) => set({ watchHistory: history }),
      addToHistory: (item) => set((state) => ({ 
        watchHistory: [item, ...state.watchHistory.filter(
          h => !(h.animeSlug === item.animeSlug && h.episodeId === item.episodeId)
        )] 
      })),
    }),
    {
      name: 'dannime-storage',
    }
  )
);

export default useStore;
