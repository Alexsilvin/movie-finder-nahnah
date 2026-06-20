#  Movie Discovery App

A movie discovery web app built with **Next.js (App Router) + TypeScript**. Browse popular films, search by title, view full details in an expandable modal, and save favorites that persist across reloads. All movie data comes from **[The Movie Database (TMDB)](https://www.themoviedb.org/) API (v3)**.

## Features

- **Browse grid** of popular movies — poster, title, release year, and rating (one decimal).
- **Manual pagination** with Next / Previous buttons — **exactly 12 results per page** (no infinite scroll).
- **Debounced search** (~400ms) by title, paginated the same way; clearing the box returns to browse.
- **Expandable modal** with poster, title, year, rating, and overview. Expanding lazy-loads genres, runtime, tagline, and a backdrop image. Dismissible via close button, backdrop click, or `Escape`; locks body scroll.
- **Favorites** — toggle from the card or the modal, persisted in `localStorage`, with a Favorites view.
- **Loading / error / empty** states handled visibly everywhere (browse, search, and modal details).
- Responsive, keyboard-accessible cards.

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **CSS Modules** + a single `globals.css` (no UI library)
- **TMDB API v3** accessed only through server-side Route Handlers

## Architecture & Design Decisions

- **The TMDB API key stays server-side.** The browser only ever calls our own `/api/...` Route Handlers, which read `process.env.TMDB_API_KEY` and call TMDB. The key is never shipped to the client (no `NEXT_PUBLIC_` exposure).

  | Route | Purpose |
  | --- | --- |
  | `GET /api/movies?page=N` | Popular movies, paginated at 12/page |
  | `GET /api/search?q=TERM&page=N` | Search by title, paginated at 12/page |
  | `GET /api/movies/[id]` | Full details for the modal |

- **12-per-page offset logic.** TMDB returns 20 results per page, so 12/page does not map 1:1. For UI page `N` we need result indices `(N-1)*12 … N*12-1`. Those can straddle two TMDB pages, so the route handler fetches every covering TMDB page, concatenates, and slices exactly 12 items. `totalPages = ceil(totalResults / 12)`, clamped to what TMDB can serve (it caps at 500 pages / 10,000 results) to avoid empty pages. See [`lib/tmdb.ts`](lib/tmdb.ts).

- **Component structure** — separate components for the grid, card, modal, pagination, search bar, and favorite button, plus a small `useFavorites` hook.

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Alexsilvin/movie-finder-nahnah.git
cd "Movie app"
npm install
```

### 2. Add your TMDB API key

Create a `.env.local` file in the project root (an example is provided in `.env.example`):

```bash
TMDB_API_KEY=your_key_here
```

> **How to get a key:** create a free account at [themoviedb.org](https://www.themoviedb.org/), then go to **Settings → API** (<https://www.themoviedb.org/settings/api>) and request an API key (v3 auth). Paste the **API Key (v3 auth)** value into `.env.local`.

`.env.local` is git-ignored, so your key is never committed.

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## Deployment (Vercel)

Push the repo to GitHub and import it into [Vercel](https://vercel.com/). **You must set the same environment variable in the deployment platform:** in the Vercel project, add **`TMDB_API_KEY`** (Settings → Environment Variables) with your key. Without it the API routes will fail in production exactly as they would locally.

## Project Structure

```
app/
  api/
    movies/route.ts        # GET /api/movies?page=N
    movies/[id]/route.ts   # GET /api/movies/[id]
    search/route.ts        # GET /api/search?q=&page=N
  layout.tsx
  page.tsx                 # home: search + grid + pagination + favorites + modal
  globals.css
components/                # MovieGrid, MovieCard, MovieModal, Pagination, SearchBar, HeartButton
hooks/useFavorites.ts      # localStorage-backed favorites
lib/                       # tmdb.ts (offset logic), images.ts, constants.ts
types/movie.ts
```
