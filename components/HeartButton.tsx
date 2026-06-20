"use client";

import { Heart } from "lucide-react";
import { useFavorites, type FavoriteMovie } from "@/hooks/useFavorites";
import styles from "./HeartButton.module.css";

interface HeartButtonProps {
  movie: FavoriteMovie;
  withLabel?: boolean;
}

// Toggleable favorite control, reused on both the card and the modal.
export function HeartButton({ movie, withLabel = false }: HeartButtonProps) {
  const { isFavorite, toggleFavorite, hydrated } = useFavorites();
  const active = hydrated && isFavorite(movie.id);

  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ""} ${
        withLabel ? styles.labeled : ""
      }`}
      aria-pressed={active ? "true" : "false"}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
      onClick={() => toggleFavorite(movie)}
    >
      <Heart
        size={withLabel ? 18 : 17}
        className={styles.icon}
        fill={active ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {withLabel && (
        <span className={styles.label}>
          {active ? "Favorited" : "Add to favorites"}
        </span>
      )}
    </button>
  );
}
