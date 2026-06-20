"use client";

import { SearchX, AlertTriangle, RotateCw } from "lucide-react";
import type { Movie } from "@/types/movie";
import { MovieCard } from "./MovieCard";
import { PER_PAGE } from "@/lib/constants";
import styles from "./MovieGrid.module.css";

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  onOpen: (movie: Movie) => void;
  onRetry?: () => void;
}

export function MovieGrid({
  movies,
  loading,
  error,
  emptyMessage = "No results found.",
  onOpen,
  onRetry,
}: MovieGridProps) {
  // Loading: shimmer skeleton cards matching the 12-per-page layout.
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: PER_PAGE }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skelPoster} />
            <div className={styles.skelBody}>
              <div className={styles.skelLine} />
              <div className={`${styles.skelLine} ${styles.short}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error: visible message with a styled retry, not a blank screen.
  if (error) {
    return (
      <div className={styles.state} role="alert">
        <div className={`${styles.stateIcon} ${styles.errorIcon}`}>
          <AlertTriangle size={30} aria-hidden="true" />
        </div>
        <p className={styles.stateTitle}>Something went wrong</p>
        <p className={styles.stateText}>{error}</p>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            <RotateCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    );
  }

  // Empty: clear "no results" message.
  if (movies.length === 0) {
    return (
      <div className={styles.state}>
        <div className={styles.stateIcon}>
          <SearchX size={30} aria-hidden="true" />
        </div>
        <p className={styles.stateTitle}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onOpen={onOpen} />
      ))}
    </div>
  );
}
