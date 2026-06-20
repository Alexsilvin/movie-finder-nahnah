"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  Star,
  Maximize2,
  Minimize2,
  Clock,
  Clapperboard,
  AlertTriangle,
} from "lucide-react";
import type { Movie, MovieDetails } from "@/types/movie";
import {
  posterUrl,
  backdropUrl,
  releaseYear,
  formatRating,
} from "@/lib/images";
import { HeartButton } from "./HeartButton";
import styles from "./MovieModal.module.css";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

function formatRuntime(min: number | null): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const poster = posterUrl(movie.poster_path);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Dismiss on Escape; move initial focus to the close button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/movies/${movie.id}`);
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as MovieDetails;
      setDetails(data);
    } catch {
      setError("Could not load full details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [movie.id]);

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    // Fetch full details the first time we expand.
    if (next && !details && !loading) {
      void loadDetails();
    }
  };

  const backdrop = backdropUrl(details?.backdrop_path ?? movie.backdrop_path);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={movie.title}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${expanded ? styles.expanded : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Backdrop banner with blurred/darkened image */}
        <div className={styles.banner}>
          {backdrop ? (
            <Image
              src={backdrop}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 760px"
              className={styles.bannerImg}
              priority
            />
          ) : (
            <div className={styles.bannerFallback} aria-hidden="true" />
          )}
          <div className={styles.bannerScrim} aria-hidden="true" />
        </div>

        <div className={styles.body}>
          <div className={styles.posterCol}>
            {poster ? (
              <Image
                src={poster}
                alt={`${movie.title} poster`}
                width={150}
                height={225}
                className={styles.poster}
              />
            ) : (
              <div className={styles.posterPlaceholder}>No poster</div>
            )}
          </div>

          <div className={styles.info}>
            <h2 className={styles.title}>{movie.title}</h2>
            <div className={styles.subline}>
              <span>{releaseYear(movie.release_date)}</span>
              <span className={styles.dot} aria-hidden="true">
                •
              </span>
              <span className={styles.rating}>
                <Star size={14} fill="currentColor" aria-hidden="true" />
                {formatRating(movie.vote_average)}
              </span>
            </div>

            <div className={styles.actions}>
              <HeartButton movie={movie} withLabel />
              <button
                type="button"
                className={styles.expandBtn}
                onClick={handleExpand}
                aria-expanded={expanded ? "true" : "false"}
              >
                {expanded ? (
                  <Minimize2 size={16} aria-hidden="true" />
                ) : (
                  <Maximize2 size={16} aria-hidden="true" />
                )}
                {expanded ? "Collapse" : "Expand details"}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded-only metadata */}
        {expanded && (
          <div className={styles.extra} aria-live="polite">
            {loading && (
              <div className={styles.detailSkeleton} aria-hidden="true">
                <div className={`${styles.skelLine} ${styles.skelW60}`} />
                <div className={styles.skelChips}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.skelLine} />
                <div className={`${styles.skelLine} ${styles.skelW85}`} />
              </div>
            )}

            {error && (
              <p className={styles.errorText} role="alert">
                <AlertTriangle size={16} aria-hidden="true" />
                {error}{" "}
                <button
                  type="button"
                  className={styles.retryInline}
                  onClick={loadDetails}
                >
                  Retry
                </button>
              </p>
            )}

            {details && !loading && !error && (
              <>
                {details.tagline && (
                  <p className={styles.tagline}>“{details.tagline}”</p>
                )}

                {details.genres.length > 0 && (
                  <div className={styles.genres}>
                    {details.genres.map((g) => (
                      <span key={g.id} className={styles.chip}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.facts}>
                  <span className={styles.fact}>
                    <Clock size={15} aria-hidden="true" />
                    {formatRuntime(details.runtime)}
                  </span>
                  <span className={styles.fact}>
                    <Clapperboard size={15} aria-hidden="true" />
                    {details.genres.length
                      ? `${details.genres.length} genre${
                          details.genres.length > 1 ? "s" : ""
                        }`
                      : "—"}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className={styles.overviewWrap}>
          <h3 className={styles.overviewHeading}>Overview</h3>
          <p className={styles.overview}>
            {movie.overview || "No overview available."}
          </p>
        </div>
      </div>
    </div>
  );
}
