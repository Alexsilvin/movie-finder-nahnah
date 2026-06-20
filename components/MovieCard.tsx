"use client";

import Image from "next/image";
import { Star, Film } from "lucide-react";
import type { Movie } from "@/types/movie";
import { posterUrl, releaseYear, formatRating } from "@/lib/images";
import { HeartButton } from "./HeartButton";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
  movie: Movie;
  onOpen: (movie: Movie) => void;
}

export function MovieCard({ movie, onOpen }: MovieCardProps) {
  const poster = posterUrl(movie.poster_path);

  // Open on click or Enter/Space for keyboard users.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(movie);
    }
  };

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title} — view details`}
      onClick={() => onOpen(movie)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.posterWrap}>
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 1000px) 33vw, 220px"
            className={styles.poster}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <Film size={34} />
            <span>No poster</span>
          </div>
        )}

        {/* Gradient overlay + meta revealed on hover/focus */}
        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.overlayMeta}>
            <h3 className={styles.overlayTitle}>{movie.title}</h3>
            <p className={styles.overlayYear}>
              {releaseYear(movie.release_date)}
            </p>
          </div>
        </div>

        {/* Favorite toggle; stops the click from opening the modal. */}
        <div
          className={styles.heart}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <HeartButton movie={movie} />
        </div>

        <span
          className={styles.rating}
          aria-label={`Rating ${formatRating(movie.vote_average)} out of 10`}
        >
          <Star size={12} fill="currentColor" aria-hidden="true" />
          {formatRating(movie.vote_average)}
        </span>
      </div>

      <div className={styles.meta}>
        <h3 className={styles.title} title={movie.title}>
          {movie.title}
        </h3>
        <p className={styles.year}>{releaseYear(movie.release_date)}</p>
      </div>
    </article>
  );
}
