import type { Movie, MovieDetails, PaginatedMovies } from "@/types/movie";

// Server-side TMDB client. The API key is read from process.env and is NEVER
// sent to the browser — every TMDB call happens inside Route Handlers.

const TMDB_BASE = "https://api.themoviedb.org/3";

// UI-facing page size required by the spec — exactly 12 per page.
export const PER_PAGE = 12;

// TMDB always returns 20 results per page.
const TMDB_PAGE_SIZE = 20;

// TMDB only serves pages 1..500, i.e. a hard ceiling of 10,000 results.
// We clamp to this to avoid requesting empty / out-of-range pages.
const MAX_ACCESSIBLE_RESULTS = 500 * TMDB_PAGE_SIZE; // 10,000

interface TmdbListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  return key;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    // Cache TMDB responses briefly; they change rarely.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}): ${path}`);
  }

  return (await res.json()) as T;
}

// Compute totalPages = ceil(totalResults / 12), clamped to what TMDB can serve.
function computeTotalPages(totalResults: number): number {
  const accessible = Math.min(totalResults, MAX_ACCESSIBLE_RESULTS);
  const ceil = Math.ceil(accessible / PER_PAGE);
  // Never advertise a UI page whose results would fall beyond TMDB page 500.
  const hardCap = Math.floor(MAX_ACCESSIBLE_RESULTS / PER_PAGE); // 833
  return Math.max(1, Math.min(ceil, hardCap));
}

/**
 * Core offset logic shared by browse + search.
 *
 * For UI page N (1-based) we need result indices (N-1)*12 .. N*12-1.
 * Because TMDB pages hold 20 items, those 12 indices may straddle two TMDB
 * pages, so we fetch every TMDB page that covers the window, concatenate, and
 * slice exactly 12 items out.
 */
async function paginate(
  path: string,
  uiPage: number,
  extraParams: Record<string, string | number> = {}
): Promise<PaginatedMovies> {
  const page = Math.max(1, Math.floor(uiPage) || 1);

  const startIndex = (page - 1) * PER_PAGE;
  const endIndex = page * PER_PAGE - 1;

  const firstTmdbPage = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1;
  const lastTmdbPage = Math.floor(endIndex / TMDB_PAGE_SIZE) + 1;

  // Fetch all covering TMDB pages (usually 1, occasionally 2).
  const pageNumbers: number[] = [];
  for (let p = firstTmdbPage; p <= lastTmdbPage; p++) {
    pageNumbers.push(p);
  }

  const responses = await Promise.all(
    pageNumbers.map((p) =>
      tmdbFetch<TmdbListResponse>(path, { ...extraParams, page: p })
    )
  );

  const totalResults = responses[0]?.total_results ?? 0;
  const combined = responses.flatMap((r) => r.results ?? []);

  // Offset of our window within the first fetched TMDB page.
  const sliceStart = startIndex - (firstTmdbPage - 1) * TMDB_PAGE_SIZE;
  const results = combined.slice(sliceStart, sliceStart + PER_PAGE);

  return {
    page,
    results,
    totalPages: computeTotalPages(totalResults),
    totalResults,
  };
}

// Popular movies, paginated at exactly 12 per UI page.
export function getPopularMovies(uiPage: number): Promise<PaginatedMovies> {
  return paginate("/movie/popular", uiPage);
}

// Search by title, paginated at exactly 12 per UI page.
export function searchMovies(
  query: string,
  uiPage: number
): Promise<PaginatedMovies> {
  return paginate("/search/movie", uiPage, {
    query,
    include_adult: "false",
  });
}

// Full details for one movie (used by the expandable modal).
export function getMovieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${id}`);
}
