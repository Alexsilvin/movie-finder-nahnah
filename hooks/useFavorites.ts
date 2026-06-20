"use client";

import { useCallback, useEffect, useState } from "react";
import type { Movie } from "@/types/movie";

const STORAGE_KEY = "movie-app:favorites";

// Persist a small subset of fields so favorites can render without a refetch.
export type FavoriteMovie = Pick<
  Movie,
  "id" | "title" | "poster_path" | "release_date" | "vote_average"
>;

function readStorage(): FavoriteMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteMovie[]) : [];
  } catch {
    return [];
  }
}

/**
 * Small favorites store backed by localStorage. Returns the list plus helpers
 * to toggle and query membership. State is kept in sync across the app via a
 * window event so the card and modal toggles always agree.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client only) and listen for cross-instance updates.
  useEffect(() => {
    setFavorites(readStorage());
    setHydrated(true);

    const sync = () => setFavorites(readStorage());
    window.addEventListener("favorites:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((next: FavoriteMovie[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable (private mode) — keep in-memory state.
    }
    // Notify other hook instances in this tab.
    window.dispatchEvent(new Event("favorites:changed"));
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.some((m) => m.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (movie: FavoriteMovie) => {
      const exists = favorites.some((m) => m.id === movie.id);
      const next = exists
        ? favorites.filter((m) => m.id !== movie.id)
        : [
            {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
            },
            ...favorites,
          ];
      persist(next);
    },
    [favorites, persist]
  );

  return { favorites, isFavorite, toggleFavorite, hydrated };
}
