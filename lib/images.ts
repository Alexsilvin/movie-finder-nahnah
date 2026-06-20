// TMDB image helpers. Base URL per the spec: https://image.tmdb.org/t/p/w500

const IMG_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null): string | null {
  return path ? `${IMG_BASE}/w500${path}` : null;
}

export function backdropUrl(path: string | null): string | null {
  return path ? `${IMG_BASE}/w780${path}` : null;
}

// Extract the release year from a TMDB "YYYY-MM-DD" date string.
export function releaseYear(date: string | undefined | null): string {
  if (!date) return "—";
  const year = date.slice(0, 4);
  return year || "—";
}

// One-decimal rating, e.g. 7.8. TMDB ratings are 0–10.
export function formatRating(vote: number | undefined | null): string {
  if (typeof vote !== "number" || Number.isNaN(vote)) return "—";
  return vote.toFixed(1);
}
