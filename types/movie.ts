// Shared TMDB-related types used across the app.

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

// Full details returned by /api/movies/[id].
export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
}

// Shape returned by our paginated routes (/api/movies and /api/search).
export interface PaginatedMovies {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}
