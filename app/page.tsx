"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, Heart, ArrowLeft } from "lucide-react";
import type { Movie, PaginatedMovies } from "@/types/movie";
import { useFavorites } from "@/hooks/useFavorites";
import { SearchBar } from "@/components/SearchBar";
import { MovieGrid } from "@/components/MovieGrid";
import { Pagination } from "@/components/Pagination";
import { MovieModal } from "@/components/MovieModal";
import styles from "./page.module.css";

export default function HomePage() {
  // Search: raw input + debounced value that actually drives fetching.
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Browse / search pagination state.
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedMovies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View toggles + modal.
  const [showFavorites, setShowFavorites] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);

  const { favorites } = useFavorites();

  // Debounce the search term (~400ms).
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => clearTimeout(id);
  }, [term]);

  // Reset to page 1 whenever the active search term changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedTerm]);

  // Fetch browse or search results. Skipped while viewing favorites.
  const requestId = useRef(0);
  const fetchMovies = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const url = debouncedTerm
        ? `/api/search?q=${encodeURIComponent(debouncedTerm)}&page=${page}`
        : `/api/movies?page=${page}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Request failed");
      const json = (await res.json()) as PaginatedMovies;
      // Ignore stale responses from superseded requests.
      if (id === requestId.current) setData(json);
    } catch {
      if (id === requestId.current) {
        setError("Could not load movies. Check your connection and try again.");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [debouncedTerm, page]);

  useEffect(() => {
    if (showFavorites) return;
    void fetchMovies();
  }, [fetchMovies, showFavorites]);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // What the grid renders depends on the active view.
  const isFavView = showFavorites;
  const movies: Movie[] = isFavView
    ? (favorites as unknown as Movie[])
    : data?.results ?? [];

  const emptyMessage = isFavView
    ? "No favorites yet. Tap the heart on any movie to save it here."
    : debouncedTerm
    ? `No results found for “${debouncedTerm}”.`
    : "No movies to show.";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logoMark} aria-hidden="true">
              <Clapperboard size={22} />
            </span>
            <div>
              <h1 className={styles.logo}>Cinephile</h1>
              <p className={styles.tagline}>Discover. Search. Collect.</p>
            </div>
          </div>

          <div className={styles.controls}>
            <SearchBar value={term} onChange={setTerm} />
            <button
              type="button"
              className={`${styles.favToggle} ${
                showFavorites ? styles.favActive : ""
              }`}
              onClick={() => setShowFavorites((v) => !v)}
              aria-pressed={showFavorites ? "true" : "false"}
            >
              <Heart
                size={17}
                fill={showFavorites ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <span className={styles.favLabel}>Favorites</span>
              {favorites.length > 0 && (
                <span className={styles.count}>{favorites.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {!isFavView && !debouncedTerm && (
          <div className={styles.sectionBar}>
            <h2 className={styles.sectionTitle}>Popular Now</h2>
          </div>
        )}

        {!isFavView && debouncedTerm && (
          <div className={styles.sectionBar}>
            <h2 className={styles.sectionTitle}>
              Results for “{debouncedTerm}”
            </h2>
          </div>
        )}

        {isFavView && (
          <div className={styles.sectionBar}>
            <h2 className={styles.sectionTitle}>Your Favorites</h2>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setShowFavorites(false)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to browse
            </button>
          </div>
        )}

        <MovieGrid
          movies={movies}
          loading={isFavView ? false : loading}
          error={isFavView ? null : error}
          emptyMessage={emptyMessage}
          onOpen={setSelected}
          onRetry={fetchMovies}
        />

        {/* Pagination only for browse/search, and only with multiple pages. */}
        {!isFavView && !loading && !error && data && data.results.length > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>Built for Jeevan — NAH NAH SYLVESTRE</p>
        <p className={styles.attribution}>
          Movie data provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            TMDB
          </a>
          .
        </p>
      </footer>

      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
