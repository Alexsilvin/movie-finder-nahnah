# AI Log

## Tools Used

- **Claude Code** (Anthropic's CLI, Opus model) — scaffolding the Next.js App Router project, writing the TMDB route handlers, components, and the pagination offset logic.
- **VSCode** — editing, running the dev server, and manual testing in the browser.
- **TMDB API (v3)** documentation — referenced for endpoint shapes (`/movie/popular`, `/search/movie`, `/movie/{id}`) and image base URLs.

## Best Prompts

1. **"Implement 12-per-page pagination over TMDB's 20-per-page API with correct offset math — a single UI page may span two TMDB pages; fetch the covering pages, concatenate, and slice exactly 12."**
   Why it worked: it stated the exact edge case (the 12↔20 mismatch) instead of just asking for "pagination," so the generated code fetched multiple TMDB pages and sliced a window rather than naively mapping page 1:1.

2. **"Keep the TMDB API key server-side only — the browser must call our own `/api/...` route handlers, which read `process.env.TMDB_API_KEY`. Never expose the key to the client."**
   Why it worked: framing the security constraint up front pushed all `fetch` calls behind route handlers in `app/api/` and kept the key out of any client component or `NEXT_PUBLIC_` var.

3. **"Build the details view as a modal (not a route) that is dismissible via close button, backdrop click, and Escape, locks body scroll, and has an Expand control that lazy-fetches genres/runtime/tagline/backdrop from `/api/movies/[id]`."**
   Why it worked: it enumerated every dismissal path and the lazy-fetch-on-expand behavior, so the modal handled all of them in one pass instead of needing follow-ups.

## What I Fixed Manually

The first version of the favorites toggle only updated the component instance that was clicked, so favoriting from a card did not update the heart inside the modal (or vice versa) until a reload. I fixed this by hand: the `useFavorites` hook now writes to `localStorage` and dispatches a custom `favorites:changed` window event, and every hook instance listens for that event (plus the native `storage` event for other tabs) and re-reads storage — so all hearts stay in sync immediately. I also added an SSR guard (`typeof window === "undefined"`) and a `hydrated` flag to avoid a hydration mismatch on first paint. UI components where outdated or depricated like the  corrupted `.next` cache — the telltale signs are Cannot find module './548.js' and references to pages/_document.js.
