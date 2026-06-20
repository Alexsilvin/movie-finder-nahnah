import { NextResponse } from "next/server";
import { getPopularMovies } from "@/lib/tmdb";

// GET /api/movies?page=N — popular movies, paginated at 12 per page.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;

  try {
    const data = await getPopularMovies(page);
    return NextResponse.json(data);
  } catch (err) {
    console.error("/api/movies error:", err);
    return NextResponse.json(
      { error: "Failed to load movies." },
      { status: 500 }
    );
  }
}
