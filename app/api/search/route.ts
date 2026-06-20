import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

// GET /api/search?q=TERM&page=N — search by title, paginated at 12 per page.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  // No query → nothing to search; return an empty, well-formed payload.
  if (!query) {
    return NextResponse.json({
      page: 1,
      results: [],
      totalPages: 1,
      totalResults: 0,
    });
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (err) {
    console.error("/api/search error:", err);
    return NextResponse.json(
      { error: "Failed to search movies." },
      { status: 500 }
    );
  }
}
