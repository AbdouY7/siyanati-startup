import { create } from "zustand";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../services/favoriteService";

const useFavoriteStore = create((set, get) => ({
  // --- State ---
  favorites: {
    stores: { data: [], total: 0, page: 1, total_pages: 1, loading: false },
    professionals: {
      data: [],
      total: 0,
      page: 1,
      total_pages: 1,
      loading: false,
    },
    parts: { data: [], total: 0, page: 1, total_pages: 1, loading: false },
  },
  favoritedIds: {}, // { "store_abc123": true, "professional_xyz": true }
  actionLoading: {}, // { "store_abc123": true } — per-item toggle loading

  // --- Load favorites by type (for profile tabs) ---
  loadFavorites: async (targetType, page = 1) => {
    const key = `${targetType}s`; // "stores" | "professionals" | "parts"

    set((state) => ({
      favorites: {
        ...state.favorites,
        [key]: { ...state.favorites[key], loading: true },
      },
    }));

    try {
      const result = await getFavorites({
        target_type: targetType,
        page,
        limit: 20,
      });

      set((state) => ({
        favorites: {
          ...state.favorites,
          [key]: {
            data:
              page === 1
                ? result.favorites
                : [...state.favorites[key].data, ...result.favorites],
            total: result.total,
            page: result.page,
            total_pages: result.total_pages,
            loading: false,
          },
        },
      }));
    } catch {
      set((state) => ({
        favorites: {
          ...state.favorites,
          [key]: { ...state.favorites[key], loading: false },
        },
      }));
    }
  },

  // --- Check if a single item is favorited ---
  checkIsFavorited: async (targetId, targetType) => {
    const key = `${targetType}_${targetId}`;
    try {
      const result = await checkFavorite(targetId, targetType);
      set((state) => ({
        favoritedIds: { ...state.favoritedIds, [key]: result.is_favorite },
      }));
    } catch {
      // fail silently — button stays in default state
    }
  },

  // --- Toggle favorite (add or remove) ---
  toggleFavorite: async (targetId, targetType) => {
    const key = `${targetType}_${targetId}`;
    const isFav = get().favoritedIds[key];

    // Optimistic update
    set((state) => ({
      favoritedIds: { ...state.favoritedIds, [key]: !isFav },
      actionLoading: { ...state.actionLoading, [key]: true },
    }));

    try {
      if (isFav) {
        await removeFavorite(targetId, targetType);
      } else {
        await addFavorite(targetId, targetType);
      }
    } catch {
      // Rollback on failure
      set((state) => ({
        favoritedIds: { ...state.favoritedIds, [key]: isFav },
      }));
    } finally {
      set((state) => ({
        actionLoading: { ...state.actionLoading, [key]: false },
      }));
    }
  },

  // --- Selectors (use these in components) ---
  isFavorited: (targetId, targetType) => {
    return !!get().favoritedIds[`${targetType}_${targetId}`];
  },

  isToggling: (targetId, targetType) => {
    return !!get().actionLoading[`${targetType}_${targetId}`];
  },
}));

export default useFavoriteStore;
